# FGL Salesforce Management Platform - Installation Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## System Requirements

### Minimum Requirements
| Component | Requirement |
|-----------|-------------|
| CPU | 2 cores |
| RAM | 4 GB |
| Storage | 20 GB |
| OS | Ubuntu 20.04+ / CentOS 8+ / Windows 10+ |

### Recommended Requirements
| Component | Requirement |
|-----------|-------------|
| CPU | 4 cores |
| RAM | 8 GB |
| Storage | 50 GB SSD |
| OS | Ubuntu 22.04 LTS |

---

## Prerequisites

### Required Software
1. **Python 3.11+**
2. **Node.js 18+** with npm/yarn
3. **MongoDB 6.0+**
4. **Git**

### Installing Prerequisites

#### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install Python 3.11
sudo apt install python3.11 python3.11-venv python3-pip

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs

# Install MongoDB
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Yarn (optional, recommended)
npm install -g yarn
```

#### macOS
```bash
# Install Homebrew if not installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Python
brew install python@3.11

# Install Node.js
brew install node@18

# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community@6.0
brew services start mongodb-community@6.0

# Install Yarn
npm install -g yarn
```

#### Windows
1. Download and install Python 3.11 from [python.org](https://www.python.org/downloads/)
2. Download and install Node.js 18 from [nodejs.org](https://nodejs.org/)
3. Download and install MongoDB from [mongodb.com](https://www.mongodb.com/try/download/community)
4. Install Yarn: `npm install -g yarn`

---

## Installation Steps

### Step 1: Clone the Repository
```bash
git clone <repository-url>
cd fgl-salesforce-management
```

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3.11 -m venv venv

# Activate virtual environment
# Linux/macOS:
source venv/bin/activate
# Windows:
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### Step 3: Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
yarn install
# or
npm install
```

---

## Configuration

### Backend Configuration

Create `/backend/.env` file:
```env
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017
DB_NAME=fgl_salesforce

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

### Frontend Configuration

Create `/frontend/.env` file:
```env
# Backend API URL
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DB_NAME` | Database name | `fgl_salesforce` |
| `JWT_SECRET_KEY` | Secret key for JWT tokens | Random 32+ character string |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | `1440` (24 hours) |
| `CORS_ORIGINS` | Allowed frontend origins | Comma-separated URLs |
| `REACT_APP_BACKEND_URL` | Backend API URL for frontend | `http://localhost:8001` |

---

## Running the Application

### Development Mode

#### Start Backend
```bash
cd backend
source venv/bin/activate  # Linux/macOS
# or .\venv\Scripts\activate  # Windows

# Initialize Super User (first time only)
python init_superuser.py

# Start the server
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### Start Frontend
```bash
cd frontend
yarn start
# or
npm start
```

### Access the Application
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Documentation: http://localhost:8001/docs

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Super User | admin@fgl.com | Admin@123 |

---

## Production Deployment

### Using Docker (Recommended)

#### Dockerfile for Backend
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8001

CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

#### Dockerfile for Frontend
```dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:6.0
    volumes:
      - mongodb_data:/data/db
    restart: always

  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=fgl_salesforce
      - JWT_SECRET_KEY=${JWT_SECRET_KEY}
    depends_on:
      - mongodb
    restart: always

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: always

volumes:
  mongodb_data:
```

### Using Supervisor (Linux)

#### Backend Supervisor Config
```ini
[program:fgl-backend]
directory=/app/backend
command=/app/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/fgl/backend.err.log
stdout_logfile=/var/log/fgl/backend.out.log
```

#### Frontend Supervisor Config
```ini
[program:fgl-frontend]
directory=/app/frontend
command=/usr/bin/yarn start
user=www-data
autostart=true
autorestart=true
stderr_logfile=/var/log/fgl/frontend.err.log
stdout_logfile=/var/log/fgl/frontend.out.log
environment=PORT="3000"
```

### Nginx Reverse Proxy Configuration
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### SSL/HTTPS Setup (Let's Encrypt)
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
```

---

## Troubleshooting

### Common Issues

#### 1. MongoDB Connection Failed
```
Error: Could not connect to MongoDB
```
**Solution:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Start MongoDB if not running
sudo systemctl start mongod

# Check MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log
```

#### 2. Port Already in Use
```
Error: Address already in use (port 8001)
```
**Solution:**
```bash
# Find process using the port
lsof -i :8001

# Kill the process
kill -9 <PID>
```

#### 3. Python Dependencies Error
```
Error: No module named 'xxx'
```
**Solution:**
```bash
# Ensure virtual environment is activated
source venv/bin/activate

# Reinstall dependencies
pip install -r requirements.txt
```

#### 4. Frontend Build Error
```
Error: Cannot find module 'xxx'
```
**Solution:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
rm yarn.lock  # or package-lock.json
yarn install
```

#### 5. CORS Error
```
Error: CORS policy blocked
```
**Solution:**
- Check `CORS_ORIGINS` in backend `.env` includes your frontend URL
- Restart backend after changing environment variables

#### 6. JWT Token Expired
```
Error: Token has expired
```
**Solution:**
- Log out and log in again
- Increase `ACCESS_TOKEN_EXPIRE_MINUTES` if needed

### Logs Location

| Service | Log Location |
|---------|--------------|
| Backend | `/var/log/supervisor/backend.*.log` |
| Frontend | `/var/log/supervisor/frontend.*.log` |
| MongoDB | `/var/log/mongodb/mongod.log` |
| Nginx | `/var/log/nginx/access.log`, `/var/log/nginx/error.log` |

### Health Check Endpoints

| Endpoint | Expected Response |
|----------|-------------------|
| `GET /api/` | `{"message": "FGL Salesforce Management API", "status": "healthy"}` |
| `GET /api/docs` | Swagger UI documentation |

---

## Backup & Restore

### MongoDB Backup
```bash
# Create backup
mongodump --db fgl_salesforce --out /backup/$(date +%Y%m%d)

# Restore from backup
mongorestore --db fgl_salesforce /backup/20260202/fgl_salesforce
```

### Automated Backup Script
```bash
#!/bin/bash
BACKUP_DIR="/backup/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

mongodump --db fgl_salesforce --out $BACKUP_DIR/$DATE
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

Add to crontab for daily backup:
```bash
0 2 * * * /path/to/backup-script.sh
```

---

## Security Recommendations

1. **Change default credentials** immediately after installation
2. **Use strong JWT secret** (32+ random characters)
3. **Enable HTTPS** in production
4. **Restrict MongoDB access** (bind to localhost or use authentication)
5. **Keep software updated** (OS, Python, Node.js, MongoDB)
6. **Use firewall** to restrict port access
7. **Regular backups** of database

---

*Document Version: 1.0*
*Last Updated: February 2026*
