# ChipaTrade Exchange - Setup Script
# Automates the initial setup process

Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║         ChipaTrade Exchange - Setup Wizard                ║
║     High-Frequency Crypto Trading Platform (EVEDEX Clone) ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

$ErrorActionPreference = "Stop"

# Step 1: Check prerequisites
Write-Host "`n[1/7] Checking prerequisites..." -ForegroundColor Yellow
Write-Host "Checking Node.js version..." -ForegroundColor Gray
$nodeVersion = node --version
Write-Host "✓ Node.js $nodeVersion" -ForegroundColor Green

Write-Host "Checking npm version..." -ForegroundColor Gray
$npmVersion = npm --version
Write-Host "✓ npm $npmVersion" -ForegroundColor Green

Write-Host "Checking Docker..." -ForegroundColor Gray
try {
    docker --version | Out-Null
    Write-Host "✓ Docker installed" -ForegroundColor Green
} catch {
    Write-Host "⚠ Docker not found - required for PostgreSQL and Redis" -ForegroundColor Yellow
}

# Step 2: Install root dependencies
Write-Host "`n[2/7] Installing root dependencies..." -ForegroundColor Yellow
npm install

# Step 3: Install package dependencies
Write-Host "`n[3/7] Installing package dependencies..." -ForegroundColor Yellow
Set-Location packages/core
npm install
Set-Location ../config
npm install
Set-Location ../database
npm install
Set-Location ../../

# Step 4: Start Docker containers
Write-Host "`n[4/7] Starting Docker containers (PostgreSQL + Redis)..." -ForegroundColor Yellow
Set-Location docker
docker-compose up -d
Set-Location ..

Write-Host "Waiting for database to be ready..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Step 5: Setup environment variables
Write-Host "`n[5/7] Setting up environment variables..." -ForegroundColor Yellow
if (-not (Test-Path ".env.local")) {
    Copy-Item ".env.example" ".env.local"
    Write-Host "✓ Created .env.local from template" -ForegroundColor Green
} else {
    Write-Host "✓ .env.local already exists" -ForegroundColor Gray
}

# Step 6: Initialize database
Write-Host "`n[6/7] Initializing database..." -ForegroundColor Yellow
Set-Location packages/database

Write-Host "Generating Prisma client..." -ForegroundColor Gray
npm run prisma:generate

Write-Host "Running database migrations..." -ForegroundColor Gray
npm run prisma:push

Set-Location ../../

# Step 7: Build packages
Write-Host "`n[7/7] Building packages..." -ForegroundColor Yellow
npm run build

# Summary
Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                   Setup Complete! 🎉                      ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Start development server:" -ForegroundColor White
Write-Host "     npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Access services:" -ForegroundColor White
Write-Host "     Exchange:         http://localhost:3000" -ForegroundColor Gray
Write-Host "     Adminer (DB GUI): http://localhost:8080" -ForegroundColor Gray
Write-Host "     Redis Commander:  http://localhost:8081" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. View logs:" -ForegroundColor White
Write-Host "     docker-compose -f docker/docker-compose.yml logs -f" -ForegroundColor Gray
Write-Host ""
Write-Host "Enjoy building with ChipaTrade! 🚀" -ForegroundColor Cyan
