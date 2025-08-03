#!/bin/bash

# YKS Mentor - GitHub to Plesk Deployment Script
echo "🚀 GitHub'dan Plesk'e YKS Mentor deployment başlıyor..."

# Rengarenk output için
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# GitHub repository URL'ini buraya girin
GITHUB_REPO="https://github.com/YOUR-USERNAME/yks-mentor.git"
DOMAIN="yagmur.arslantash.com"

echo -e "${BLUE}📋 Deployment Bilgileri:${NC}"
echo "Repository: $GITHUB_REPO"
echo "Domain: $DOMAIN"
echo "Date: $(date)"
echo ""

# Ana dizine git
cd /var/www/vhosts/$DOMAIN

echo -e "${YELLOW}📁 Mevcut dosyalar yedekleniyor...${NC}"
if [ -d "backend" ]; then
    mv backend backend-backup-$(date +%Y%m%d-%H%M%S)
fi
if [ -d "frontend" ]; then
    mv frontend frontend-backup-$(date +%Y%m%d-%H%M%S)
fi

echo -e "${YELLOW}📦 GitHub'dan kod çekiliyor...${NC}"
git clone $GITHUB_REPO temp-yks
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ GitHub clone başarılı${NC}"
else
    echo -e "${RED}❌ GitHub clone hatası${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Dosyalar kopyalanıyor...${NC}"
cp -r temp-yks/backend ./
cp -r temp-yks/frontend ./
rm -rf temp-yks

echo -e "${YELLOW}🔧 Backend yapılandırması...${NC}"
cd backend

# Environment dosyası oluştur
cat > .env << EOF
NODE_ENV=production
PORT=3001
DATABASE_URL=sqlite://./database.db
JWT_SECRET=YKS-2024-YAGMUR-SUPER-SECURE-JWT-SECRET-PRODUCTION-32CHARS
JWT_REFRESH_SECRET=YKS-2024-YAGMUR-SUPER-SECURE-REFRESH-SECRET-PRODUCTION
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://$DOMAIN
EMAIL_SERVICE=gmail
EMAIL_USER=mkarslantas@gmail.com
EMAIL_PASS=your-app-specific-password
BCRYPT_SALT_ROUNDS=12
EOF

echo -e "${YELLOW}📦 Backend dependencies yükleniyor...${NC}"
npm ci --only=production
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend dependencies OK${NC}"
else
    echo -e "${RED}❌ Backend dependencies hatası${NC}"
fi

echo -e "${YELLOW}🗄️ Database migration'ları çalıştırılıyor...${NC}"
node migrations/migrate.js
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Database migrations OK${NC}"
else
    echo -e "${RED}❌ Database migration hatası${NC}"
fi

# Logs klasörü
mkdir -p logs

echo -e "${YELLOW}🌐 Frontend build oluşturuluyor...${NC}"
cd ../frontend

# Environment variables
export REACT_APP_API_URL=https://$DOMAIN/api
export PUBLIC_URL=https://$DOMAIN
export GENERATE_SOURCEMAP=false

npm ci
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend dependencies OK${NC}"
else
    echo -e "${RED}❌ Frontend dependencies hatası${NC}"
fi

npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Frontend build OK${NC}"
else
    echo -e "${RED}❌ Frontend build hatası${NC}"
fi

echo -e "${YELLOW}📁 Frontend dosyaları kopyalanıyor...${NC}"
rm -rf ../httpdocs/*
cp -r build/* ../httpdocs/

# .htaccess dosyası
cat > ../httpdocs/.htaccess << 'EOF'
RewriteEngine On
RewriteBase /

# API proxy
RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

# React Router
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule . /index.html [L]

# Security headers
Header always set X-Frame-Options "SAMEORIGIN"
Header always set X-Content-Type-Options "nosniff"
Header always set X-XSS-Protection "1; mode=block"

# HTTPS redirect
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
EOF

echo -e "${YELLOW}🧪 Deployment test ediliyor...${NC}"
cd ..

# Health check
sleep 3
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN/api/health)
if [ "$HEALTH_CHECK" = "200" ]; then
    echo -e "${GREEN}✅ Backend health check OK${NC}"
else
    echo -e "${RED}❌ Backend health check FAILED (HTTP: $HEALTH_CHECK)${NC}"
fi

# Frontend check
FRONTEND_CHECK=$(curl -s -o /dev/null -w "%{http_code}" https://$DOMAIN)
if [ "$FRONTEND_CHECK" = "200" ]; then
    echo -e "${GREEN}✅ Frontend erişim OK${NC}"
else
    echo -e "${RED}❌ Frontend erişim FAILED (HTTP: $FRONTEND_CHECK)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment tamamlandı!${NC}"
echo -e "${BLUE}🌐 Site: https://$DOMAIN${NC}"
echo -e "${BLUE}📊 API: https://$DOMAIN/api/health${NC}"
echo ""
echo -e "${YELLOW}📋 Sonraki adımlar:${NC}"
echo "1. Plesk Panel'de Node.js uygulamasını kontrol edin"
echo "2. SSL sertifikasını doğrulayın"
echo "3. Test kullanıcısı oluşturun"
echo ""
echo -e "${BLUE}📝 Log dosyaları:${NC}"
echo "Backend: /var/www/vhosts/$DOMAIN/backend/logs/"
echo "Plesk: /var/www/vhosts/$DOMAIN/logs/"
EOF