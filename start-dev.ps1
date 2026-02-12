$ErrorActionPreference = "SilentlyContinue"

function Start-ServiceIfMissing ($port, $command, $name) {
    $tcp = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if (!$tcp) {
        Write-Host "Starting $name on port $port..."
        Start-Process -FilePath "cmd" -ArgumentList "/c $command" -WindowStyle Minimized
        Start-Sleep -Seconds 5
    }
    else {
        Write-Host "$name is already running on port $port."
    }
}

# 1. Start Backend (5000)
Start-ServiceIfMissing 5000 "npm run dev:server" "Backend"

# 2. Start Frontend (3000)
Start-ServiceIfMissing 3000 "npm run dev:frontend" "Frontend"


