# Comprehensive recursive asset downloader for EVEDEX
# This script will keep discovering and downloading dependencies until no new files are found

$baseUrl = "https://exchange.evedex.com"
$outputDir = "e:\chipa\ChipaX\tests\evedex_assets"
$downloadedFiles = @{}
$failedFiles = @{}

function Download-File {
    param (
        [string]$url,
        [string]$outputPath
    )
    
    # Skip if already processed
    if ($downloadedFiles.ContainsKey($outputPath) -or $failedFiles.ContainsKey($outputPath)) {
        return $downloadedFiles.ContainsKey($outputPath)
    }
    
    if (Test-Path $outputPath) {
        $downloadedFiles[$outputPath] = $true
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
        Write-Host "  -> Saved" -ForegroundColor Green
        $downloadedFiles[$outputPath] = $true
        return $true
    }
    catch {
        Write-Host "  -> Failed: $($_.Exception.Message)" -ForegroundColor Red
        $failedFiles[$outputPath] = $true
        return $false
    }
}

function Extract-Assets {
    param (
        [string]$filePath
    )
    
    $assets = @()
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -ErrorAction SilentlyContinue
        
        if ($content) {
            # Match various asset patterns
            $patterns = @(
                '/assets/[a-zA-Z0-9@._-]+\.(js|css|woff|woff2|ttf|svg|png|jpg|jpeg|gif|webp)',
                '"[a-zA-Z0-9@._-]+\.(js|css)"',
                "'[a-zA-Z0-9@._-]+\.(js|css)'"
            )
            
            foreach ($pattern in $patterns) {
                $matches = [regex]::Matches($content, $pattern)
                foreach ($match in $matches) {
                    $assetPath = $match.Value -replace '"', '' -replace "'", ''
                    
                    # Normalize path
                    if (-not $assetPath.StartsWith('/')) {
                        $assetPath = "/assets/$assetPath"
                    }
                    
                    if ($assetPath -notin $assets) {
                        $assets += $assetPath
                    }
                }
            }
        }
    }
    
    return $assets
}

Write-Host "`n=== EVEDEX Recursive Asset Downloader ===" -ForegroundColor Yellow
Write-Host "This will download all assets and their dependencies recursively`n" -ForegroundColor Yellow

$iteration = 1
$maxIterations = 5

while ($iteration -le $maxIterations) {
    Write-Host "`n=== Iteration $iteration ===" -ForegroundColor Magenta
    
    # Get all current files
    $allFiles = Get-ChildItem -Path "$outputDir\assets" -Recurse -File -ErrorAction SilentlyContinue
    
    $newAssetsFound = @()
    
    foreach ($file in $allFiles) {
        if ($file.Extension -in @('.js', '.css')) {
            $assets = Extract-Assets -filePath $file.FullName
            foreach ($asset in $assets) {
                $outputPath = Join-Path $outputDir $asset.TrimStart('/')
                if (-not (Test-Path $outputPath) -and -not $downloadedFiles.ContainsKey($outputPath) -and -not $failedFiles.ContainsKey($outputPath)) {
                    $newAssetsFound += $asset
                }
            }
        }
    }
    
    # Remove duplicates
    $newAssetsFound = $newAssetsFound | Sort-Object -Unique
    
    Write-Host "Found $($newAssetsFound.Count) new assets to download" -ForegroundColor Yellow
    
    if ($newAssetsFound.Count -eq 0) {
        Write-Host "No new assets found. Download complete!" -ForegroundColor Green
        break
    }
    
    # Download new assets
    foreach ($asset in $newAssetsFound) {
        $url = "$baseUrl$asset"
        $outputPath = Join-Path $outputDir $asset.TrimStart('/')
        Download-File -url $url -outputPath $outputPath
        Start-Sleep -Milliseconds 200
    }
    
    $iteration++
}

Write-Host "`n==========================================" -ForegroundColor Yellow
Write-Host "Download Complete!" -ForegroundColor Green
Write-Host "  Successfully downloaded: $($downloadedFiles.Count)" -ForegroundColor Green
Write-Host "  Failed downloads: $($failedFiles.Count)" -ForegroundColor Red
Write-Host "  Total iterations: $($iteration - 1)" -ForegroundColor Cyan

if ($failedFiles.Count -gt 0) {
    Write-Host "`nFailed files (these may not exist on server):" -ForegroundColor Yellow
    $failedFiles.Keys | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }
}
