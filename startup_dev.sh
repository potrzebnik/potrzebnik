#!/bin/bash
set -euo pipefail

wait_for_postgres_health() {
  local db_container_id
  local db_status

  db_container_id="$(docker compose ps -q postgres)"
  if [ -z "$db_container_id" ]; then
    echo "Failed to find postgres container ID."
    return 1
  fi

  echo "Waiting for postgres health check..."
  while true; do
    db_status="$(docker inspect --format='{{.State.Health.Status}}' "$db_container_id" 2>/dev/null || echo 'unknown')"

    if [ "$db_status" = "healthy" ]; then
      echo "Postgres is healthy."
      return 0
    fi

    if [ "$db_status" = "unhealthy" ]; then
      echo "Postgres became unhealthy."
      docker compose logs --tail=50 postgres || true
      return 1
    fi

    sleep 1
  done
}

if [ ! -f .env ]; then
  echo "Missing .env file. Run: cp .env.example .env"
  exit 1
fi

# startup logic
pnpm install
docker compose up -d
wait_for_postgres_health
npm run dev
