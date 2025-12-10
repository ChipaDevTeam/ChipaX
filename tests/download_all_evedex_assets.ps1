# Enhanced PowerShell script to download ALL EVEDEX assets including dependencies
# This script analyzes downloaded JS/CSS files to find additional resources

$baseUrl = "https://exchange.evedex.com"
$outputDir = "e:\chipa\ChipaX\tests\evedex_assets"

# Function to download a file
function Download-File {
    param (
        [string]$url,
        [string]$outputPath
    )
    
    # Skip if already exists
    if (Test-Path $outputPath) {
        Write-Host "  -> Already exists: $outputPath" -ForegroundColor Gray
        return $true
    }
    
    try {
        # Create directory if needed
        $directory = Split-Path $outputPath -Parent
        if (-not (Test-Path $directory)) {
            New-Item -ItemType Directory -Path $directory -Force | Out-Null
        }
        
        Write-Host "Downloading: $url" -ForegroundColor Cyan
        $webClient = New-Object System.Net.WebClient
        $webClient.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        $webClient.DownloadFile($url, $outputPath)
        Write-Host "  -> Saved to: $outputPath" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "  -> Failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# Function to extract asset references from JS/CSS files
function Extract-AssetReferences {
    param (
        [string]$filePath
    )
    
    $assets = @()
    
    if (Test-Path $filePath) {
        $content = Get-Content $filePath -Raw -ErrorAction SilentlyContinue
        
        if ($content) {
            # Find references to /assets/ paths
            $matches = [regex]::Matches($content, '/assets/[a-zA-Z0-9@._-]+\.(js|css|woff|woff2|ttf|svg|png|jpg)')
            
            foreach ($match in $matches) {
                $assetPath = $match.Value
                if ($assetPath -notin $assets) {
                    $assets += $assetPath
                }
            }
        }
    }
    
    return $assets
}

Write-Host "`n=== EVEDEX Asset Downloader ===" -ForegroundColor Yellow
Write-Host "Downloading all assets including dependencies...`n" -ForegroundColor Yellow

# Initial list of primary assets
$primaryAssets = @(
    "/trading_platform/charting_library/charting_library.js",
    "/assets/fonts/stapel/stapel.css",
    "/assets/fonts/digital-numbers/digital-numbers.css",
    "/assets/index-RDyXvyzL.js",
    "/assets/@react-router-B_Yxq9fH.js",
    "/assets/@wagmi-core-ClbrNBk4.js",
    "/assets/@wagmi-BZ-YosZW.js",
    "/assets/index-CbX4KGWS.css",
    "/apple-touch-icon.png",
    "/favicon-32x32.png",
    "/favicon-16x16.png"
)

# Download primary assets
Write-Host "=== Phase 1: Downloading Primary Assets ===" -ForegroundColor Magenta
foreach ($asset in $primaryAssets) {
    $url = "$baseUrl$asset"
    $outputPath = Join-Path $outputDir $asset.TrimStart('/')
    Download-File -url $url -outputPath $outputPath
    Start-Sleep -Milliseconds 300
}

# Discover and download secondary assets
Write-Host "`n=== Phase 2: Discovering Secondary Assets ===" -ForegroundColor Magenta

$discoveredAssets = @()
$jsFiles = Get-ChildItem -Path "$outputDir\assets" -Filter "*.js" -Recurse -ErrorAction SilentlyContinue
$cssFiles = Get-ChildItem -Path "$outputDir\assets" -Filter "*.css" -Recurse -ErrorAction SilentlyContinue

foreach ($file in ($jsFiles + $cssFiles)) {
    Write-Host "Analyzing: $($file.Name)" -ForegroundColor Cyan
    $assets = Extract-AssetReferences -filePath $file.FullName
    foreach ($asset in $assets) {
        if ($asset -notin $discoveredAssets) {
            $discoveredAssets += $asset
        }
    }
}

Write-Host "`nFound $($discoveredAssets.Count) additional assets" -ForegroundColor Yellow

# Download discovered assets
Write-Host "`n=== Phase 3: Downloading Discovered Assets ===" -ForegroundColor Magenta
$successCount = 0
$failCount = 0

foreach ($asset in $discoveredAssets) {
    $url = "$baseUrl$asset"
    $outputPath = Join-Path $outputDir $asset.TrimStart('/')
    
    if (Download-File -url $url -outputPath $outputPath) {
        $successCount++
    } else {
        $failCount++
    }
    Start-Sleep -Milliseconds 300
}

Write-Host "`n==========================================" -ForegroundColor Yellow
Write-Host "Download Summary:" -ForegroundColor Yellow
Write-Host "  Primary Assets: $($primaryAssets.Count)" -ForegroundColor Cyan
Write-Host "  Discovered Assets: $($discoveredAssets.Count)" -ForegroundColor Cyan
Write-Host "  Successful Downloads: $successCount" -ForegroundColor Green
Write-Host "  Failed Downloads: $failCount" -ForegroundColor Red
Write-Host "`nAssets saved to: $outputDir" -ForegroundColor Cyan
Write-Host "`nNote: Some assets may still fail to load due to:" -ForegroundColor Yellow
Write-Host "  - Dynamic imports at runtime" -ForegroundColor Gray
Write-Host "  - API calls requiring backend services" -ForegroundColor Gray
Write-Host "  - Content Security Policy restrictions" -ForegroundColor Gray
