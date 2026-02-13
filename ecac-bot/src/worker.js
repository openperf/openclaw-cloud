const path = require('path');
const os = require('os');
const fs = require('fs');
const { spawnSync } = require('child_process');
require('dotenv').config();

const APIClient = require('./apiClient');
const { run } = require('./bot');

// ===== CONFIGURAÇÕES DA API =====
const API_BASE_URL = process.env.API_BASE_URL || '';
const BOT_TOKEN = process.env.BOT_TOKEN || '';

if (!API_BASE_URL || !BOT_TOKEN) {
  console.error('Configure API_BASE_URL e BOT_TOKEN no .env');
  process.exit(1);
}

// ===== CONFIGURAÇÕES DO WORKER =====
const POLLING_INTERVAL = parseInt(process.env.POLLING_INTERVAL || '60', 10) * 1000; // converter para ms
const MAX_WORKERS = parseInt(process.env.MAX_WORKERS || '2', 10);
const ECAC_TIMEOUT = parseInt(process.env.ECAC_TIMEOUT || '120', 10) * 1000; // converter para ms
const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';
const LOG_FILE = process.env.LOG_FILE || './logs/bot.log';
const SCREENSHOTS_DIR = process.env.SCREENSHOTS_DIR || './screenshots';

// Criar diretórios se não existirem
const logDir = path.dirname(LOG_FILE);
if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true });
if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });

const api = new APIClient(API_BASE_URL, BOT_TOKEN);

