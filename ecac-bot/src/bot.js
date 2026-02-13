const fs = require('fs');
const readline = require('readline');
const { chromium } = require('playwright');

const ECAC_URL = 'https://cav.receita.fazenda.gov.br/autenticacao/login';

function waitForEnter(prompt) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => rl.question(prompt, () => { rl.close(); resolve(); }));
}

async function run(consulta) {
  const username = process.env.ECAC_USERNAME;
  const password = process.env.ECAC_PASSWORD;
  const desiredProfile = process.env.ECAC_PROFILE || 'Procurador';
  const headless = String(process.env.HEADLESS || 'false') === 'true';

  if (!consulta && (!username || !password)) {
    throw new Error('Defina ECAC_USERNAME e ECAC_PASSWORD no .env ou variáveis de ambiente, ou passe uma consulta com credenciais.');
  }

  // Se consulta fornecida contém _pfx_local, tente usar
  const pfxLocal = consulta && (consulta._pfx_local || (consulta.certificado && consulta.certificado.local_path));
  const pfxPassword = consulta && (consulta.certificado && (consulta.certificado.senha || consulta.certificado.password));
  let browser = null;
  let context = null;
  let page = null;

  const userDataDir = process.env.BROWSER_USER_DATA_DIR || null;
  if (userDataDir) {
    console.log('[BOT] Iniciando contexto persistente em', userDataDir);
    context = await chromium.launchPersistentContext(userDataDir, { headless, args: ['--start-maximized'], viewport: null });
    page = context.pages().length ? context.pages()[0] : await context.newPage();
  } else {
    browser = await chromium.launch({ headless, args: ['--start-maximized'] });
    context = await browser.newContext({ viewport: null });
    page = await context.newPage();
  }

  console.log('Acessando e-CAC...');
  await page.goto(ECAC_URL, { waitUntil: 'networkidle' });

  // NOTE: os seletores abaixo são exemplos — o e-CAC pode mudar. Ajuste conforme necessário.
  try {
    // Se existe certificado local, logar via certificado pode exigir import no OS.
    if (pfxLocal) {
      console.log('[BOT] Certificado local encontrado:', pfxLocal);
      if (process.platform === 'win32' && pfxPassword) {
        console.log('[BOT] Se necessário, o certificado já pode ter sido importado pelo worker (certutil).');
      } else {
        console.log('[BOT] Import manual do PFX pode ser necessário neste sistema para autenticação por certificado.');
      }
    }

    // Tentativa robusta de localizar campos de login (vários seletores possíveis)
    const userSelectors = ['input[name="cnpjcpf"]', 'input#cpf', 'input[name="cpfcnpj"]', 'input[type="text"]'];
    const passSelectors = ['input[name="passwd"]', 'input[type="password"]', 'input#senha'];

    let filledUser = false;
    for (const sel of userSelectors) {
      try {
        await page.fill(sel, username);
        filledUser = true;
        break;
      } catch (e) {}
    }

    let filledPass = false;
    for (const sel of passSelectors) {
      try {
        await page.fill(sel, password);
        filledPass = true;
        break;
      } catch (e) {}
    }

    // Tentar submeter de forma resiliente
    try {
      await Promise.all([
        page.click('button[type="submit"]').catch(() => {}),
        page.click('button:has-text("Entrar")').catch(() => {}),
        page.waitForNavigation({ waitUntil: 'networkidle', timeout: 15000 }).catch(() => {}),
      ]);
    } catch (e) {}

    // Salvar screenshot e HTML para depuração
    await page.screenshot({ path: 'ecac-login-after-submit.png', fullPage: true }).catch(() => {});
    const html = await page.content();
    fs.writeFileSync('ecac-login-after-submit.html', html);

    console.log('Login submetido (ou tentativa feita). Se o site pedir MFA/dupla autenticação, complete manualmente no browser.');

    if (!headless) {
      console.log('Aguardando confirmação manual de MFA (pressione Enter após concluir)...');
      await waitForEnter('Pressione Enter aqui quando estiver autenticado no e-CAC...');
    } else {
      console.log('Rodando em headless: se houver MFA, o fluxo pode falhar.');
      // tentar detectar elemento que indica login bem-sucedido
      try {
        await page.waitForSelector('text=Sair', { timeout: 5000 });
      } catch (e) {
        console.warn('Não detectei claramente o indicador de sessão ativa. Verifique ecac-login-after-submit.png.');
      }
    }

    // Após autenticação, salvar nova captura para entender a UI
    await page.screenshot({ path: 'ecac-after-auth.png', fullPage: true }).catch(() => {});

    // Procurar opções de perfil — abordagens variadas
    console.log('Procurando elementos relacionados a perfil/permissões...');
    const profileTextCandidates = [desiredProfile, 'Procurador', 'Perfil', 'Perfil e Acessos', 'Acessos'];

    // Abrir menus prováveis (tenta vários seletores)
    const menuCandidates = ['button[aria-label*="menu"]', 'button[aria-label*="Usuário"]', 'button[title*="Perfil"]', 'button:has-text("Acessos")', 'text=Menu'];
    for (const sel of menuCandidates) {
      try {
        const loc = page.locator(sel).first();
        if (await loc.count()) {
          await loc.click().catch(() => {});
          await page.waitForTimeout(500);
        }
      } catch (e) {}
    }

    // Procurar o texto do perfil desejado em qualquer elemento clicável
    let found = false;
    for (const txt of profileTextCandidates) {
      try {
        const loc = page.locator(`text=${txt}`);
        if (await loc.count()) {
          // clicar no primeiro que parece relevante
          await loc.first().click().catch(() => {});
          console.log(`Clicado em elemento com texto: ${txt}`);
          found = true;
          break;
        }
      } catch (e) {}
    }

    // Se encontrou um menu de perfil, tentar salvar confirmação
    await page.screenshot({ path: 'ecac-after-profile-click.png', fullPage: true }).catch(() => {});

    if (!found) {
      console.log('Não encontrei automaticamente o perfil. Veja screenshots geradas e ajuste seletores em src/bot.js.');
    } else {
      // tentar clicar em salvar/confirmar se existir
      const confirmCandidates = ['button:has-text("Salvar")', 'button:has-text("Confirmar")', 'button:has-text("OK")', 'button[title*="Salvar"]'];
      for (const sel of confirmCandidates) {
        try {
          const el = page.locator(sel).first();
          if (await el.count()) {
            await el.click().catch(() => {});
            console.log('Cliquei em botão de confirmação/salvar.');
            break;
          }
        } catch (e) {}
      }
      await page.screenshot({ path: 'ecac-after-confirm.png', fullPage: true }).catch(() => {});
    }

  } finally {
    console.log('Finalizando: salvando artefatos e fechando navegador em 3s...');
    await new Promise((r) => setTimeout(r, 3000));
    try {
      if (context) await context.close();
    } catch (e) {}
    try {
      if (browser) await browser.close();
    } catch (e) {}
  }
}

module.exports = { run };
