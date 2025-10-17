# Сборка и загрузка образа в Yandex Container Registry
param(
    [Parameter(Mandatory=$true)]
    [string]$RegistryId,
    
    [Parameter(Mandatory=$false)]
    [string]$Tag = "latest",
    
    [Parameter(Mandatory=$false)]
    [string]$Dockerfile = "Dockerfile.yandex"
)

Write-Host "Сборка и загрузка образа в Yandex Container Registry" -ForegroundColor Cyan
Write-Host "Registry ID: $RegistryId" -ForegroundColor Yellow
Write-Host "Tag: $Tag" -ForegroundColor Yellow
Write-Host "Dockerfile: $Dockerfile" -ForegroundColor Yellow

# Проверка Dockerfile
if (-not (Test-Path $Dockerfile)) {
    Write-Host "Ошибка: Dockerfile не найден: $Dockerfile" -ForegroundColor Red
    exit 1
}

# Формирование имени образа
$imageName = "cr.yandex/$RegistryId/domeo-doors:$Tag"
Write-Host "Имя образа: $imageName" -ForegroundColor Cyan

# Сборка образа
Write-Host ""
Write-Host "Сборка образа..." -ForegroundColor Yellow
$buildCommand = "docker build -f $Dockerfile -t $imageName ."
Write-Host "Команда: $buildCommand" -ForegroundColor Gray

try {
    Invoke-Expression $buildCommand
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Образ успешно собран" -ForegroundColor Green
    } else {
        Write-Host "Ошибка сборки образа" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Ошибка при сборке образа: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Загрузка образа
Write-Host ""
Write-Host "Загрузка образа в реестр..." -ForegroundColor Yellow
$pushCommand = "docker push $imageName"
Write-Host "Команда: $pushCommand" -ForegroundColor Gray

try {
    Invoke-Expression $pushCommand
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Образ успешно загружен в реестр" -ForegroundColor Green
    } else {
        Write-Host "Ошибка загрузки образа" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Ошибка при загрузке образа: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Готово!" -ForegroundColor Green
Write-Host ""
Write-Host "Информация об образе:" -ForegroundColor Cyan
Write-Host "Registry: cr.yandex/$RegistryId" -ForegroundColor White
Write-Host "Image: domeo-doors:$Tag" -ForegroundColor White
Write-Host "Full name: $imageName" -ForegroundColor White
Write-Host ""
Write-Host "Ссылки:" -ForegroundColor Cyan
Write-Host "Консоль: https://console.cloud.yandex.ru/container-registry/registries/$RegistryId" -ForegroundColor White
Write-Host ""
Write-Host "Команды для использования:" -ForegroundColor Cyan
Write-Host "Скачать: docker pull $imageName" -ForegroundColor White
Write-Host "Запустить: docker run -p 3000:3000 $imageName" -ForegroundColor White


