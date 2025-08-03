# YKS Mentor Production Deployment Guide

## 📋 Pre-Deployment Checklist

### 1. Environment Setup
- [ ] Update `.env` file with production values
- [ ] Set strong, unique JWT secrets (min 32 characters)
- [ ] Configure production database URL
- [ ] Set `NODE_ENV=production`
- [ ] Update `FRONTEND_URL` to your production domain
- [ ] Configure email settings (Gmail app password)

### 2. Security Configuration
- [ ] Verify CORS origins are correctly set
- [ ] Check rate limiting is enabled for production
- [ ] Ensure HTTPS is configured
- [ ] Review security headers configuration
- [ ] Set strong `BCRYPT_SALT_ROUNDS=12`

### 3. Database Preparation
- [ ] Backup existing data (if any)
- [ ] Run all migrations: `node migrations/migrate.js`
- [ ] Clean demo data: `node scripts/clean-demo-data.js`
- [ ] Verify database integrity

## 🚀 Backend Deployment

### 1. Server Requirements
- Node.js >= 16.0.0
- PM2 (for process management)
- SQLite3
- Minimum 1GB RAM
- SSL certificate for HTTPS

### 2. Deployment Steps

```bash
# 1. Clone/update repository
git clone <your-repo-url>
cd yks-mentor/backend

# 2. Install dependencies
npm ci --only=production

# 3. Configure environment
cp .env.example .env
# Edit .env with your production values

# 4. Run deployment script
chmod +x scripts/production-deploy.sh
./scripts/production-deploy.sh

# 5. Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 3. PM2 Management Commands
```bash
# View status
pm2 status

# Monitor processes
pm2 monit

# View logs
pm2 logs

# Restart application
pm2 restart yks-mentor-api

# Stop application
pm2 stop yks-mentor-api
```

## 🌐 Frontend Deployment

### 1. Build for Production

```bash
cd yks-mentor/frontend

# Run build script
chmod +x scripts/build-production.sh
./scripts/build-production.sh
```

### 2. Web Server Configuration

#### Nginx Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/your/certificate.crt;
    ssl_certificate_key /path/to/your/private.key;
    
    root /path/to/yks-mentor/frontend/build;
    index index.html;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    
    # Handle React Router
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # API proxy
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Static file caching
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### Apache Configuration
```apache
<VirtualHost *:443>
    ServerName yourdomain.com
    DocumentRoot /path/to/yks-mentor/frontend/build
    
    SSLEngine on
    SSLCertificateFile /path/to/your/certificate.crt
    SSLCertificateKeyFile /path/to/your/private.key
    
    # Security headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-XSS-Protection "1; mode=block"
    
    # Handle React Router
    RewriteEngine On
    RewriteRule ^(?!.*\\.).*$ /index.html [L]
    
    # API proxy
    ProxyPass /api http://localhost:3001/api
    ProxyPassReverse /api http://localhost:3001/api
</VirtualHost>
```

## 🔧 Production Configuration

### Environment Variables (.env)
```bash
NODE_ENV=production
PORT=3001
DATABASE_URL=sqlite://./database.db
JWT_SECRET=your-super-secure-jwt-secret-32-chars-min
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-32-chars-min
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
FRONTEND_URL=https://yourdomain.com
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
BCRYPT_SALT_ROUNDS=12
```

### Production Features Enabled
- ✅ Request rate limiting (100 requests/15min)
- ✅ Strict authentication rate limiting (5 attempts/15min)
- ✅ Enhanced security headers
- ✅ Error logging to files
- ✅ Database optimization (WAL mode)
- ✅ JWT token expiry reduced to 15 minutes
- ✅ Strong password hashing (12 salt rounds)

## 📊 Monitoring & Maintenance

### 1. Log Files
- Application logs: `logs/app-YYYY-MM-DD.log`
- Error logs: `logs/error-YYYY-MM-DD.log`
- PM2 logs: `logs/pm2-*.log`

### 2. Database Maintenance
```bash
# Backup database
cp database.db database-backup-$(date +%Y%m%d).db

# Check database integrity
sqlite3 database.db "PRAGMA integrity_check;"

# Optimize database
sqlite3 database.db "VACUUM;"
```

### 3. Health Monitoring
- Health check endpoint: `https://yourdomain.com/api/health`
- Monitor response times and error rates
- Set up alerts for application downtime

## 🔒 Security Best Practices

### 1. Server Security
- [ ] Keep server OS updated
- [ ] Configure firewall (allow only 80, 443, SSH)
- [ ] Disable root SSH login
- [ ] Use SSH keys instead of passwords
- [ ] Regular security updates

### 2. Application Security
- [ ] Regular dependency updates: `npm audit`
- [ ] Monitor security vulnerabilities
- [ ] Implement proper backup strategy
- [ ] Use HTTPS everywhere
- [ ] Validate all user inputs

### 3. Database Security
- [ ] Regular database backups
- [ ] Restrict database file permissions
- [ ] Monitor for unusual activity
- [ ] Keep SQLite updated

## 🆘 Troubleshooting

### Common Issues

#### 1. Application Won't Start
```bash
# Check logs
pm2 logs yks-mentor-api

# Check environment variables
node -e "console.log(process.env.NODE_ENV)"

# Test database connection
node -e "require('./src/config/database').get('SELECT 1')"
```

#### 2. CORS Errors
- Verify `FRONTEND_URL` in `.env`
- Check if frontend URL matches exactly
- Ensure protocol (http/https) is correct

#### 3. Database Issues
```bash
# Check database file permissions
ls -la database.db

# Run integrity check
sqlite3 database.db "PRAGMA integrity_check;"

# Re-run migrations if needed
node migrations/migrate.js
```

#### 4. High Memory Usage
```bash
# Monitor memory usage
pm2 monit

# Restart if needed
pm2 restart yks-mentor-api

# Check for memory leaks in logs
pm2 logs --lines 100
```

## 📈 Performance Optimization

### 1. Database Optimization
- WAL mode enabled for better concurrency
- 64MB cache size configured
- Regular VACUUM operations

### 2. Application Optimization
- Cluster mode with PM2 (uses all CPU cores)
- Memory limit set to 1GB per process
- Request caching for static assets

### 3. Frontend Optimization
- Static file caching (1 year)
- Gzip compression enabled
- CDN recommended for global deployment

## 📞 Support

For deployment issues or questions:
1. Check logs first: `pm2 logs`
2. Review this documentation
3. Test in development environment first
4. Contact system administrator

---

**⚠️ Important**: Always test deployment in a staging environment before production!