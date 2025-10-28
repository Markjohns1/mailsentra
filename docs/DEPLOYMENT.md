# Deployment Guide

Complete guide for deploying MailSentra to various platforms and environments.

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Cloud Platforms](#cloud-platforms)
- [Database Setup](#database-setup)
- [SSL/TLS Configuration](#ssltls-configuration)
- [Monitoring & Logging](#monitoring--logging)
- [Backup & Recovery](#backup--recovery)

---

## Prerequisites

### Required Tools
- Docker & Docker Compose
- Git
- SSL Certificate (for production)
- Domain name (optional but recommended)

### Minimum Server Requirements

**Development**:
- 2 CPU cores
- 4GB RAM
- 20GB storage

**Production**:
- 4 CPU cores
- 8GB RAM
- 50GB storage
- Load balancer (for high traffic)

---

## Environment Configuration

### Backend Environment (.env)

Create `backend/.env` file:

```bash
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/mailsentra
# For SQLite: sqlite:///./spam_detector.db

# Security
SECRET_KEY=your-super-secret-key-min-32-chars
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Origins (comma-separated)
CORS_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Rate Limiting
RATE_LIMIT_PER_MINUTE=60

# Environment
ENVIRONMENT=production
DEBUG=False

# Email (optional - for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

### Frontend Environment (.env)

Create `frontend/.env` file:

```bash
# API Configuration
VITE_API_URL=https://api.yourdomain.com

# App Configuration
VITE_APP_NAME=MailSentra
VITE_APP_VERSION=1.0.0
```

### Security Best Practices

1. **Generate Strong SECRET_KEY**:
   ```bash
   python -c "import secrets; print(secrets.token_urlsafe(32))"
   ```

2. **Never Commit .env Files**:
   Add to `.gitignore`:
   ```
   .env
   .env.local
   .env.production
   ```

3. **Use Environment-Specific Configs**:
   - `.env.development`
   - `.env.staging`
   - `.env.production`

---

## Docker Deployment

### 1. Create Docker Files

**backend/Dockerfile**:
```dockerfile
FROM python:3.13-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Download NLTK data
RUN python -c "import nltk; nltk.download('stopwords'); nltk.download('punkt')"

# Copy application
COPY . .

# Run migrations
RUN alembic upgrade head

# Expose port
EXPOSE 8000

# Start application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

**frontend/Dockerfile**:
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Build application
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy build files
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**frontend/nginx.conf**:
```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    location / {
        try_files \ \/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. Docker Compose Configuration

**docker-compose.yml** (project root):
```yaml
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:14-alpine
    container_name: mailsentra-db
    environment:
      POSTGRES_USER: mailsentra
      POSTGRES_PASSWORD: 
      POSTGRES_DB: mailsentra
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - mailsentra-network
    restart: unless-stopped

  # Backend API
  backend:
    build: ./backend
    container_name: mailsentra-backend
    environment:
      DATABASE_URL: postgresql://mailsentra:@db:5432/mailsentra
      SECRET_KEY: 
      CORS_ORIGINS: 
    depends_on:
      - db
    networks:
      - mailsentra-network
    restart: unless-stopped

  # Frontend
  frontend:
    build: ./frontend
    container_name: mailsentra-frontend
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      - backend
    networks:
      - mailsentra-network
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: mailsentra-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/ssl:/etc/nginx/ssl:ro
    depends_on:
      - backend
      - frontend
    networks:
      - mailsentra-network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  mailsentra-network:
    driver: bridge
```

### 3. Deploy with Docker Compose

```bash
# Create .env file in project root
echo "DB_PASSWORD=your-secure-password" > .env
echo "SECRET_KEY=your-secret-key" >> .env
echo "CORS_ORIGINS=https://yourdomain.com" >> .env

# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

---

## Cloud Platforms

### Railway Deployment (Backend)

1. **Install Railway CLI**:
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize**:
   ```bash
   railway login
   cd backend
   railway init
   ```

3. **Add PostgreSQL**:
   ```bash
   railway add --plugin postgresql
   ```

4. **Set Environment Variables**:
   ```bash
   railway variables set SECRET_KEY=your-secret-key
   railway variables set CORS_ORIGINS=https://yourfrontend.vercel.app
   ```

5. **Deploy**:
   ```bash
   railway up
   ```

6. **Get API URL**:
   ```bash
   railway domain
   ```

### Render Deployment (Backend)

1. Go to [render.com](https://render.com)
2. Click "New +" â†’ "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port \`
5. Add Environment Variables in dashboard
6. Add PostgreSQL database (Add-ons)
7. Deploy

### Vercel Deployment (Frontend)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   cd frontend
   vercel
   ```

3. **Set Environment Variables**:
   - Go to Vercel dashboard
   - Settings â†’ Environment Variables
   - Add `VITE_API_URL`

4. **Production Deployment**:
   ```bash
   vercel --prod
   ```

### Netlify Deployment (Frontend)

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build**:
   ```bash
   cd frontend
   npm run build
   ```

3. **Deploy**:
   ```bash
   netlify deploy --prod --dir=dist
   ```

4. **Configure**:
   - Add `_redirects` file in `public/`:
     ```
     /*    /index.html   200
     ```

---

## Database Setup

### PostgreSQL Production Setup

1. **Create Database**:
   ```sql
   CREATE DATABASE mailsentra;
   CREATE USER mailsentra_user WITH PASSWORD 'secure-password';
   GRANT ALL PRIVILEGES ON DATABASE mailsentra TO mailsentra_user;
   ```

2. **Run Migrations**:
   ```bash
   cd backend
   alembic upgrade head
   ```

3. **Create Admin User** (optional):
   ```bash
   python scripts/create_admin.py
   ```

### Database Backup

**Automated Backup Script** (`scripts/backup_db.sh`):
```bash
#!/bin/bash
TIMESTAMP=
BACKUP_DIR="/backups"
DB_NAME="mailsentra"

# Create backup
pg_dump -U mailsentra_user -d  > "/backup_.sql"

# Compress
gzip "/backup_.sql"

# Delete backups older than 30 days
find  -name "backup_*.sql.gz" -mtime +30 -delete

echo "Backup completed: backup_.sql.gz"
```

**Schedule with Cron**:
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup_db.sh
```

---

## SSL/TLS Configuration

### Using Certbot (Let's Encrypt)

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    # SSL Security
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256';
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    location / {
        proxy_pass http://backend:8000;
        proxy_set_header Host \System.Management.Automation.Internal.Host.InternalHost;
        proxy_set_header X-Real-IP \;
        proxy_set_header X-Forwarded-For \;
        proxy_set_header X-Forwarded-Proto \;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://\\;
}
```

---

## Monitoring & Logging

### Application Logging

**Backend logging configuration** (already in `app/utils/logger.py`):
```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/app.log'),
        logging.StreamHandler()
    ]
)
```

### Health Check Endpoint

Add to `backend/main.py`:
```python
@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "1.0.0"
    }
```

### Monitoring Tools

**Prometheus + Grafana** (optional):
```yaml
# Add to docker-compose.yml
  prometheus:
    image: prom/prometheus
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
    ports:
      - "9090:9090"

  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    depends_on:
      - prometheus
```

---

## Backup & Recovery

### Full System Backup

```bash
#!/bin/bash
# backup_system.sh

# Backup database
docker exec mailsentra-db pg_dump -U mailsentra mailsentra > db_backup.sql

# Backup ML models
tar -czf ml_models_backup.tar.gz backend/ml_models/

# Backup environment files
cp backend/.env backend_env_backup
cp frontend/.env frontend_env_backup

echo "Backup completed"
```

### Recovery Procedure

```bash
# 1. Restore database
docker exec -i mailsentra-db psql -U mailsentra mailsentra < db_backup.sql

# 2. Restore ML models
tar -xzf ml_models_backup.tar.gz -C backend/

# 3. Restart services
docker-compose restart
```

---

## Post-Deployment Checklist

- [ ] SSL certificate installed and auto-renewing
- [ ] Environment variables set correctly
- [ ] Database migrations applied
- [ ] Admin user created
- [ ] Health check endpoint responding
- [ ] Logs being collected
- [ ] Backup script scheduled
- [ ] Monitoring configured
- [ ] Rate limiting tested
- [ ] CORS configured for frontend domain
- [ ] Error tracking enabled
- [ ] Performance baseline measured

---

## Troubleshooting

### Common Issues

**Database connection failed**:
```bash
# Check connection
docker exec -it mailsentra-db psql -U mailsentra -d mailsentra

# Check DATABASE_URL format
# Correct: postgresql://user:password@host:port/dbname
```

**CORS errors**:
```python
# Verify CORS_ORIGINS in backend/.env includes frontend URL
CORS_ORIGINS=https://yourfrontend.com,https://www.yourfrontend.com
```

**Model not loading**:
```bash
# Ensure model file exists
ls -la backend/ml_models/spam_model.pkl

# Retrain if missing
cd backend
python train_model.py
```

---

For development setup, see [Development Guide](DEVELOPMENT.md)
