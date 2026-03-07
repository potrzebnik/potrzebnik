#!/bin/bash
set -euo pipefail

if [ ! -f .env ]; then
  echo "Missing .env file. Run: cp .env.example .env"
  exit 1
fi

# startup logic
pnpm install
docker compose up -d --wait
pnpm run db:migrate
pnpm run dev
