#!/bin/bash

if [ ! -f .env ]; then
  echo "Missing .env file. Run: cp .env.example .env"
  exit 1
fi

pnpm install
docker compose up -d
npm run db:migrate
npm run dev
