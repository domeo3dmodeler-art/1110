# Скрипт для деплоя в Yandex Container Registry
param(
    [Parameter(Mandatory=$true)]
    [string]$RegistryId,
    
    [Parameter(Mandatory=$false)]
    [string]$Tag = "latest",
    
    [Parameter(Mandatory=$false)]
    [string]$Dockerfile = "Dockerfile.yandex"
)

Write-Host "🚀 Деплой в Yandex Container Registry" -ForegroundColor Cyan
Write-Host "Registry ID: $RegistryId" -ForegroundColor Yellow
Write-Host "Tag: $Tag" -ForegroundColor Yellow
Write-Host "Dockerfile: $Dockerfile" -ForegroundColor Yellow

# Проверка Docker
Write-Host "`n🔍 Проверка Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✅ Docker установлен: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker не найден" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Docker не установлен" -ForegroundColor Red
    exit 1
}

# Проверка Dockerfile
Write-Host "`n🔍 Проверка Dockerfile..." -ForegroundColor Yellow
if (Test-Path $Dockerfile) {
    Write-Host "✅ Dockerfile найден: $Dockerfile" -ForegroundColor Green
} else {
    Write-Host "❌ Dockerfile не найден: $Dockerfile" -ForegroundColor Red
    exit 1
}

# Формирование имени образа
$imageName = "cr.yandex/$RegistryId/domeo-doors:$Tag"
Write-Host "`n📦 Имя образа: $imageName" -ForegroundColor Cyan

# Сборка образа
Write-Host "`n🔨 Сборка образа..." -ForegroundColor Yellow
try {
    $buildResult = docker build -f $Dockerfile -t $imageName . 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Образ успешно собран" -ForegroundColor Green
    } else {
        Write-Host "❌ Ошибка сборки образа:" -ForegroundColor Red
        Write-Host $buildResult -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Ошибка при сборке образа: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Проверка аутентификации
Write-Host "`n🔑 Проверка аутентификации..." -ForegroundColor Yellow
if (-not $env:DOCKER_REGISTRY_TOKEN) {
    Write-Host "⚠️ Токен не найден в переменной окружения" -ForegroundColor Yellow
    Write-Host "🔧 Запустите: .\setup-yandex-registry.ps1 -RegistryId $RegistryId -FolderId YOUR_FOLDER_ID" -ForegroundColor Yellow
    exit 1
}

# Загрузка образа
Write-Host "`n📤 Загрузка образа в реестр..." -ForegroundColor Yellow
try {
    $pushResult = docker push $imageName 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Образ успешно загружен в реестр" -ForegroundColor Green
    } else {
        Write-Host "❌ Ошибка загрузки образа:" -ForegroundColor Red
        Write-Host $pushResult -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Ошибка при загрузке образа: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Проверка загруженного образа
Write-Host "`n🔍 Проверка загруженного образа..." -ForegroundColor Yellow
try {
    $manifestResult = docker manifest inspect $imageName 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Образ доступен в реестре" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Не удалось проверить манифест образа" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Не удалось проверить манифест образа" -ForegroundColor Yellow
}

Write-Host "`n🎉 Деплой завершен успешно!" -ForegroundColor Green
Write-Host "`n📋 Информация об образе:" -ForegroundColor Cyan
Write-Host "Registry: cr.yandex/$RegistryId" -ForegroundColor White
Write-Host "Image: domeo-doors:$Tag" -ForegroundColor White
Write-Host "Full name: $imageName" -ForegroundColor White

Write-Host "`n🔗 Ссылки:" -ForegroundColor Cyan
Write-Host "Консоль Yandex Cloud: https://console.cloud.yandex.ru/container-registry/registries/$RegistryId" -ForegroundColor White
Write-Host "Документация: https://cloud.yandex.ru/docs/container-registry/" -ForegroundColor White

Write-Host "`n📝 Команды для использования:" -ForegroundColor Cyan
Write-Host "Скачать образ: docker pull $imageName" -ForegroundColor White
Write-Host "Запустить контейнер: docker run -p 3000:3000 $imageName" -ForegroundColor White


