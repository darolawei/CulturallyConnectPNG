param(
  [string]$SourceRoot = "artifacts/culturally-connect-png/public/media/provinces",
  [string]$OutputRoot = ".wrangler/r2-mobile",
  [int]$DurationSeconds = 24
)

$ErrorActionPreference = "Stop"

$ffmpeg = Resolve-Path "node_modules/.pnpm/ffmpeg-static@5.3.0/node_modules/ffmpeg-static/ffmpeg.exe"
$sourceRootPath = Resolve-Path $SourceRoot
New-Item -ItemType Directory -Force $OutputRoot | Out-Null

$files = Get-ChildItem -Path $sourceRootPath -Recurse -File -Filter "dance-short.mp4"

foreach ($file in $files) {
  $provinceId = Split-Path $file.DirectoryName -Leaf
  $outputDir = Join-Path $OutputRoot $provinceId
  $output = Join-Path $outputDir "dance-short.mp4"
  New-Item -ItemType Directory -Force $outputDir | Out-Null

  Write-Host "Encoding $provinceId"

  & $ffmpeg `
    -y `
    -i $file.FullName `
    -vf "scale='min(720,iw)':-2" `
    -t $DurationSeconds `
    -c:v libx264 `
    -preset veryfast `
    -crf 32 `
    -c:a aac `
    -b:a 96k `
    -movflags +faststart `
    $output

  if ($LASTEXITCODE -ne 0) {
    throw "Encoding failed for $provinceId"
  }
}

Write-Host "Encoded $($files.Count) mobile video file(s) into $OutputRoot"
