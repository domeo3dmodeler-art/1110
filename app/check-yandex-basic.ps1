# Базовая проверка настроек Yandex Cloud
Write-Host "Проверка настроек Yandex Cloud" -ForegroundColor Cyan

# Проверка YC CLI
Write-Host ""
Write-Host "1. Проверка YC CLI..." -ForegroundColor Yellow
$ycVersion = yc version 2>$null
if ($ycVersion) {
    Write-Host "YC CLI установлен: $ycVersion" -ForegroundColor Green
} else {
    Write-Host "YC CLI не найден" -ForegroundColor Red
    Write-Host "Запустите: .\install-yc-cli.ps1" -ForegroundColor Yellow
}

# Проверка Docker
Write-Host ""
Write-Host "2. Проверка Docker..." -ForegroundColor Yellow
$dockerVersion = docker --version 2>$null
if ($dockerVersion) {
    Write-Host "Docker установлен: $dockerVersion" -ForegroundColor Green
} else {
    Write-Host "Docker не найден" -ForegroundColor Red
}

# Проверка Dockerfile
Write-Host ""
Write-Host "3. Проверка Dockerfile..." -ForegroundColor Yellow
if (Test-Path "Dockerfile.yandex") {
    Write-Host "Dockerfile.yandex найден" -ForegroundColor Green
} else {
    Write-Host "Dockerfile.yandex не найден" -ForegroundColor Red
}

Write-Host ""
Write-Host "Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. Установите YC CLI: .\install-yc-cli.ps1" -ForegroundColor White
Write-Host "2. Настройте аутентификацию: yc init" -ForegroundColor White
Write-Host "3. Создайте реестр в консоли Yandex Cloud" -ForegroundColor White
Write-Host "4. Настройте реестр: .\setup-yandex-registry.ps1" -ForegroundColor White


