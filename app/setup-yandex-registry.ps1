# Скрипт для настройки Yandex Container Registry
param(
    [Parameter(Mandatory=$true)]
    [string]$RegistryId,
    
    [Parameter(Mandatory=$true)]
    [string]$FolderId
)

Write-Host "🔧 Настройка Yandex Container Registry" -ForegroundColor Cyan
Write-Host "Registry ID: $RegistryId" -ForegroundColor Yellow
Write-Host "Folder ID: $FolderId" -ForegroundColor Yellow

# Проверка установки YC CLI
Write-Host "`n🔍 Проверка YC CLI..." -ForegroundColor Yellow
try {
    $ycVersion = yc version 2>$null
    if ($ycVersion) {
        Write-Host "✅ YC CLI установлен: $ycVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ YC CLI не найден" -ForegroundColor Red
        Write-Host "📥 Установите YC CLI: https://cloud.yandex.ru/docs/cli/quickstart" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ YC CLI не установлен" -ForegroundColor Red
    Write-Host "📥 Установите YC CLI: https://cloud.yandex.ru/docs/cli/quickstart" -ForegroundColor Yellow
    exit 1
}

# Проверка аутентификации
Write-Host "`n🔍 Проверка аутентификации..." -ForegroundColor Yellow
try {
    $ycAuth = yc config list 2>$null
    if ($ycAuth) {
        Write-Host "✅ Аутентификация настроена" -ForegroundColor Green
    } else {
        Write-Host "❌ Аутентификация не настроена" -ForegroundColor Red
        Write-Host "🔑 Выполните: yc init" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Аутентификация не настроена" -ForegroundColor Red
    Write-Host "🔑 Выполните: yc init" -ForegroundColor Yellow
    exit 1
}

# Получение токена для Docker
Write-Host "`n🔑 Получение токена для Docker..." -ForegroundColor Yellow
try {
    $token = yc iam create-token 2>$null
    if ($token) {
        Write-Host "✅ Токен получен" -ForegroundColor Green
        
        # Сохранение токена в переменную окружения
        $env:DOCKER_REGISTRY_TOKEN = $token
        Write-Host "🔐 Токен сохранен в переменную окружения DOCKER_REGISTRY_TOKEN" -ForegroundColor Green
        
        # Настройка Docker для работы с реестром
        $registryUrl = "cr.yandex/$RegistryId"
        Write-Host "`n🐳 Настройка Docker для реестра: $registryUrl" -ForegroundColor Yellow
        
        # Создание файла конфигурации Docker
        $dockerConfigPath = "$env:USERPROFILE\.docker\config.json"
        $dockerConfigDir = Split-Path $dockerConfigPath -Parent
        
        if (-not (Test-Path $dockerConfigDir)) {
            New-Item -ItemType Directory -Path $dockerConfigDir -Force
        }
        
        $dockerConfig = @{
            auths = @{
                "cr.yandex" = @{
                    auth = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("oauth:$token"))
                }
            }
        }
        
        $dockerConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $dockerConfigPath -Encoding UTF8
        Write-Host "✅ Docker настроен для работы с реестром" -ForegroundColor Green
        
    } else {
        Write-Host "❌ Не удалось получить токен" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Ошибка при получении токена: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Проверка подключения к реестру
Write-Host "`n🔍 Проверка подключения к реестру..." -ForegroundColor Yellow
try {
    $registryUrl = "cr.yandex/$RegistryId"
    $testResult = docker pull $registryUrl/hello-world 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Подключение к реестру работает" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Реестр пуст или недоступен, но подключение настроено" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Реестр пуст, но подключение настроено" -ForegroundColor Yellow
}

Write-Host "`n🎉 Настройка завершена!" -ForegroundColor Green
Write-Host "`n📋 Следующие шаги:" -ForegroundColor Cyan
Write-Host "1. Соберите образ: docker build -f Dockerfile.yandex -t cr.yandex/$RegistryId/domeo-doors:latest ." -ForegroundColor White
Write-Host "2. Загрузите образ: docker push cr.yandex/$RegistryId/domeo-doors:latest" -ForegroundColor White
Write-Host "3. Проверьте в консоли: https://console.cloud.yandex.ru/folders/$FolderId/container-registry/registries/$RegistryId" -ForegroundColor White

Write-Host "`n🔧 Переменные окружения для использования:" -ForegroundColor Cyan
Write-Host "DOCKER_REGISTRY_TOKEN=$token" -ForegroundColor White
Write-Host "REGISTRY_URL=cr.yandex/$RegistryId" -ForegroundColor White
Write-Host "IMAGE_NAME=domeo-doors" -ForegroundColor White


