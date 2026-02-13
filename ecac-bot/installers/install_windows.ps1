Write-Host "=== ECAC-BOT INSTALLER (Windows) ==="

# Helper: check executables
function Check-Cmd($name) {
  $p = Get-Command $name -ErrorAction SilentlyContinue
  if (-not $p) { Write-Host "WARNING: $name not found in PATH" }
  return $p -ne $null
}

Write-Host "Checking Node/npm..."
if (-not (Check-Cmd node)) { Write-Error "Node.js is required. Install from https://nodejs.org/"; exit 2 }
if (-not (Check-Cmd python)) { Write-Host "Python not found. Please install Python 3." }

Write-Host "Installing npm dependencies..."
npm install

Write-Host "Installing Playwright browsers (this may take a while)..."
npx playwright install --with-deps

if (Test-Path requirements.txt) {
  Write-Host "Installing Python requirements (helper)..."
  try {
    python -m pip install -r requirements.txt
  } catch {
    Write-Warning "pip install may have failed. Ensure pip is available."
  }
}

# Create persistent browser profile dir if requested
if ($env:BROWSER_USER_DATA_DIR) {
  Write-Host "Ensuring browser user data dir exists: $env:BROWSER_USER_DATA_DIR"
  New-Item -ItemType Directory -Force -Path $env:BROWSER_USER_DATA_DIR | Out-Null
}

# Copy .env.example to .env if not present
if (-not (Test-Path .env) -and (Test-Path .env.example)) {
  Copy-Item .env.example .env
  Write-Host "Created .env from .env.example — edit it now before running the bot."
} else {
  Write-Host ".env already exists or .env.example missing."
}

Write-Host "Installer finished. Please edit .env and then run: npm run start:worker"
