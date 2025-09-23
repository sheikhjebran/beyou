# Production deployment script for BeYou uploads (PowerShell version)
# This script prepares uploads for production deployment

param(
    [string]$LocalUploads = ".\public\uploads",
    [string]$OutputZip = "uploads-deployment.zip"
)

Write-Host "🚀 Preparing BeYou uploads for production deployment..." -ForegroundColor Green

# Check if local uploads exist
if (-not (Test-Path $LocalUploads)) {
    Write-Host "❌ Local uploads directory not found: $LocalUploads" -ForegroundColor Red
    exit 1
}

# Create deployment package
Write-Host "📦 Creating deployment package..." -ForegroundColor Yellow

# Remove existing zip if it exists
if (Test-Path $OutputZip) {
    Remove-Item $OutputZip -Force
}

# Create zip file with uploads
Compress-Archive -Path "$LocalUploads\*" -DestinationPath $OutputZip -Force

Write-Host "✅ Deployment package created: $OutputZip" -ForegroundColor Green

# List contents
Write-Host "📋 Package contents:" -ForegroundColor Cyan
Get-ChildItem $LocalUploads -Recurse -File | Select-Object Name, Length, LastWriteTime | Format-Table

Write-Host "📤 Next steps:" -ForegroundColor Yellow
Write-Host "1. Upload $OutputZip to your server" -ForegroundColor White
Write-Host "2. Extract to /var/www/beyou/uploads/" -ForegroundColor White
Write-Host "3. Set proper permissions (chown www-data:www-data)" -ForegroundColor White