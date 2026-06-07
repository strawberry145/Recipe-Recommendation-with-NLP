# Start Backend Script - Clears port 5001 before launching
Write-Host "Clearing port 5001..." -ForegroundColor Yellow

# Kill any processes listening on port 5001
$listeners = netstat -ano | Select-String ":5001\s.*LISTENING" 
foreach ($line in $listeners) {
    $parts = ($line.ToString().Trim() -split "\s+")
    $pid = $parts[-1]
    if ($pid -match '^\d+$') {
        Write-Host "Killing process $pid on port 5001..." -ForegroundColor Red
        taskkill /F /PID $pid 2>$null
    }
}

# Wait briefly for port to be released
Start-Sleep -Seconds 1

Write-Host "Starting backend on port 5001..." -ForegroundColor Green
Set-Location "$PSScriptRoot\backend"
python main.py
