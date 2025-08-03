# YKS Mentor - Plesk Deployment Checklist

## ✅ Ön Hazırlık
- [ ] Plesk Panel erişimi hazır
- [ ] yagmur.arslantash.com domain aktif
- [ ] Node.js 16+ Plesk'te mevcut

## 📁 Dosya Yapısı
```
yagmur.arslantash.com/
├── httpdocs/              # Frontend build dosyaları
│   ├── index.html
│   ├── static/
│   └── .htaccess
├── backend/               # Backend uygulaması
│   ├── src/
│   ├── migrations/
│   ├── package.json
│   ├── .env
│   └── ecosystem.config.js
└── logs/                  # Log dosyaları
```

## 🚀 Backend Deployment

### 1. Upload Backend
- [ ] `backend/src/` klasörü upload edildi
- [ ] `backend/migrations/` upload edildi
- [ ] `backend/package.json` upload edildi
- [ ] `backend/.env.production` → `.env` olarak kopyalandı

### 2. Dependencies Kurulum
```bash
cd /var/www/vhosts/yagmur.arslantash.com/backend
npm ci --only=production
```

### 3. Database Setup
```bash
node migrations/migrate.js
```

### 4. Node.js App Config
- [ ] Plesk Node.js uygulaması oluşturuldu
- [ ] Application root: `/backend`
- [ ] Startup file: `src/app.js`
- [ ] Environment variables set edildi

## 🌐 Frontend Deployment

### 1. Build Frontend
```bash
cd frontend
REACT_APP_API_URL=https://yagmur.arslantash.com/api npm run build
```

### 2. Upload Frontend
- [ ] `frontend/build/*` → `httpdocs/` kopyalandı
- [ ] `.htaccess` dosyası `httpdocs/` içine konuldu

## 🔐 SSL & Security

### 1. SSL Sertifika
- [ ] Let's Encrypt sertifikası kuruldu
- [ ] HTTPS redirect aktif
- [ ] Mixed content uyarıları yok

### 2. Security Headers
- [ ] `.htaccess` security headers aktif
- [ ] CORS ayarları doğru
- [ ] Rate limiting aktif

## 🧪 Test & Verification

### 1. Frontend Test
- [ ] https://yagmur.arslantash.com erişilebilir
- [ ] React uygulaması yükleniyor
- [ ] Navigation çalışıyor

### 2. Backend Test
- [ ] https://yagmur.arslantash.com/api/health erişilebilir
- [ ] Register endpoint çalışıyor
- [ ] Database bağlantısı OK

### 3. Integration Test
- [ ] Login/Register işlemleri çalışıyor
- [ ] API çağrıları başarılı
- [ ] Student dashboard açılıyor

## 🔧 Troubleshooting

### Yaygın Sorunlar

1. **500 Internal Server Error**
   - Node.js uygulaması çalışıyor mu?
   - `.env` dosyası doğru mu?
   - Log dosyalarını kontrol et

2. **CORS Hatası**
   - `FRONTEND_URL` doğru mu?
   - Backend CORS ayarları kontrol et

3. **Database Hatası**
   - Migration'lar çalıştı mı?
   - Database dosyası var mı?
   - Write permissions OK mi?

4. **Frontend 404**
   - `.htaccess` dosyası var mı?
   - Mod_rewrite aktif mi?
   - React Router config doğru mu?

## 📊 Performance Optimization

- [ ] Gzip compression aktif
- [ ] Static file caching aktif
- [ ] Image optimization yapıldı
- [ ] Bundle size optimize edildi

## 🔍 Monitoring

### Log Locations
```
Backend Logs: /var/www/vhosts/yagmur.arslantash.com/backend/logs/
Plesk Logs: /var/www/vhosts/yagmur.arslantash.com/logs/
```

### Commands
```bash
# Backend durumu
pm2 status

# Log görüntüleme
pm2 logs yks-mentor-api

# Restart
pm2 restart yks-mentor-api
```

## 📞 Support

- Plesk dokümantasyonu
- Node.js troubleshooting guide
- SSL sertifika renewal otomatik

---
**Deploy Date:** $(date)
**Domain:** https://yagmur.arslantash.com
**Status:** ✅ Ready for Production