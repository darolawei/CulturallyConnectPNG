param(
  [Parameter(Mandatory = $true)]
  [string]$Bucket,

  [string]$PublicRoot = "artifacts/culturally-connect-png/public",

  [switch]$IncludeAllMp4
)

$ErrorActionPreference = "Stop"

$root = Resolve-Path $PublicRoot
$mediaRoot = Join-Path $root "media/provinces"

if (-not (Test-Path $mediaRoot)) {
  throw "Media directory was not found: $mediaRoot"
}

$files = if ($IncludeAllMp4) {
  Get-ChildItem -Path $mediaRoot -Recurse -File -Filter "*.mp4"
} else {
  @(
    Get-ChildItem -Path $mediaRoot -Recurse -File -Filter "dance-short.mp4"
    Get-ChildItem -Path (Join-Path $mediaRoot "national-capital") -File -Filter "VID-20260515-WA0009.mp4"
  ) | Where-Object { $_ -ne $null }
}

if ($files.Count -eq 0) {
  Write-Host "No media files matched under $mediaRoot"
  exit 0
}

foreach ($file in $files) {
  $relativePath = [System.IO.Path]::GetRelativePath($root, $file.FullName)
  $objectKey = $relativePath.Replace("\", "/")
  $objectPath = "$Bucket/$objectKey"

  Write-Host "Uploading $objectKey"

  & npx --yes wrangler r2 object put $objectPath `
    --file $file.FullName `
    --content-type "video/mp4" `
    --cache-control "public, max-age=31536000, immutable"

  if ($LASTEXITCODE -ne 0) {
    throw "Upload failed for $objectKey"
  }
}

Write-Host "Uploaded $($files.Count) file(s) to R2 bucket $Bucket"
