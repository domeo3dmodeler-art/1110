# Скрипт для сборки и загрузки полного приложения Domeo Doors
param(
    [Parameter(Mandatory=$true)]
    [string]$ServerIP,
    
    [Parameter(Mandatory=$true)]
    [string]$ServerUser = "ubuntu"
)

Write-Host "🚀 Сборка и загрузка полного приложения Domeo Doors" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Проверяем Docker
Write-Host "🔍 Проверяем Docker..." -ForegroundColor Yellow
docker --version
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker не установлен или не запущен!" -ForegroundColor Red
    exit 1
}

# Собираем образ
Write-Host "🏗️ Собираем Docker образ..." -ForegroundColor Yellow
docker build -f Dockerfile.production-full -t domeo-doors-full:latest .

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Образ собран успешно!" -ForegroundColor Green
    
    # Сохраняем образ в файл
    Write-Host "💾 Сохраняем образ в файл..." -ForegroundColor Yellow
    docker save domeo-doors-full:latest -o domeo-doors-full.tar
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Образ сохранен в domeo-doors-full.tar" -ForegroundColor Green
        
        # Загружаем на сервер
        Write-Host "📤 Загружаем образ на сервер..." -ForegroundColor Yellow
        scp domeo-doors-full.tar ${ServerUser}@${ServerIP}:~/domeo-doors-full.tar
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Образ загружен на сервер!" -ForegroundColor Green
            Write-Host "🌐 Теперь можно развернуть на сервере" -ForegroundColor Cyan
            Write-Host ""
            Write-Host "Команды для развертывания на сервере:" -ForegroundColor White
            Write-Host "ssh ${ServerUser}@${ServerIP}" -ForegroundColor Gray
            Write-Host "docker load -i domeo-doors-full.tar" -ForegroundColor Gray
            Write-Host "docker run -d --name domeo-full -p 80:3000 domeo-doors-full:latest" -ForegroundColor Gray
        } else {
            Write-Host "❌ Ошибка при загрузке на сервер" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Ошибка при сохранении образа" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Ошибка при сборке образа" -ForegroundColor Red
}


