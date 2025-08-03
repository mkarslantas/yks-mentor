#!/bin/bash

# YKS Mentor - Plesk Deployment Script
echo "🚀 YKS Mentor Plesk Deployment başlıyor..."

# 1. Production dependencies yükle
echo "📦 Production dependencies yükleniyor..."
npm ci --only=production

# 2. Environment dosyasını kopyala
echo "🔧 Environment ayarları..."
cp .env.production .env

# 3. Database migration'ları çalıştır
echo "🗄️ Database migration'ları çalıştırılıyor..."
node migrations/migrate.js

# 4. Logs klasörünü oluştur
echo "📁 Logs klasörü oluşturuluyor..."
mkdir -p logs

# 5. PM2 ecosystem dosyasını Plesk için güncelle
echo "📝 PM2 ecosystem dosyası güncelleniyor..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'yks-mentor-api',
    script: 'src/app.js',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    max_memory_restart: '512M'
  }]
};
EOF

echo "✅ Backend deployment hazırlığı tamamlandı!"
echo ""
echo "📋 Sonraki adımlar:"
echo "1. Backend klasörünü Plesk'e upload edin"
echo "2. Plesk Node.js uygulamasını yapılandırın"
echo "3. pm2 start ecosystem.config.js çalıştırın"