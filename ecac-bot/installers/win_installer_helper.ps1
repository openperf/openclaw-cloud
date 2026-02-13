<#
win_installer_helper.ps1
Orquestra instalação de pré-requisitos no Windows:
- instala Node.js (se ausente) via instalador oficial
- instala Python3 (se ausente) via instalador oficial
- executa `npm install` e `npx playwright install --with-deps` no diretório do app
- instala dependências Python (requirements.txt) se Python disponível

Este script é chamado pelo Inno Setup installer com privilégios de usuário (RunAs).
#>

param()

function Write-Log($m) { Write-Host "[INSTALLER] $m" }

Set-StrictMode -Version Latest

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Log "Script dir: $scriptDir"

function Ensure-Node {
  Write-Log "Verificando Node..."
  $node = Get-Command node -ErrorAction SilentlyContinue
  if ($node) { Write-Log "Node já instalado: $($node.Path)"; return }

  Write-Log "Node não encontrado. Baixando instalador LTS..."
  $nodeUrl = "https://nodejs.org/dist/v18.18.0/node-v18.18.0-x64.msi"
  $tmp = Join-Path $env:TEMP "node-installer.msi"
  Write-Log "Baixando $nodeUrl -> $tmp"
  Invoke-WebRequest -Uri $nodeUrl -OutFile $tmp -UseBasicParsing
  Write-Log "Executando instalador Node (silencioso)..."
  Start-Process msiexec -ArgumentList "/i","`"$tmp`"","/quiet","/norestart"" -Wait
  Remove-Item $tmp -ErrorAction SilentlyContinue
}

function Ensure-Python {
  Write-Log "Verificando Python3..."
  $py = Get-Command python -ErrorAction SilentlyContinue
  if ($py) { Write-Log "Python já disponível: $($py.Path)"; return }

  Write-Log "Python não encontrado. Baixando instalador..."
  $pyUrl = "https://www.python.org/ftp/python/3.11.6/python-3.11.6-amd64.exe"
  $tmp = Join-Path $env:TEMP "python-installer.exe"
  Invoke-WebRequest -Uri $pyUrl -OutFile $tmp -UseBasicParsing
  Write-Log "Executando instalador Python (silencioso)..."
  Start-Process -FilePath $tmp -ArgumentList "/quiet InstallAllUsers=1 PrependPath=1" -Wait
  Remove-Item $tmp -ErrorAction SilentlyContinue
}

function Run-NpmInstallAndPlaywright($appDir) {
  Write-Log "Executando npm install no diretório $appDir"
  Push-Location $appDir
  try {
    if (Test-Path package.json) {
      Write-Log "npm install..."
      # Try to find npm.cmd in ProgramFiles (Node installer may not update PATH for this process)
      $npmCmd = Join-Path $env:ProgramFiles 'nodejs\npm.cmd'
      if (-not (Test-Path $npmCmd) -and $env:ProgramFiles(x86)) {
        $npmCmd = Join-Path $env:ProgramFiles(x86) 'nodejs\npm.cmd'
      }
      if (Test-Path $npmCmd) {
        Write-Log "Running $npmCmd install"
        & "$npmCmd" install
      } else {
        Write-Log "npm.cmd not found under ProgramFiles, falling back to 'npm' (requires PATH to include Node)"
        & npm install
      }
    }

    Write-Log "Instalando browsers Playwright (pode demorar)..."
    # Similar lookup for npx
    $npxCmd = Join-Path $env:ProgramFiles 'nodejs\npx.cmd'
    if (-not (Test-Path $npxCmd) -and $env:ProgramFiles(x86)) {
      $npxCmd = Join-Path $env:ProgramFiles(x86) 'nodejs\npx.cmd'
    }
    if (Test-Path $npxCmd) {
      Write-Log "Running $npxCmd playwright install --with-deps"
      & "$npxCmd" playwright install --with-deps
    } else {
      Write-Log "npx.cmd not found under ProgramFiles, falling back to 'npx'"
      & npx playwright install --with-deps
    }
  } finally {
    Pop-Location
  }
}

function Install-PythonReqs($appDir) {
  $req = Join-Path $appDir "requirements.txt"
  if (Test-Path $req) {
    Write-Log "Instalando requisitos Python: $req"
    Start-Process -FilePath python -ArgumentList "-m","pip","install","-r",$req -NoNewWindow -Wait
  }
}

try {
  Write-Log "Iniciando orquestrador pós-instalação (modo seguro)"

  $appDir = $scriptDir
  $logFile = Join-Path $appDir 'install-postlog.txt'
  Write-Log "Post-install log: $logFile"
  function Log-Write($m) { "$((Get-Date).ToString('s')) - $m" | Out-File -FilePath $logFile -Append -Encoding utf8 }

  # Check Node/npm availability — do not attempt to install Node automatically to avoid elevation issues
  $node = Get-Command node -ErrorAction SilentlyContinue
  $npmAvailable = $false
  if ($node) {
    Log-Write "Node detected: $($node.Path)"
    # try to resolve npm
    $npmCmd = Join-Path $env:ProgramFiles 'nodejs\npm.cmd'
    if (-not (Test-Path $npmCmd) -and $env:ProgramFiles(x86)) { $npmCmd = Join-Path $env:ProgramFiles(x86) 'nodejs\npm.cmd' }
    if (Test-Path $npmCmd) { $npmAvailable = $true; Log-Write "Found npm at $npmCmd" } else {
      # fallback to PATH
      $npm = Get-Command npm -ErrorAction SilentlyContinue
      if ($npm) { $npmAvailable = $true; Log-Write "Found npm in PATH: $($npm.Path)" }
    }
  } else {
    Log-Write "Node not found — skipping automatic installation to avoid requiring admin rights."
  }

  if ($npmAvailable) {
    Log-Write "Attempting npm install and Playwright browsers (this may take a while)"
    try {
      Run-NpmInstallAndPlaywright $appDir 2>&1 | ForEach-Object { Log-Write $_ }
    } catch {
      Log-Write "npm/playwright install failed: $_"
    }
  } else {
    Log-Write "Skipping npm install because npm is not available. Instructing user to run npm install manually."
  }

  # Python requirements: only install if python exists — do not attempt to install Python automatically
  $py = Get-Command python -ErrorAction SilentlyContinue
  if ($py) {
    Log-Write "Python detected: $($py.Path) — installing Python requirements"
    try { Install-PythonReqs $appDir 2>&1 | ForEach-Object { Log-Write $_ } } catch { Log-Write "pip install failed: $_" }
  } else { Log-Write "Python not detected — skipping Python requirements installation." }

  Write-Log "Pós-instalação concluída (verifique $logFile para detalhes)."
  [System.Windows.Forms.MessageBox]::Show('Instalação concluída. Edite .env em "' + $appDir + '" e então execute ecac-bot. Se dependências faltarem, rode manualmente `npm install` em ' + $appDir + '.', 'ECAC Bot', 'OK', 'Information') | Out-Null
} catch {
  Write-Log "Erro durante instalação: $_"
  # Do not rethrow — ensure installer reports success even if post-install had issues
  Write-Log "Continuando sem interromper o instalador principal."
}
