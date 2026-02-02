# FGL Salesforce Management Platform

A comprehensive web-based sales management system for tracking meetings, managing confirmed pipelines, monitoring delivered clients, and assigning KPIs to Key Account Managers.

## 🚀 Features

### Core Modules

#### 1. **Authentication & User Management**
- User registration with admin approval workflow
- Secure JWT-based authentication
- Role-based access control (Super User & KAM)
- Password management (reset/change)
- User approval interface for administrators

#### 2. **Meetings Module**
- Record client meetings with detailed notes
- Track capacity requirements and MRC values
- Search and filter meetings
- Role-based data access (KAMs see only their meetings)
- Auto-generated serial numbers (MTG-2026-0001, etc.)

#### 3. **Pipeline Module** 
- Track **confirmed** sales opportunities only
- Confirmation status workflow (Pending/Confirmed)
- Mandatory confirmation date for confirmed pipelines
- Summary statistics (total count, capacity, MRC)
- Pipeline value calculation

#### 4. **Delivered Module**
- Log delivered clients with actual capacity and revenue
- Track KPI values for performance measurement
- Delivered status tracking (Delivered/Partial/Cancelled)
- Delivered date for monthly tracking
- Summary metrics (total revenue, KPI achievement)

#### 5. **KPI Assignment** (Super User Only)
- Assign monthly revenue and capacity targets to KAMs
- One assignment per KAM per month
- Track KPI achievement vs targets
- Notes for focus areas and priorities

#### 6. **Dashboard**
- Real-time metrics display
- KPI progress tracking for KAMs
- Current vs previous month comparison
- Quick action buttons
- Role-based dashboard views

## 👥 User Roles

### Super User (Head of Sales)
- Approve/reject user registrations
- View all organizational data
- Assign monthly KPIs to KAMs
- Create records for any KAM
- Access user management interface

### KAM (Key Account Manager)
- Create and manage own meetings
- Track own pipeline opportunities
- Log delivered clients
- View assigned KPI targets
- Monitor personal performance

## 🔧 Technology Stack

### Backend
- **Framework**: Python FastAPI
- **Database**: MongoDB with Motor (async driver)
- **Authentication**: JWT with bcrypt password hashing
- **API**: RESTful with automatic OpenAPI docs

### Frontend
- **Framework**: React 18
- **Routing**: React Router v6
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **State Management**: React Context API

## 📋 Installation & Setup

### Prerequisites
- Python 3.9+
- Node.js 16+
- MongoDB 6.0+
- Yarn package manager

### Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Set environment variables
# Create .env file with:
# MONGO_URL=mongodb://localhost:27017
# DB_NAME=fgl_salesforce
# JWT_SECRET_KEY=your-secret-key

# Create super user account
python init_superuser.py

# Start backend (managed by supervisor)
sudo supervisorctl restart backend
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
yarn install

# Set environment variables
# Create .env file with:
# REACT_APP_BACKEND_URL=http://localhost:8001

# Start frontend (managed by supervisor)
sudo supervisorctl restart frontend
```

## 🔐 Default Credentials

**Super User:**
- Email: `admin@fgl.com`
- Password: `Admin@123`

⚠️ **Important:** Change the default password after first login!

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/change-password` - Change password (authenticated)
- `GET /api/auth/me` - Get current user info

### User Management (Super User Only)
- `GET /api/users/pending` - List pending users
- `POST /api/users/approve/{user_id}` - Approve user
- `POST /api/users/reject/{user_id}` - Reject user
- `GET /api/users/active` - List active users
- `POST /api/users/deactivate/{user_id}` - Deactivate user
- `GET /api/users/kams` - List KAM users

### Meetings
- `POST /api/meetings/` - Create meeting
- `GET /api/meetings/` - List meetings (with search & filters)
- `GET /api/meetings/{meeting_id}` - Get specific meeting
- `PUT /api/meetings/{meeting_id}` - Update meeting
- `DELETE /api/meetings/{meeting_id}` - Delete meeting

### Pipeline
- `POST /api/pipelines/` - Create pipeline
- `GET /api/pipelines/` - List pipelines (confirmed only by default)
- `GET /api/pipelines/{pipeline_id}` - Get specific pipeline
- `PUT /api/pipelines/{pipeline_id}` - Update pipeline
- `DELETE /api/pipelines/{pipeline_id}` - Delete pipeline
- `GET /api/pipelines/stats/summary` - Get pipeline summary

### Delivered
- `POST /api/delivered/` - Create delivered record
- `GET /api/delivered/` - List delivered records
- `GET /api/delivered/{delivered_id}` - Get specific record
- `PUT /api/delivered/{delivered_id}` - Update record
- `DELETE /api/delivered/{delivered_id}` - Delete record
- `GET /api/delivered/stats/summary` - Get delivered summary

### KPI Assignments (Super User Only)
- `POST /api/kpi-assignments/` - Create KPI assignment
- `GET /api/kpi-assignments/` - List assignments
- `GET /api/kpi-assignments/my-current` - Get current month KPI (KAM)
- `GET /api/kpi-assignments/{assignment_id}` - Get specific assignment
- `PUT /api/kpi-assignments/{assignment_id}` - Update assignment
- `DELETE /api/kpi-assignments/{assignment_id}` - Delete assignment

## 🎯 Business Rules

