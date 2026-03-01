@echo off
setlocal

if not exist ".env" (
  echo Missing .env file. Run: copy .env.example .env
  exit /b 1
)

call pnpm install
if errorlevel 1 exit /b 1

docker compose up -d
if errorlevel 1 exit /b 1

call npm run db:migrate
if errorlevel 1 exit /b 1

call npm run dev
if errorlevel 1 exit /b 1
