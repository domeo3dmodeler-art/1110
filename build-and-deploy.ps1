# Скрипт для сборки и развертывания полного приложения Domeo Doors
Write-Host "🚀 Сборка и развертывание полного приложения Domeo Doors" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Проверяем Docker
Write-Host "🔍 Проверяем Docker..." -ForegroundColor Yellow
docker --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker не установлен или не запущен!" -ForegroundColor Red
    exit 1
}

# Проверяем файлы
Write-Host "📁 Проверяем необходимые файлы..." -ForegroundColor Yellow
if (-not (Test-Path "Dockerfile.yandex")) {
    Write-Host "❌ Dockerfile.yandex не найден!" -ForegroundColor Red
    exit 1
}
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json не найден!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Все файлы найдены" -ForegroundColor Green

# Сборка образа
Write-Host "🏗️ Начинаем сборку Docker образа..." -ForegroundColor Yellow
Write-Host "⏳ Это займет 10-15 минут..." -ForegroundColor Cyan

$buildCommand = "docker build -f Dockerfile.yandex -t cr.yandex/crpvhe4bl478pkh29sem/domeo-doors:latest ."
Write-Host "Выполняем: $buildCommand" -ForegroundColor Gray

# Выполняем сборку
Invoke-Expression $buildCommand

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Сборка завершена успешно!" -ForegroundColor Green
    
    # Загрузка в реестр
    Write-Host "📤 Загружаем образ в Yandex Container Registry..." -ForegroundColor Yellow
    docker push cr.yandex/crpvhe4bl478pkh29sem/domeo-doors:latest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Образ загружен в реестр!" -ForegroundColor Green
        Write-Host "🌐 Теперь можно развернуть на сервере" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Ошибка при загрузке образа" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Ошибка при сборке образа" -ForegroundColor Red
    Write-Host "💡 Попробуйте запустить сборку вручную:" -ForegroundColor Yellow
    Write-Host "   docker build -f Dockerfile.yandex -t cr.yandex/crpvhe4bl478pkh29sem/domeo-doors:latest ." -ForegroundColor Gray
}


