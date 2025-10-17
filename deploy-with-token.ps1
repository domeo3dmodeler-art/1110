# Скрипт для авторизации и загрузки образа в Yandex Container Registry
param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

Write-Host "🔐 Авторизация в Yandex Container Registry..." -ForegroundColor Yellow

# Авторизация
$authResult = echo "oauth:$Token" | docker login cr.yandex --username oauth --password-stdin 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Авторизация успешна!" -ForegroundColor Green
    
    Write-Host "📤 Загрузка образа в реестр..." -ForegroundColor Yellow
    docker push cr.yandex/crpvhe4bl478pkh29sem/domeo-doors:latest
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Образ успешно загружен!" -ForegroundColor Green
        Write-Host "🌐 Теперь можно развернуть на сервере" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Ошибка при загрузке образа" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Ошибка авторизации:" -ForegroundColor Red
    Write-Host $authResult -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Получите новый токен по ссылке:" -ForegroundColor Yellow
    Write-Host "https://oauth.yandex.ru/authorize?response_type=token&client_id=23cabbbdc6cd418abb4b39c32c41195d" -ForegroundColor White
}


