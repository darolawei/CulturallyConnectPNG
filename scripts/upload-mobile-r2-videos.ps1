param(
  [Parameter(Mandatory = $true)]
  [string]$Bucket,

  [string]$InputRoot = ".wrangler/r2-mobile"
)

$ErrorActionPreference = "Stop"

$inputRootPath = Resolve-Path $InputRoot
$files = Get-ChildItem -Path $inputRootPath -Recurse -File -Filter "dance-short.mp4"

foreach ($file in $files) {
  $provinceId = Split-Path $file.DirectoryName -Leaf
  $objectKey = "media/provinces/$provinceId/dance-short.mp4"

  Write-Host "Uploading $objectKey"

  & npx --yes wrangler r2 object put "$Bucket/$objectKey" `
    --remote `
    --file $file.FullName `
    --content-type "video/mp4" `
    --cache-control "public, max-age=31536000, immutable"

  if ($LASTEXITCODE -ne 0) {
    throw "Upload failed for $objectKey"
  }
}

Write-Host "Uploaded $($files.Count) mobile video file(s) to R2 bucket $Bucket"
