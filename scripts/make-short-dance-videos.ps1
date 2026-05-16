$ErrorActionPreference = "Stop"

$root = Join-Path $PSScriptRoot "..\artifacts\culturally-connect-png\public\media\provinces"
$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$localFfmpeg = node -e "console.log(require('ffmpeg-static'))"
$ffmpeg = if (Get-Command ffmpeg -ErrorAction SilentlyContinue) {
  "ffmpeg"
} elseif ($localFfmpeg -and (Test-Path $localFfmpeg)) {
  $localFfmpeg
} else {
  $null
}

if (-not $ffmpeg) {
  throw "ffmpeg is required. Install ffmpeg or run pnpm add -Dw ffmpeg-static."
}

Get-ChildItem -Path $root -Recurse -Filter "dance.mp4" | ForEach-Object {
  $input = $_.FullName
  $output = Join-Path $_.DirectoryName "dance-short.mp4"

  Write-Host "Creating $output"
  & $ffmpeg `
    -y `
    -ss 2 `
    -t 30 `
    -i $input `
    -vf "scale='min(1280,iw)':-2" `
    -movflags +faststart `
    -c:v libx264 `
    -preset veryfast `
    -crf 28 `
    -c:a aac `
    -b:a 96k `
    $output
}
