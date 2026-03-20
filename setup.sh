#!/bin/bash
# =====================================================================
#  HALBAUTOMATIK SPACE INVADERS — Setup Script
#  Moves the project to the target directory and starts the dev server.
# =====================================================================

set -e

TARGET="/Users/tohbineu/Software-Dev/Claude/halbautomatik-space-invaders"
PORT=8080

echo ""
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║  HALBAUTOMATIK SPACE INVADERS — Setup        ║"
echo "  ╚══════════════════════════════════════════════╝"
echo ""

# Step 1: Create target directory
echo "[1/4] Creating project directory..."
mkdir -p "$TARGET/public"
echo "       -> $TARGET"

# Step 2: Copy files
echo "[2/4] Copying project files..."
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cp "$SCRIPT_DIR/server.js"    "$TARGET/server.js"
cp "$SCRIPT_DIR/package.json" "$TARGET/package.json"
cp "$SCRIPT_DIR/README.md"    "$TARGET/README.md"
cp "$SCRIPT_DIR/public/index.html" "$TARGET/public/index.html"
echo "       -> server.js"
echo "       -> package.json"
echo "       -> README.md"
echo "       -> public/index.html"

# Step 3: Verify Node.js
echo "[3/4] Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_V=$(node --version)
    echo "       -> Node.js $NODE_V found"
else
    echo "       !! Node.js not found. Install it from https://nodejs.org"
    exit 1
fi

# Step 4: Launch
echo "[4/4] Starting dev server..."
echo ""
cd "$TARGET"
node server.js --port=$PORT
