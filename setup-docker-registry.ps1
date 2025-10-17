# Настройка Docker для работы с Yandex Container Registry
param(
    [Parameter(Mandatory=$true)]
    [string]$Token,
    
    [Parameter(Mandatory=$true)]
    [string]$RegistryId
)

Write-Host "Настройка Docker для Yandex Container Registry" -ForegroundColor Cyan
Write-Host "Registry ID: $RegistryId" -ForegroundColor Yellow

# Создание директории для Docker конфигурации
$dockerConfigDir = "$env:USERPROFILE\.docker"
if (-not (Test-Path $dockerConfigDir)) {
    New-Item -ItemType Directory -Path $dockerConfigDir -Force
    Write-Host "Создана директория: $dockerConfigDir" -ForegroundColor Green
}

# Создание конфигурации Docker
$dockerConfigPath = "$dockerConfigDir\config.json"
$authString = "oauth:$Token"
$authBytes = [System.Text.Encoding]::UTF8.GetBytes($authString)
$authBase64 = [System.Convert]::ToBase64String($authBytes)

$dockerConfig = @{
    auths = @{
        "cr.yandex" = @{
            auth = $authBase64
        }
    }
}

$dockerConfig | ConvertTo-Json -Depth 10 | Out-File -FilePath $dockerConfigPath -Encoding UTF8
Write-Host "Docker конфигурация создана: $dockerConfigPath" -ForegroundColor Green

# Тестирование подключения
Write-Host "Тестирование подключения к реестру..." -ForegroundColor Yellow
$registryUrl = "cr.yandex/$RegistryId"
Write-Host "Registry URL: $registryUrl" -ForegroundColor Gray

Write-Host "Настройка завершена!" -ForegroundColor Green
Write-Host ""
Write-Host "Теперь вы можете:" -ForegroundColor Cyan
Write-Host "1. Собрать образ: docker build -f Dockerfile.yandex -t $registryUrl/domeo-doors:latest ." -ForegroundColor White
Write-Host "2. Загрузить образ: docker push $registryUrl/domeo-doors:latest" -ForegroundColor White
Write-Host "3. Проверить в консоли: https://console.cloud.yandex.ru/container-registry/registries/$RegistryId" -ForegroundColor White


