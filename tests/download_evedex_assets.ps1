# PowerShell script to download EVEDEX assets for local use
# This script downloads all external resources referenced in the HTML

$baseUrl = "https://exchange.evedex.com"
$outputDir = "e:\chipa\ChipaX\tests\evedex_assets"

# Create output directories
$dirs = @(
    "$outputDir",
    "$outputDir\assets",
    "$outputDir\assets\fonts",
    "$outputDir\assets\fonts\stapel",
    "$outputDir\assets\fonts\digital-numbers",
    "$outputDir\trading_platform",
    "$outputDir\trading_platform\charting_library"
)

foreach ($dir in $dirs) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "Created directory: $dir" -ForegroundColor Green
    }
}

# Function to download a file
function Download-File {
    param (
        [string]$url,
        [string]$outputPath
    )
    
    try {
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

# List of files to download
$downloads = @(
    @{
        Url = "$baseUrl/trading_platform/charting_library/charting_library.js"
        Output = "$outputDir\trading_platform\charting_library\charting_library.js"
    },
    @{
        Url = "$baseUrl/assets/fonts/stapel/stapel.css"
        Output = "$outputDir\assets\fonts\stapel\stapel.css"
    },
    @{
        Url = "$baseUrl/assets/fonts/digital-numbers/digital-numbers.css"
        Output = "$outputDir\assets\fonts\digital-numbers\digital-numbers.css"
    },
    @{
        Url = "$baseUrl/assets/index-RDyXvyzL.js"
        Output = "$outputDir\assets\index-RDyXvyzL.js"
    },
    @{
        Url = "$baseUrl/assets/@react-router-B_Yxq9fH.js"
        Output = "$outputDir\assets\@react-router-B_Yxq9fH.js"
    },
    @{
        Url = "$baseUrl/assets/@wagmi-core-ClbrNBk4.js"
        Output = "$outputDir\assets\@wagmi-core-ClbrNBk4.js"
    },
    @{
        Url = "$baseUrl/assets/@wagmi-BZ-YosZW.js"
        Output = "$outputDir\assets\@wagmi-BZ-YosZW.js"
    },
    @{
        Url = "$baseUrl/assets/index-CbX4KGWS.css"
        Output = "$outputDir\assets\index-CbX4KGWS.css"
    },
    @{
        Url = "$baseUrl/apple-touch-icon.png"
        Output = "$outputDir\apple-touch-icon.png"
    },
    @{
        Url = "$baseUrl/favicon-32x32.png"
        Output = "$outputDir\favicon-32x32.png"
    },
    @{
        Url = "$baseUrl/favicon-16x16.png"
        Output = "$outputDir\favicon-16x16.png"
    }
)

# Download all files
$successCount = 0
$failCount = 0

Write-Host "`nStarting downloads..." -ForegroundColor Yellow
Write-Host "==========================================`n" -ForegroundColor Yellow

foreach ($download in $downloads) {
    if (Download-File -url $download.Url -outputPath $download.Output) {
        $successCount++
    }
    else {
        $failCount++
    }
    Start-Sleep -Milliseconds 500  # Brief delay between downloads
}

Write-Host "`n==========================================" -ForegroundColor Yellow
Write-Host "Download Summary:" -ForegroundColor Yellow
Write-Host "  Successful: $successCount" -ForegroundColor Green
Write-Host "  Failed: $failCount" -ForegroundColor Red
Write-Host "`nAssets saved to: $outputDir" -ForegroundColor Cyan

# Create a local HTML file with updated paths
$localHtmlPath = "$outputDir\evedex_local.html"
$htmlContent = @"
<!doctype html>
<html dir="ltr" lang="en" class="dark" translate="no">
  <head>
    <meta charset="UTF-8" />
    <link rel="apple-touch-icon" sizes="180x180" href="./apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="./favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="./favicon-16x16.png" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="google" content="notranslate" />
    
    <!-- Meta Tags -->
    <title>
      EVEDEX - Hybrid Cryptocurrency Exchange | Day Trading, P2P, Copy Trading &
      Futures Market
    </title>

    <!-- The script that loads the library -->
    <script
      type="text/javascript"
      src="./trading_platform/charting_library/charting_library.js"
    ></script>
    <link rel="stylesheet" href="./assets/fonts/stapel/stapel.css" />
    <link
      rel="stylesheet"
      href="./assets/fonts/digital-numbers/digital-numbers.css"
    />
    <script type="module" async crossorigin src="./assets/index-RDyXvyzL.js"></script>
    <link rel="modulepreload" crossorigin href="./assets/@react-router-B_Yxq9fH.js">
    <link rel="modulepreload" crossorigin href="./assets/@wagmi-core-ClbrNBk4.js">
    <link rel="modulepreload" crossorigin href="./assets/@wagmi-BZ-YosZW.js">
    <link rel="stylesheet" crossorigin href="./assets/index-CbX4KGWS.css">
  </head>

  <body>
    <div id="root"></div>
  </body>
</html>
"@

$htmlContent | Out-File -FilePath $localHtmlPath -Encoding UTF8
Write-Host "`nLocal HTML file created: $localHtmlPath" -ForegroundColor Green
Write-Host "You can open this file in a browser to use the local assets." -ForegroundColor Cyan
