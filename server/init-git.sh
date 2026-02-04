#!/bin/bash
# Initialize Git repository in workspace if not already initialized
# This script runs when the OpenClaw container starts

WORKSPACE_DIR="/home/node/.openclaw/workspace"

cd "$WORKSPACE_DIR" || exit 1

# Check if already a git repository
if [ ! -d ".git" ]; then
  echo "[Git] Initializing Git repository in workspace..."
  git init
  git config user.name "OpenClaw"
  git config user.email "openclaw@workspace.local"
  
  # Create initial commit
  echo "# OpenClaw Workspace" > README.md
  git add README.md
  git commit -m "Initial commit"
  
  echo "[Git] Git repository initialized successfully"
else
  echo "[Git] Git repository already exists"
fi
