#!/usr/bin/env node
const { spawnSync } = require('child_process');
const os = require('os');
const path = require('path');
const fs = require('fs');

function run(cmd, args, opts = {}) {
  console.log('>', cmd, args.join(' '));
  const r = spawnSync(cmd, args, Object.assign({ stdio: 'inherit' }, opts));
  if (r.error) throw r.error;
  if (r.status !== 0) throw new Error(`${cmd} exited ${r.status}`);
}

async function main() {
  const platform = os.platform();
  const installerDir = path.join(__dirname, 'installers');

  if (!fs.existsSync(installerDir)) {
    console.error('installers dir not found');
    process.exit(2);
  }

  try {
    if (platform === 'win32') {
      const script = path.join(installerDir, 'install_windows.ps1');
      if (!fs.existsSync(script)) throw new Error('install_windows.ps1 not found');
      console.log('Running Windows installer (PowerShell)');
      run('powershell', ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', script]);
    } else {
      const script = path.join(installerDir, 'install_unix.sh');
      if (!fs.existsSync(script)) throw new Error('install_unix.sh not found');
      console.log('Running Unix installer (sh)');
      run('sh', [script]);
    }

    console.log('\nInstallation finished. Run `npm install` and `npx playwright install --with-deps` in ecac-bot if not already run.');
  } catch (e) {
    console.error('Installer failed:', e.message || e);
    process.exit(1);
  }
}

main();
