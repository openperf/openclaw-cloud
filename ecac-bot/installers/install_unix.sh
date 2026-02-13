#!/usr/bin/env sh
set -e
echo "=== ECAC-BOT INSTALLER (Unix) ==="

command -v node >/dev/null 2>&1 || { echo "Node.js is required. Install: https://nodejs.org/"; exit 2; }
command -v python3 >/dev/null 2>&1 || { echo "Python3 not found. Install python3 to use helper scripts."; }

echo "Installing npm dependencies..."
npm install

echo "Installing Playwright browsers (this may take a while)..."
npx playwright install --with-deps

if [ -f requirements.txt ]; then
  echo "Installing Python requirements (helper)..."
  python3 -m pip install -r requirements.txt || echo "pip install may have failed"
fi

if [ -n "$BROWSER_USER_DATA_DIR" ]; then
  echo "Ensuring browser user data dir exists: $BROWSER_USER_DATA_DIR"
  mkdir -p "$BROWSER_USER_DATA_DIR"
fi

if [ ! -f .env ] && [ -f .env.example ]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit it now before running the bot."
else
  echo ".env already exists or .env.example missing."
fi

echo "Installer finished. Please edit .env and then run: npm run start:worker"