async function processOne(item) {
  console.log('[WORKER] Processing', item.id || '(no-id)');

  // Prefer certificate info from item
  let cert_local = null;
  try {
    const cert_info = item.certificado || item.certificado_contador || null;
    if (cert_info && typeof cert_info === 'object') {
      const storage_path = cert_info.path || cert_info.storage_path;
      const senha = cert_info.senha || cert_info.password || '';
      const empresa_id = (item.empresa && item.empresa.id) ? String(item.empresa.id) : String(item.id || 'noid');
      if (storage_path) {
        // On Windows, prefer using the PowerShell fetch+import helper which also imports via certutil
        if (process.platform === 'win32') {
          try {
            const fetchScript = path.join(__dirname, '..', 'win_fetch_and_import_pfx.ps1');
            if (fs.existsSync(fetchScript)) {
              console.log('[WORKER] Using PowerShell fetch+import for PFX...');
              const args = ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', fetchScript, '-StoragePath', storage_path, '-ApiBase', API_BASE_URL, '-BotToken', BOT_TOKEN];
              // If cert has password, pass it
              const senha = cert_info.senha || cert_info.password || '';
              if (senha) args.push('-Password', String(senha));
              const r = spawnSync('powershell', args, { encoding: 'utf8', timeout: 180000 });
              console.log('[WORKER] fetch powershell stdout:', r.stdout);
              console.log('[WORKER] fetch powershell stderr:', r.stderr);
              if (r.status === 0) {
                // PowerShell prints the temp path as last output line; try to capture it
                const out = (r.stdout || '').trim().split(/\r?\n/).filter(Boolean);
                if (out.length) {
                  const candidate = out[out.length - 1].trim();
                  if (fs.existsSync(candidate)) {
                    cert_local = candidate;
                    console.log('[WORKER] PFX fetched to', cert_local);
                  }
                }
              } else {
                console.warn('[WORKER] PowerShell fetch script failed with code', r.status);
              }
            }
          } catch (e) {
            console.warn('[WORKER] PowerShell fetch failed', e.message || e);
          }
        }

        // Fallback to Node download if not obtained
        if (!cert_local) {
          cert_local = await api.download_certificate(storage_path, empresa_id);
        }
        if (cert_local) {
          console.log('[WORKER] Certificate saved to', cert_local);
          // If running on Windows, try import via certutil
          if (process.platform === 'win32' && senha) {
            try {
              console.log('[WORKER] Importing certificate into Windows store (user)...');
              const r = spawnSync('certutil', ['-f', '-user', '-p', String(senha), '-importpfx', cert_local], { encoding: 'utf8' });
              console.log('[WORKER] certutil stdout:', r.stdout);
              console.log('[WORKER] certutil stderr:', r.stderr);
            } catch (e) {
              console.warn('[WORKER] certutil import failed:', e.message);
            }
          } else {
            console.log('[WORKER] Non-Windows platform or no password — you may need to import the PFX manually into the OS/browser.');
          }
        }
        // attach local path to item for bot
        item._pfx_local = cert_local;
      }
    }
  } catch (e) {
    console.error('[WORKER] certificate handling failed', e);
  }

  // Run bot for this consulta
  try {
    let helperProc = null;
    // On Windows, try to start Python helper to watch/select certificate when popup appears
    if (process.platform === 'win32' && cert_local) {
      try {
        const helperPath = path.join(__dirname, '..', 'win_cert_helper.py');
        const importScript = path.join(__dirname, '..', 'win_import_pfx.ps1');
        const senha = (item.certificado && (item.certificado.senha || item.certificado.password)) || (item.certificado_contador && (item.certificado_contador.senha || item.certificado_contador.password)) || '';
        const terms = [];
        if (item.certificado_contador) {
          ['nome', 'cn', 'cpf', 'cnpj'].forEach(k => { if (item.certificado_contador[k]) terms.push(String(item.certificado_contador[k])); });
        }
        const cnpj = (item.empresa && item.empresa.cnpj) || (item.parametros && item.parametros.cnpj);
        if (cnpj) terms.push(String(cnpj));

        // First try to run PowerShell import script (certutil wrapper)
        try {
          if (fs.existsSync(importScript)) {
            console.log('[WORKER] Running PowerShell import script...');
            const r = spawnSync('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', importScript, '-PfxPath', cert_local, '-Password', String(senha)], { encoding: 'utf8', timeout: 120000 });
            console.log('[WORKER] powershell stdout:', r.stdout);
            console.log('[WORKER] powershell stderr:', r.stderr);
          }
        } catch (e) {
          console.warn('[WORKER] PowerShell import failed:', e.message || e);
        }

        const spawn = require('child_process').spawn;
        const helperArgs = [helperPath];
        helperArgs.push('--pfx', cert_local);
        if (senha) helperArgs.push('--pass', String(senha));
        if (terms.length) helperArgs.push('--terms', terms.join(','));
        helperArgs.push('--timeout', '120');

        helperProc = spawn('python', helperArgs, { stdio: 'inherit' });
        console.log('[WORKER] Started Windows helper pid=', helperProc.pid);
      } catch (e) {
        console.warn('[WORKER] could not start windows helper:', e.message || e);
      }
    }

    await run(item);
    console.log('[WORKER] run completed for', item.id);
    await api.send_result(item.id, 'OK', { page_url: 'see artifacts', success: true });

    // cleanup helper
    try {
      if (helperProc && !helperProc.killed) {
        helperProc.kill();
        console.log('[WORKER] Killed helper process');
      }
    } catch (e) {}
  } catch (e) {
    console.error('[WORKER] run error for', item.id, e);
    await api.send_result(item.id, 'ERROR', { error: String(e) });
  }
}

async function loop() {
  console.log('[WORKER] polling API', API_BASE_URL);
  try {
    const pending = await api.get_pending();
    if (!pending || pending.length === 0) {
      console.log('[WORKER] no pending consults');
      return;
    }
    for (const item of pending) {
      try {
        await processOne(item);
      } catch (e) {
        console.error('[WORKER] processOne failed', e);
      }
    }
  } catch (e) {
    console.error('[WORKER] main loop error', e);
  }
}

(async () => {
  try {
    while (true) {
      await loop();
      const intervalSec = POLLING_INTERVAL / 1000;
      console.log(`[WORKER] Aguardando ${intervalSec}s antes da próxima verificação...`);
      await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
    }
  } catch (e) {
    console.error('[WORKER] fatal', e);
    process.exit(1);
  }
})();
