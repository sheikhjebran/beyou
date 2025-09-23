#!/bin/bash

# Production deployment script for BeYou uploads
# This script syncs local uploads to the production server

# Configuration
LOCAL_UPLOADS="./public/uploads"
PRODUCTION_UPLOADS="/var/www/beyou/uploads"

echo "🚀 Deploying BeYou uploads to production..."

# Create production uploads directory if it doesn't exist
echo "📁 Ensuring production uploads directory exists..."
sudo mkdir -p "$PRODUCTION_UPLOADS"

# Set proper ownership and permissions
echo "🔐 Setting proper permissions..."
sudo chown -R www-data:www-data "$PRODUCTION_UPLOADS"
sudo chmod -R 755 "$PRODUCTION_UPLOADS"

# Sync uploads to production
echo "📤 Syncing uploads to production..."
sudo rsync -av --delete "$LOCAL_UPLOADS/" "$PRODUCTION_UPLOADS/"

# Set permissions again after sync
sudo chown -R www-data:www-data "$PRODUCTION_UPLOADS"
sudo chmod -R 755 "$PRODUCTION_UPLOADS"

echo "✅ Upload deployment completed!"
echo "📊 Production uploads now available at: $PRODUCTION_UPLOADS"

# List uploaded files
echo "📋 Current uploads:"
sudo find "$PRODUCTION_UPLOADS" -type f -name "*.jpg" -o -name "*.png" -o -name "*.gif" -o -name "*.webp" | head -10