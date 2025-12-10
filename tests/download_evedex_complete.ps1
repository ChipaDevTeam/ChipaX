# Master EVEDEX Asset Downloader - Complete Solution
# Downloads all assets from EVEDEX website for local use

param(
    [switch]$Force  # Re-download even if files exist
)

$baseUrl = "https://exchange.evedex.com"
$outputDir = "e:\chipa\ChipaX\tests\evedex_assets"

Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║         EVEDEX Asset Downloader - Master Script          ║
║         Complete Website Asset Collection Tool           ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Statistics
$stats = @{
    TotalDownloaded = 0
    TotalFailed = 0
    TotalSkipped = 0
    StartTime = Get-Date
}

function Download-Asset {
    param(
        [string]$relativePath
    )
    
    $url = "$baseUrl$relativePath"
    $outputPath = Join-Path $outputDir $relativePath.TrimStart('/')
    
    # Check if already exists
    if ((Test-Path $outputPath) -and -not $Force) {
        $stats.TotalSkipped++
        return $true
    }
    
    try {
        # Create directory structure
        $directory = Split-Path $outputPath -Parent
        if (-not (Test-Path $directory)) {
            New-Item -ItemType Directory -Path $directory -Force | Out-Null
        }
        
        # Download
        $webClient = New-Object System.Net.WebClient
        $webClient.Headers.Add("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        $webClient.DownloadFile($url, $outputPath)
        
        $stats.TotalDownloaded++
        Write-Host "✓ " -NoNewline -ForegroundColor Green
        Write-Host $relativePath -ForegroundColor Gray
        return $true
    }
    catch {
        $stats.TotalFailed++
        Write-Host "✗ " -NoNewline -ForegroundColor Red
        Write-Host "$relativePath - $($_.Exception.Message)" -ForegroundColor DarkGray
        return $false
    }
    finally {
        Start-Sleep -Milliseconds 150
    }
}

# Primary Assets (from HTML)
Write-Host "`n[1/3] Downloading Primary Assets..." -ForegroundColor Yellow
$primaryAssets = @(
    "/apple-touch-icon.png",
    "/favicon-32x32.png",
    "/favicon-16x16.png",
    "/trading_platform/charting_library/charting_library.js",
    "/assets/fonts/stapel/stapel.css",
    "/assets/fonts/digital-numbers/digital-numbers.css",
    "/assets/index-RDyXvyzL.js",
    "/assets/@react-router-B_Yxq9fH.js",
    "/assets/@wagmi-core-ClbrNBk4.js",
    "/assets/@wagmi-BZ-YosZW.js",
    "/assets/index-CbX4KGWS.css"
)

foreach ($asset in $primaryAssets) {
    Download-Asset -relativePath $asset
}

# Secondary Assets (discovered from errors/analysis)
Write-Host "`n[2/3] Downloading Secondary Assets..." -ForegroundColor Yellow
$secondaryAssets = @(
    "/assets/index.es-B8BmkpPm.js",
    "/assets/to-string-DpX5-Bzx.js",
    "/assets/not-found-CtTRZFhf.css",
    "/assets/not-found-ByuIEqPs.js",
    "/assets/index-dtN2Bxcy.js",
    "/assets/createBundlerClient-BT74MnaA.js"
)

foreach ($asset in $secondaryAssets) {
    Download-Asset -relativePath $asset
}

# Recursive discovery
Write-Host "`n[3/3] Discovering and Downloading Dependencies..." -ForegroundColor Yellow

function Get-AssetsFromFile {
    param([string]$filePath)
    
    if (-not (Test-Path $filePath)) { return @() }
    
    $content = Get-Content $filePath -Raw -ErrorAction SilentlyContinue
    if (-not $content) { return @() }
    
    $assets = @()
    $pattern = '/assets/[a-zA-Z0-9@._-]+\.(js|css|woff|woff2|ttf|svg|png|jpg|jpeg|gif|webp)'
    $matches = [regex]::Matches($content, $pattern)
    
    foreach ($match in $matches) {
        $assetPath = $match.Value
        if ($assetPath -notin $assets) {
            $assets += $assetPath
        }
    }
    
    return $assets
}

$iteration = 1
$maxIterations = 3

while ($iteration -le $maxIterations) {
    $allFiles = Get-ChildItem -Path "$outputDir\assets" -Recurse -File -Include *.js,*.css -ErrorAction SilentlyContinue
    
    $newAssets = @()
    foreach ($file in $allFiles) {
        $discovered = Get-AssetsFromFile -filePath $file.FullName
        foreach ($asset in $discovered) {
            $outputPath = Join-Path $outputDir $asset.TrimStart('/')
            if (-not (Test-Path $outputPath)) {
                $newAssets += $asset
            }
        }
    }
    
    $newAssets = $newAssets | Sort-Object -Unique
    
    if ($newAssets.Count -eq 0) { break }
    
    Write-Host "  Iteration $iteration : Found $($newAssets.Count) new assets" -ForegroundColor Cyan
    
    foreach ($asset in $newAssets) {
        Download-Asset -relativePath $asset
    }
    
    $iteration++
}

# Generate summary report
$duration = (Get-Date) - $stats.StartTime

Write-Host @"

╔═══════════════════════════════════════════════════════════╗
║                    Download Complete                      ║
╚═══════════════════════════════════════════════════════════╝

"@ -ForegroundColor Green

Write-Host "Statistics:" -ForegroundColor Yellow
Write-Host "  ✓ Downloaded: " -NoNewline -ForegroundColor Green
Write-Host $stats.TotalDownloaded
Write-Host "  ○ Skipped (already exist): " -NoNewline -ForegroundColor Cyan
Write-Host $stats.TotalSkipped
Write-Host "  ✗ Failed: " -NoNewline -ForegroundColor Red
Write-Host $stats.TotalFailed
Write-Host "  ⏱ Duration: " -NoNewline -ForegroundColor Magenta
Write-Host "$($duration.TotalSeconds.ToString('F1'))s"

# Count total files
$totalFiles = (Get-ChildItem -Path $outputDir -Recurse -File).Count
Write-Host "`nTotal files in directory: " -NoNewline -ForegroundColor Cyan
Write-Host $totalFiles

Write-Host "`nOutput directory: " -NoNewline -ForegroundColor Cyan
Write-Host $outputDir

Write-Host "`nTo use locally, open: " -NoNewline -ForegroundColor Yellow
Write-Host "$outputDir\evedex_local.html" -ForegroundColor White

Write-Host "`nNote: " -NoNewline -ForegroundColor Yellow
Write-Host "Some functionality may require backend API access." -ForegroundColor Gray
