# Скрипт для подготовки Docker окружения
Write-Host "Подготовка Docker окружения для Domeo Doors" -ForegroundColor Cyan

# Создание .env.local файла
Write-Host "Создание .env.local файла..." -ForegroundColor Yellow
$envContent = @"
DATABASE_URL=postgresql://domeo_user:domeo_password@localhost:5432/domeo_doors
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3000/api
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8
Write-Host ".env.local создан" -ForegroundColor Green

# Проверка Docker
Write-Host "Проверка Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "Docker установлен: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "Docker не найден. Установите Docker Desktop" -ForegroundColor Red
        Write-Host "Скачайте с: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "Docker не установлен" -ForegroundColor Red
    Write-Host "Скачайте Docker Desktop с: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Проверка файлов
Write-Host "Проверка Docker файлов..." -ForegroundColor Yellow
$requiredFiles = @("Dockerfile.yandex", "docker-compose.yandex.yml", "sql/yandex_cloud_schema.sql")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "$file найден" -ForegroundColor Green
    } else {
        Write-Host "$file не найден" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Готово! Теперь можно запустить:" -ForegroundColor Cyan
Write-Host "docker-compose -f docker-compose.yandex.yml up --build" -ForegroundColor White