### Pipeline Management
- Only **confirmed** pipelines appear in the main Pipeline List
- Confirmation date is **mandatory** when status = "Confirmed"
- Confirmation date cannot be in the future

### KPI Assignments
- **One assignment per KAM per month** (unique constraint)
- Month format: YYYY-MM (e.g., "2026-02")
- Only Super User can create/edit assignments
- KAMs can view their own assignments (read-only)

### Delivered Clients
- Delivered date cannot be in the future
- Delivered date determines which month the record counts toward
- KPI value is mandatory for performance tracking

### Data Access (RBAC)
- **KAMs**: See only their own records across all modules
- **Super User**: See all records organization-wide, can filter by KAM

## 📊 Serial Number Format

All records have auto-generated serial numbers:
- Meetings: `MTG-YYYY-NNNN` (e.g., MTG-2026-0001)
- Pipeline: `PIPE-YYYY-NNNN` (e.g., PIPE-2026-0001)
- Delivered: `DEL-YYYY-NNNN` (e.g., DEL-2026-0001)
- KPI Assignments: `KPI-YYYY-NNNN` (e.g., KPI-2026-0001)

Where:
- `YYYY` = Current year
- `NNNN` = Sequential number (0001, 0002, etc.)

## 🧪 Testing

### Backend API Testing

```bash
# Test login
curl -X POST http://localhost:8001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@fgl.com", "password": "Admin@123"}'

# Test creating a meeting (with token)
curl -X POST http://localhost:8001/api/meetings/ \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...meeting data...}'
```

### Frontend Access
- Navigate to `http://localhost:3000`
- Login with default credentials
- Test all modules through the UI

## 📁 Project Structure

```
/app/
├── backend/
│   ├── server.py           # Main FastAPI application
│   ├── models.py           # Pydantic models
│   ├── auth_utils.py       # JWT & password utilities
│   ├── dependencies.py     # Auth dependencies
│   ├── routes/
│   │   ├── auth.py         # Authentication routes
│   │   ├── users.py        # User management routes
│   │   ├── meetings.py     # Meeting routes
│   │   ├── pipelines.py    # Pipeline routes
│   │   ├── delivered.py    # Delivered routes
│   │   └── kpi_assignments.py # KPI routes
│   ├── requirements.txt    # Python dependencies
│   ├── .env               # Environment variables
│   └── init_superuser.py  # Super user creation script
│
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main app with routing
│   │   ├── contexts/
│   │   │   └── AuthContext.js  # Auth state management
│   │   ├── components/
│   │   │   ├── Layout.js       # Main layout with navigation
│   │   │   └── ProtectedRoute.js # Route protection
│   │   └── pages/
│   │       ├── Login.js
│   │       ├── Register.js
│   │       ├── Dashboard.js    # Enhanced with metrics
│   │       ├── Meetings.js
│   │       ├── Pipelines.js
│   │       ├── Delivered.js
│   │       ├── KPIAssignments.js
│   │       └── UserManagement.js
│   ├── package.json        # Node dependencies
│   └── .env               # Environment variables
│
└── README.md              # This file
```

## 🔒 Security Features

- JWT-based authentication with token expiration
- Bcrypt password hashing
- Role-based access control at API level
- Session timeout (30 minutes inactivity)
- Password policy enforcement (8+ chars, uppercase, lowercase, digit)
- Protected routes on frontend
- HTTPS ready (configure in production)

## 🌐 Production Deployment

### Environment Variables

**Backend (.env):**
```
MONGO_URL=mongodb://production-host:27017
DB_NAME=fgl_salesforce_prod
JWT_SECRET_KEY=strong-random-secret-key
CORS_ORIGINS=https://yourdomain.com
```

**Frontend (.env):**
```
REACT_APP_BACKEND_URL=https://api.yourdomain.com
```

### Deployment Checklist
- [ ] Change default Super User password
- [ ] Update JWT_SECRET_KEY to strong random value
- [ ] Configure CORS for production domain
- [ ] Enable HTTPS/SSL certificates
- [ ] Set up database backups
- [ ] Configure monitoring and logging
- [ ] Set up reverse proxy (Nginx/Caddy)
- [ ] Enable rate limiting
- [ ] Review and update security headers

## 📈 Future Enhancements

- [ ] Export to Excel/CSV functionality
- [ ] Advanced date range filters
- [ ] Email notifications for approvals
- [ ] Visual charts (line, bar, pie) on dashboard
- [ ] Bulk operations (CSV import)
- [ ] Activity audit logs
- [ ] Mobile app (React Native)
- [ ] Integration with third-party CRMs

## 🆘 Support & Troubleshooting

### Common Issues

**Frontend won't compile:**
```bash
cd frontend
rm -rf node_modules yarn.lock
yarn install
sudo supervisorctl restart frontend
```

**Backend errors:**
```bash
# Check logs
tail -n 50 /var/log/supervisor/backend.err.log

# Restart backend
sudo supervisorctl restart backend
```

**Database connection issues:**
- Verify MongoDB is running: `sudo systemctl status mongod`
- Check MONGO_URL in backend/.env
- Ensure database name is correct

## 📝 License

Proprietary - FGL Internal Use Only

## 👨‍💻 Development

**Built for:** FGL Organization  
**Version:** 1.0.0  
**Date:** February 2026

---

For questions or support, contact the FGL Development Team.
