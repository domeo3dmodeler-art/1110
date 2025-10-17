# Скрипт для проверки настроек Yandex Cloud
Write-Host "Проверка настроек Yandex Cloud" -ForegroundColor Cyan

# Проверка YC CLI
Write-Host ""
Write-Host "1. Проверка YC CLI..." -ForegroundColor Yellow
try {
    $ycVersion = yc version 2>$null
    if ($ycVersion) {
        Write-Host "YC CLI установлен: $ycVersion" -ForegroundColor Green
    } else {
        Write-Host "YC CLI не найден" -ForegroundColor Red
        Write-Host "Запустите: .\install-yc-cli.ps1" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "YC CLI не установлен" -ForegroundColor Red
    Write-Host "Запустите: .\install-yc-cli.ps1" -ForegroundColor Yellow
    exit 1
}

# Проверка аутентификации
Write-Host "`n2. Проверка аутентификации..." -ForegroundColor Yellow
try {
    $ycConfig = yc config list 2>$null
    if ($ycConfig) {
        Write-Host "✅ Аутентификация настроена" -ForegroundColor Green
        Write-Host $ycConfig -ForegroundColor Gray
    } else {
        Write-Host "❌ Аутентификация не настроена" -ForegroundColor Red
        Write-Host "🔧 Выполните: yc init" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Аутентификация не настроена" -ForegroundColor Red
    Write-Host "🔧 Выполните: yc init" -ForegroundColor Yellow
    exit 1
}

# Проверка Docker
Write-Host "`n3. Проверка Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✅ Docker установлен: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker не найден" -ForegroundColor Red
        Write-Host "📥 Установите Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Docker не установлен" -ForegroundColor Red
    Write-Host "📥 Установите Docker Desktop: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Проверка Dockerfile
Write-Host "`n4. Проверка Dockerfile..." -ForegroundColor Yellow
$dockerfiles = @("Dockerfile.yandex", "Dockerfile.dev")
foreach ($dockerfile in $dockerfiles) {
    if (Test-Path $dockerfile) {
        Write-Host "✅ $dockerfile найден" -ForegroundColor Green
    } else {
        Write-Host "❌ $dockerfile не найден" -ForegroundColor Red
    }
}

# Проверка переменных окружения
Write-Host "`n5. Проверка переменных окружения..." -ForegroundColor Yellow
$envVars = @("DOCKER_REGISTRY_TOKEN", "REGISTRY_ID", "FOLDER_ID")
foreach ($envVar in $envVars) {
    if ($env:$envVar) {
        Write-Host "✅ $envVar установлена" -ForegroundColor Green
    } else {
        Write-Host "⚠️ $envVar не установлена" -ForegroundColor Yellow
    }
}

# Проверка подключения к Yandex Cloud
Write-Host "`n6. Проверка подключения к Yandex Cloud..." -ForegroundColor Yellow
try {
    $ycInfo = yc config get cloud-id 2>$null
    if ($ycInfo) {
        Write-Host "✅ Подключение к облаку: $ycInfo" -ForegroundColor Green
    } else {
        Write-Host "❌ Не удалось получить информацию об облаке" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Ошибка подключения к Yandex Cloud" -ForegroundColor Red
}

# Проверка папки
Write-Host "`n7. Проверка папки..." -ForegroundColor Yellow
try {
    $folderInfo = yc config get folder-id 2>$null
    if ($folderInfo) {
        Write-Host "✅ Папка: $folderInfo" -ForegroundColor Green
    } else {
        Write-Host "❌ Не удалось получить информацию о папке" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Ошибка получения информации о папке" -ForegroundColor Red
}

Write-Host "`n📋 Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. Создайте реестр в консоли Yandex Cloud" -ForegroundColor White
Write-Host "2. Запустите: .\setup-yandex-registry.ps1 -RegistryId YOUR_REGISTRY_ID -FolderId YOUR_FOLDER_ID" -ForegroundColor White
Write-Host "3. Запустите: .\deploy-to-yandex.ps1 -RegistryId YOUR_REGISTRY_ID" -ForegroundColor White

Write-Host "`n🔗 Полезные ссылки:" -ForegroundColor Cyan
Write-Host "Консоль Yandex Cloud: https://console.cloud.yandex.ru/" -ForegroundColor White
Write-Host "Container Registry: https://console.cloud.yandex.ru/container-registry" -ForegroundColor White
Write-Host "Документация: https://cloud.yandex.ru/docs/container-registry/" -ForegroundColor White
