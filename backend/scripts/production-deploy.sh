#!/bin/bash

# YKS Mentor Production Deployment Script
set -e

echo "🚀 Starting YKS Mentor Production Deployment..."

# Check if required environment variables are set
if [ -z "$NODE_ENV" ]; then
    echo "❌ NODE_ENV environment variable is not set"
    exit 1
fi

if [ "$NODE_ENV" != "production" ]; then
    echo "❌ NODE_ENV must be set to 'production'"
    exit 1
fi

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Install dependencies
echo "📦 Installing production dependencies..."
npm ci --only=production

# Run database migrations
echo "🗄️ Running database migrations..."
node migrations/migrate.js

# Test database connection
echo "🔍 Testing database connection..."
node -e "
const database = require('./src/config/database');
database.get('SELECT 1 as test')
  .then(() => {
    console.log('✅ Database connection successful');
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err);
    process.exit(1);
  });
"

# Verify environment configuration
echo "🔧 Verifying environment configuration..."
node -e "
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'FRONTEND_URL',
  'BCRYPT_SALT_ROUNDS'
];

const missing = requiredEnvVars.filter(env => !process.env[env]);
if (missing.length > 0) {
  console.error('❌ Missing required environment variables:', missing);
  process.exit(1);
}

console.log('✅ All required environment variables are set');
"

# Create PM2 ecosystem file if not exists
if [ ! -f "ecosystem.config.js" ]; then
    echo "📝 Creating PM2 ecosystem configuration..."
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'yks-mentor-api',
    script: 'src/app.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: process.env.PORT || 3001
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    max_memory_restart: '1G',
    node_args: '--max-old-space-size=1024'
  }]
};
EOF
fi

echo "✅ Production deployment preparation completed!"
echo ""
echo "🎯 Next steps:"
echo "1. Make sure your production database is backed up"
echo "2. Update FRONTEND_URL in .env to your production domain"
echo "3. Set strong, unique JWT secrets in .env"
echo "4. Configure your email settings"
echo "5. Run: pm2 start ecosystem.config.js"
echo "6. Run: pm2 save && pm2 startup"
echo ""
echo "📊 Monitor with: pm2 monit"
echo "📋 View logs with: pm2 logs"