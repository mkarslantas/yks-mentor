#!/bin/bash
  # Production deployment script
  # Copy working database from local to production

  echo "🚀 Deploying to production..."

  # Backend deployment
  echo "📦 Installing backend dependencies..."
  cd backend
  npm install --production

  # Copy local database to production (if needed)
  echo "🗄️ Database ready for production"

  # Build frontend
  echo "🎨 Building frontend..."
  cd ../frontend
  npm install
  npm run build

  echo "✅ Build complete! Ready for production deployment."
  echo "📋 Next steps:"
  echo "1. Copy backend/ to server"
  echo "2. Copy frontend/build/ to httpdocs/"
  echo "3. Copy database.db to server"
  echo "4. Restart PM2: pm2 restart yks-backend"
  
