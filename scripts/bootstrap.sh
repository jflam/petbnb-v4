#!/usr/bin/env bash
set -euo pipefail

echo "📦  Installing root dependencies…"
npm install

echo "📦  Installing server dependencies…"
npm install --prefix server

echo "📦  Installing client dependencies…"
npm install --prefix client

echo "✅  All dependencies installed."
