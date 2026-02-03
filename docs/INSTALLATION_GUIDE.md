# FGL Salesforce Management Platform - Installation Guide

## Table of Contents
1. [System Requirements](#system-requirements)
2. [Prerequisites](#prerequisites)
3. [Installation Steps](#installation-steps)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Production Deployment with PM2](#production-deployment-with-pm2)
7. [Nginx Reverse Proxy Setup](#nginx-reverse-proxy-setup)
8. [SSL/HTTPS Setup](#sslhttps-setup)
9. [Troubleshooting](#troubleshooting)
10. [Backup & Restore](#backup--restore)

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
5. **Nginx** (for production)
6. **PM2** (for process management)

### Installing Prerequisites on Ubuntu/Debian

```bash
# Update package list
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install python3.11 python3.11-venv python3-pip -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# Install Yarn globally
npm install -g yarn

# Install MongoDB
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
echo "deb [ signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
sudo apt update
sudo apt install mongodb-org -y

# Start and enable MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Install Nginx
sudo apt install nginx -y

# Install PM2 globally
npm install -g pm2
```

### Verify Installations
```bash
python3 --version      # Should show 3.11+
node --version         # Should show 18+
yarn --version         # Should show 1.22+
mongod --version       # Should show 6.0+
nginx -v              # Should show nginx version
pm2 --version         # Should show PM2 version
```

---

## Installation Steps

### Step 1: Clone the Repository
```bash
cd ~
git clone <your-repository-url> Salesforce-Management-Software
cd Salesforce-Management-Software
```

### Step 2: Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Initialize Super User (creates default admin account)
python init_superuser.py
```

### Step 3: Frontend Setup
```bash
# Navigate to frontend directory
cd ../frontend

# Install dependencies
yarn install

# Install ESLint plugin (if not already in package.json)
yarn add eslint-plugin-react-hooks --dev
```

---

## Configuration

### Backend Configuration

Create or edit `/backend/.env` file:
```bash
nano ~/Salesforce-Management-Software/backend/.env
```

Add the following content:
```env
# MongoDB Connection
MONGO_URL=mongodb://localhost:27017
DB_NAME=fgl_salesforce

# JWT Configuration
JWT_SECRET_KEY=your-super-secret-jwt-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

> **Important:** Change `JWT_SECRET_KEY` to a secure random string in production!

### Frontend Configuration

Create or edit `/frontend/.env` file:
```bash
nano ~/Salesforce-Management-Software/frontend/.env
```

Add the following content:
```env
# Backend API URL (use your server IP or domain)
REACT_APP_BACKEND_URL=http://YOUR_SERVER_IP
```

Replace `YOUR_SERVER_IP` with your actual server IP or domain name.

### Environment Variables Explained

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGO_URL` | MongoDB connection string | `mongodb://localhost:27017` |
| `DB_NAME` | Database name | `fgl_salesforce` |
| `JWT_SECRET_KEY` | Secret key for JWT tokens | Random 32+ character string |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Token expiration time | `1440` (24 hours) |
| `REACT_APP_BACKEND_URL` | Backend API URL for frontend | `http://your-server-ip` |

---

## Running the Application

### Development Mode (Testing Only)

#### Terminal 1 - Start Backend:
```bash
cd ~/Salesforce-Management-Software/backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

#### Terminal 2 - Start Frontend:
```bash
cd ~/Salesforce-Management-Software/frontend
yarn start
```

### Access Points (Development)
- Frontend: http://localhost:3000
- Backend API: http://localhost:8001
- API Documentation: http://localhost:8001/docs

### Default Credentials
| Role | Email | Password |
|------|-------|----------|
| Super User | admin@fgl.com | Admin@123 |

---

## Production Deployment with PM2

PM2 keeps your application running in the background and automatically restarts it if it crashes or when the server reboots.

### Step 1: Install PM2
```bash
npm install -g pm2
```

### Step 2: Start Backend with PM2
```bash
cd ~/Salesforce-Management-Software/backend

# Start backend
pm2 start "venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001" --name fgl-backend
```

### Step 3: Start Frontend with PM2
```bash
cd ~/Salesforce-Management-Software/frontend

# Start frontend
pm2 start "yarn start" --name fgl-frontend
```

### Step 4: Save PM2 Configuration
```bash
# Save current PM2 process list
pm2 save

# Generate startup script (auto-start on reboot)
pm2 startup

# Run the command shown in the output (example):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u root --hp /root
```

### PM2 Useful Commands

| Command | Description |
|---------|-------------|
| `pm2 list` | Show all running processes |
| `pm2 logs` | Show logs from all processes |
| `pm2 logs fgl-frontend` | Show frontend logs only |
| `pm2 logs fgl-backend` | Show backend logs only |
| `pm2 restart all` | Restart all processes |
| `pm2 restart fgl-frontend` | Restart frontend only |
| `pm2 restart fgl-backend` | Restart backend only |
| `pm2 stop all` | Stop all processes |
| `pm2 delete all` | Delete all processes |
| `pm2 monit` | Monitor CPU/Memory usage |

### Verify PM2 Status
```bash
pm2 list
```

Expected output:
```
┌─────┬─────────────────┬─────────────┬──────┬───────────┬──────────┐
│ id  │ name            │ mode        │ ↺    │ status    │ cpu      │
├─────┼─────────────────┼─────────────┼──────┼───────────┼──────────┤
│ 0   │ fgl-backend     │ fork        │ 0    │ online    │ 0%       │
│ 1   │ fgl-frontend    │ fork        │ 0    │ online    │ 0%       │
└─────┴─────────────────┴─────────────┴──────┴───────────┴──────────┘
```

---

## Nginx Reverse Proxy Setup

Nginx acts as a reverse proxy, routing requests to your frontend and backend services. This allows you to:
- Access the app on port 80 (standard HTTP) instead of 3000
- Handle SSL/HTTPS termination
- Improve security and performance

### Step 1: Install Nginx
```bash
sudo apt install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx
```

### Step 2: Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/fgl-salesforce
```

Paste the following configuration:
```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;

    # Frontend - React App
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend - FastAPI
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

> **Important:** Replace `YOUR_SERVER_IP` with your actual server IP address or domain name.

### Step 3: Enable the Configuration
```bash
# Create symbolic link to enable the site
sudo ln -s /etc/nginx/sites-available/fgl-salesforce /etc/nginx/sites-enabled/

# Remove default nginx site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test nginx configuration
sudo nginx -t
```

Expected output:
```
nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful
```

### Step 4: Restart Nginx
```bash
sudo systemctl restart nginx
```

### Step 5: Configure Firewall
```bash
# Allow HTTP traffic
sudo ufw allow 80/tcp

# Allow HTTPS traffic (for future SSL setup)
sudo ufw allow 443/tcp

# Check firewall status
sudo ufw status
```

### Verify Nginx Setup
```bash
# Check nginx status
sudo systemctl status nginx

# Test from command line
curl http://localhost
```

### Access Your Application
Open your browser and navigate to:
```
http://YOUR_SERVER_IP
```

---

## SSL/HTTPS Setup

For production, it's recommended to enable HTTPS using Let's Encrypt (free SSL certificates).

### Prerequisites
- A domain name pointing to your server IP
- Port 80 and 443 open in firewall

### Step 1: Install Certbot
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### Step 2: Obtain SSL Certificate
```bash
sudo certbot --nginx -d yourdomain.com
```

Follow the prompts:
1. Enter your email address
2. Agree to terms of service
3. Choose whether to redirect HTTP to HTTPS (recommended: Yes)

### Step 3: Verify Auto-Renewal
```bash
# Test renewal process
sudo certbot renew --dry-run
```

### Updated Nginx Configuration with SSL
After running certbot, your configuration will be automatically updated. It should look like:

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

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

### Update Frontend Environment
After enabling HTTPS, update your frontend `.env`:
```env
REACT_APP_BACKEND_URL=https://yourdomain.com
```

Then restart the frontend:
```bash
pm2 restart fgl-frontend
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

# Or use PM2 to manage
pm2 delete fgl-backend
pm2 start "venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001" --name fgl-backend
```

#### 3. Nginx Configuration Error
```
nginx: [emerg] unknown directive
```
**Solution:**
```bash
# Check for syntax errors
sudo nginx -t

# View the problematic file
sudo cat /etc/nginx/sites-enabled/fgl-salesforce

# Delete and recreate if needed
sudo rm /etc/nginx/sites-enabled/fgl-salesforce
sudo rm /etc/nginx/sites-available/fgl-salesforce
# Then recreate following the guide above
```

#### 4. Frontend Not Loading After Terminal Closes
**Solution:** Use PM2 to run as a background service (see [Production Deployment with PM2](#production-deployment-with-pm2))

#### 5. CORS Error
```
Error: CORS policy blocked
```
**Solution:**
- Ensure `REACT_APP_BACKEND_URL` in frontend `.env` matches your actual server URL
- Restart frontend after changing environment variables:
```bash
pm2 restart fgl-frontend
```

#### 6. 502 Bad Gateway
**Solution:**
```bash
# Check if backend is running
pm2 list

# Check backend logs
pm2 logs fgl-backend

# Restart if needed
pm2 restart fgl-backend
```

#### 7. Permission Denied Errors
```bash
# Fix ownership if needed
sudo chown -R $USER:$USER ~/Salesforce-Management-Software
```

### Useful Log Commands

| Command | Description |
|---------|-------------|
| `pm2 logs` | All PM2 process logs |
| `pm2 logs fgl-backend --lines 100` | Last 100 lines of backend logs |
| `sudo tail -f /var/log/nginx/error.log` | Nginx error logs |
| `sudo tail -f /var/log/nginx/access.log` | Nginx access logs |
| `sudo journalctl -u mongod -f` | MongoDB logs |

### Health Check

Run this script to verify all services:
```bash
echo "=== Service Status ==="
echo "MongoDB:"
sudo systemctl is-active mongod

echo "Nginx:"
sudo systemctl is-active nginx

echo "PM2 Processes:"
pm2 list

echo "=== Port Check ==="
echo "Port 3000 (Frontend):"
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000

echo "Port 8001 (Backend):"
curl -s -o /dev/null -w "%{http_code}" http://localhost:8001

echo "Port 80 (Nginx):"
curl -s -o /dev/null -w "%{http_code}" http://localhost
```

---

## Backup & Restore

### MongoDB Backup
```bash
# Create backup directory
mkdir -p ~/backups

# Create backup
mongodump --db fgl_salesforce --out ~/backups/$(date +%Y%m%d_%H%M%S)
```

### MongoDB Restore
```bash
# Restore from backup
mongorestore --db fgl_salesforce ~/backups/BACKUP_FOLDER/fgl_salesforce
```

### Automated Daily Backup
Create a backup script:
```bash
nano ~/backup-mongodb.sh
```

Add:
```bash
#!/bin/bash
BACKUP_DIR=~/backups
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup
mongodump --db fgl_salesforce --out $BACKUP_DIR/$DATE

# Delete backups older than 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +

echo "Backup completed: $BACKUP_DIR/$DATE"
```

Make executable and add to crontab:
```bash
chmod +x ~/backup-mongodb.sh

# Edit crontab
crontab -e

# Add this line for daily backup at 2 AM
0 2 * * * ~/backup-mongodb.sh >> ~/backups/backup.log 2>&1
```

---

## Quick Reference

### Service Management
| Action | Command |
|--------|---------|
| Start all | `pm2 start all && sudo systemctl start nginx mongod` |
| Stop all | `pm2 stop all && sudo systemctl stop nginx` |
| Restart all | `pm2 restart all && sudo systemctl restart nginx` |
| View status | `pm2 list && sudo systemctl status nginx mongod` |

### Important File Locations
| File | Location |
|------|----------|
| Backend code | `~/Salesforce-Management-Software/backend/` |
| Frontend code | `~/Salesforce-Management-Software/frontend/` |
| Backend .env | `~/Salesforce-Management-Software/backend/.env` |
| Frontend .env | `~/Salesforce-Management-Software/frontend/.env` |
| Nginx config | `/etc/nginx/sites-available/fgl-salesforce` |
| MongoDB data | `/var/lib/mongodb/` |
| PM2 logs | `~/.pm2/logs/` |

### Default Ports
| Service | Port |
|---------|------|
| Frontend (React) | 3000 |
| Backend (FastAPI) | 8001 |
| Nginx (HTTP) | 80 |
| Nginx (HTTPS) | 443 |
| MongoDB | 27017 |

---

## Security Recommendations

1. **Change default credentials** immediately after installation
2. **Use strong JWT secret** (32+ random characters)
3. **Enable HTTPS** in production using Let's Encrypt
4. **Restrict MongoDB access** (bind to localhost)
5. **Keep software updated** regularly
6. **Use firewall** (UFW) to restrict port access
7. **Regular backups** of database
8. **Use non-root user** for running services (recommended)

---

*Document Version: 2.0*
*Last Updated: February 2026*
