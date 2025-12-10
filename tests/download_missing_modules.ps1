# Script to download missing JavaScript modules referenced in the main bundle

$baseUrl = "https://exchange.evedex.com"
$outputDir = "e:\chipa\ChipaX\tests\evedex_assets"

# Missing JS files from error messages
$missingFiles = @(
    "/assets/index.es-B8BmkpPm.js",
    "/assets/to-string-DpX5-Bzx.js",
    "/assets/not-found-CtTRZFhf.css",
    "/assets/not-found-ByuIEqPs.js",
    "/assets/index-dtN2Bxcy.js",
    "/assets/createBundlerClient-BT74MnaA.js"
)

function Download-File {
    param (
        [string]$url,
        [string]$outputPath
    )
    
    if (Test-Path $outputPath) {
        Write-Host "Already exists: $outputPath" -ForegroundColor Gray
        return $true
    }
    
    try {
        $directory = Split-Path $outputPath -Parent
        if (-not (Test-Path $directory)) {
            New-Item -ItemType Directory -Path $directory -Force | Out-Null
        }
        
        Write-Host "Downloading: $url" -ForegroundColor Cyan
        $webClient = New-Object System.Net.WebClient
        $webClient.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        $webClient.DownloadFile($url, $outputPath)
        Write-Host "  -> Success" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  -> Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

Write-Host "`n=== Downloading Missing Modules ===" -ForegroundColor Yellow

foreach ($file in $missingFiles) {
    $url = "$baseUrl$file"
    $outputPath = Join-Path $outputDir $file.TrimStart('/')
    Download-File -url $url -outputPath $outputPath
    Start-Sleep -Milliseconds 300
}

Write-Host "`nDone!" -ForegroundColor Green
