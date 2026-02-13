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
      Start-Process -FilePath npm -ArgumentList "install" -NoNewWindow -Wait
    }

    Write-Log "Instalando browsers Playwright (pode demorar)..."
    Start-Process -FilePath npx -ArgumentList "playwright install --with-deps" -NoNewWindow -Wait
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
  Write-Log "Iniciando orquestrador pós-instalação"
  Ensure-Node
  Ensure-Python

  $appDir = $scriptDir
  Run-NpmInstallAndPlaywright $appDir
  Install-PythonReqs $appDir

  Write-Log "Instalação concluída. Edite .env em $appDir antes de rodar o bot."
  [System.Windows.Forms.MessageBox]::Show('Instalação concluída. Edite .env em "' + $appDir + '" e então execute ecac-bot.', 'ECAC Bot', 'OK', 'Information') | Out-Null
} catch {
  Write-Log "Erro durante instalação: $_"
  throw
}
