# YKS Mentor

YKS öğrencileri için çalışma takip ve mentor desteği platformu.

## 🚀 Özellikler

- **Öğrenci Dashboard:** Çalışma süreleri, istatistikler, deneme sınavları
- **Mentor Dashboard:** Öğrenci takibi, görev atama, ilerleme raporları
- **Çalışma Takibi:** Pomodoro timer, ders bazlı çalışma kayıtları
- **Deneme Sınavları:** Mock exam sonuçları ve analiz
- **İstatistikler:** Detaylı grafik ve analizler
- **Responsive Design:** Mobil ve desktop uyumlu

## 🛠 Teknolojiler

### Frontend
- React.js
- Tailwind CSS
- Chart.js
- React Router
- React Hook Form

### Backend
- Node.js
- Express.js
- SQLite
- JWT Authentication
- Bcrypt

## 📦 Kurulum

### Gereksinimler
- Node.js (v16+)
- npm

### 1. Repository'yi klonlayın
```bash
git clone https://github.com/mkarslantas/yks-mentor.git
cd yks-mentor
```

### 2. Backend kurulumu
```bash
cd backend
npm install

# Veritabanı migration'larını çalıştırın
node migrations/run-all-migrations.js

# Development server'ı başlatın
npm start
```

### 3. Frontend kurulumu
```bash
cd ../frontend
npm install

# Development server'ı başlatın
npm run dev
```

## 🌐 Kullanım

### Development
- **Frontend:** http://localhost:3002
- **Backend:** http://localhost:3008

### Test Kullanıcıları
- **Öğrenci:** yagmur@arslantash.com / yks2024
- **Mentor:** mustafa@arslantash.com / mentor2024

## 📁 Proje Yapısı

```
yks-mentor/
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── middlewares/
│   │   └── utils/
│   ├── migrations/
│   └── database.db
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── hooks/
│   └── public/
└── docs/
```

## 🚀 Production Deployment

### Plesk Hosting
1. Repository'yi sunucuya klonlayın
2. Backend'i PM2 ile çalıştırın
3. Frontend'i build edip httpdocs'a kopyalayın
4. API proxy için .htaccess ayarlayın

Detaylı kurulum: [PLESK-DEPLOYMENT-CHECKLIST.md](PLESK-DEPLOYMENT-CHECKLIST.md)

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Giriş yap
- `POST /api/auth/logout` - Çıkış yap
- `GET /api/auth/profile` - Profil bilgisi
- `PUT /api/auth/profile` - Profil güncelle

### Students
- `GET /api/student/dashboard` - Dashboard verileri
- `POST /api/student/study-record` - Çalışma kaydı
- `GET /api/student/statistics` - İstatistikler

### Coach
- `GET /api/coach/students` - Öğrenci listesi
- `GET /api/coach/dashboard` - Mentor dashboard

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 👨‍💻 Geliştirici

**Mustafa Kemal Arslantaş** - [mkarslantas](https://github.com/mkarslantas)

## 🚀 Demo

- **Frontend:** [Demo Link](#) (Güncellenecek)
- **Backend API:** [API Link](#) (Güncellenecek)

## 🛠️ Teknoloji Stack

- **Frontend:** React 18, Tailwind CSS, React Big Calendar, Recharts
- **Backend:** Node.js, Express.js, SQLite
- **Authentication:** JWT with Refresh Tokens
- **State Management:** React Hooks & Context
- **UI Components:** Lucide Icons
- **Development:** Nodemon, ESLint

## Özellikler

### Öğrenci Özellikleri
- Günlük çalışma takibi (timer + manuel)
- Konu bazlı çalışma kaydı
- Pomodoro timer
- Deneme sonuçları takibi
- Grafik görüntüleme ve istatistikler
- Motivasyon sistemi (rozetler, streakler)
- Günlük/haftalık hedefler

### Koç Özellikleri
- Öğrenci listesi ve detay görüntüleme
- Haftalık plan oluşturma
- Görev atama sistemi
- Performans analizi ve raporlama
- Öğrenci mesajlaşma

### YKS Sistem Desteği
- TYT ve AYT konu yapıları
- 2026 YKS müfredatına uygun
- Alan bazlı takip (Sayısal, Eşit Ağırlık, Sözel, Dil)
- Net hesaplama ve puan tahmini

## 🚀 Kurulum

### Gereksinimler
- Node.js >= 16.0.0
- npm veya yarn

### 1. Repository'yi Klonlayın
```bash
git clone https://github.com/username/yks-mentor.git
cd yks-mentor
```

### 2. Backend Kurulumu
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenleyin
npm run migrate  # Database'i hazırla
npm run dev      # Development server'ı başlat
```

### 3. Frontend Kurulumu
```bash
cd frontend
npm install
npm run dev      # Development server'ı başlat
```

### 4. Uygulamayı Açın
- Frontend: http://localhost:3002
- Backend API: http://localhost:3001
- Health Check: http://localhost:3001/health

## 📦 Production Deployment

Production deployment için detaylı bilgi: [PRODUCTION-DEPLOYMENT.md](PRODUCTION-DEPLOYMENT.md)

```bash
# Backend Production
cd backend
./scripts/production-deploy.sh

# Frontend Production  
cd frontend
./scripts/build-production.sh
```

## 📁 Proje Yapısı

```
yks-mentor/
├── backend/                 # Node.js Backend
│   ├── src/
│   │   ├── controllers/     # Route handlers
│   │   ├── models/         # Database models  
│   │   ├── routes/         # API routes
│   │   ├── middlewares/    # Custom middlewares
│   │   ├── config/         # Configuration files
│   │   └── utils/          # Utility functions
│   ├── migrations/         # Database migrations
│   ├── scripts/           # Deployment & utility scripts
│   └── logs/              # Application logs
├── frontend/               # React Frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── contexts/      # React contexts
│   │   └── utils/         # Utility functions
│   └── public/            # Static assets
└── docs/                  # Documentation
```

## 🎯 Özellikler

### ✅ Tamamlanan Özellikler
- JWT Authentication & Authorization
- Student Dashboard & Task Management
- Coach Panel & Student Monitoring  
- Study Records & Time Tracking
- Pomodoro Timer System
- Calendar Integration (Task Scheduling)
- Mock Exam Tracking
- Performance Analytics & Charts
- Real-time Task Updates
- Role-based Access Control (Student/Coach/Parent)

### 🔄 Geliştirme Devam Eden
- Advanced Reporting System
- Mobile Responsive Improvements
- Email Notifications
- Batch Operations

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request açın

## 📞 İletişim

- **Geliştirici:** [İsim](mailto:email@example.com)
- **Proje Linki:** [https://github.com/username/yks-mentor](https://github.com/username/yks-mentor)

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 🔒 Güvenlik

Güvenlik açıkları için lütfen [güvenlik politikamızı](SECURITY.md) okuyun.