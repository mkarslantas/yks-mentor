#!/bin/bash

# YKS Mentor Frontend Production Build Script
set -e

echo "🏗️ Starting YKS Mentor Frontend Production Build..."

# Check if we're in the frontend directory
if [ ! -f "package.json" ]; then
    echo "❌ package.json not found. Make sure you're in the frontend directory."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run linting
echo "🔍 Running linter..."
npm run lint

# Create production build
echo "🏗️ Creating production build..."
GENERATE_SOURCEMAP=false npm run build

# Check if build was successful
if [ ! -d "build" ]; then
    echo "❌ Build failed - build directory not found"
    exit 1
fi

echo "✅ Production build completed successfully!"
echo ""
echo "📁 Build files are in the 'build' directory"
echo "🌐 Deploy the 'build' directory to your web server"
echo ""
echo "🎯 Next steps:"
echo "1. Upload the 'build' directory to your web server"
echo "2. Configure your web server to serve index.html for all routes"
echo "3. Update REACT_APP_API_URL if needed"
echo "4. Configure HTTPS and security headers"