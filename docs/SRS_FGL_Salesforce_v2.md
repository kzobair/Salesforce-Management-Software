# FGL Salesforce Management Platform
## Software Requirements Specification (SRS)
### Version 2.0 | March 2026

---

## 1. Introduction

### 1.1 Purpose
This document describes the software requirements for the **FGL Salesforce Management Platform**, a comprehensive sales management system designed for Fiber @ Home Global Limited to track meetings, pipelines, deliveries, and KPI performance of Key Account Managers (KAMs).

### 1.2 Scope
The system provides:
- User authentication with role-based access control
- Meeting records management
- Sales pipeline tracking
- Delivered clients management with KPI scoring
- KPI assignments and performance tracking
- KAM rankings and profiles
- Dashboard analytics with monthly summaries

### 1.3 Definitions
| Term | Definition |
|------|------------|
| KAM | Key Account Manager - Sales personnel |
| SuperUser | Administrator with full system access |
| MRC | Monthly Recurring Charge |
| OTC | One Time Charge |
| KPI | Key Performance Indicator |
| Pipeline | Confirmed sales opportunity |
| Delivered | Successfully delivered/activated client |

---

## 2. System Overview

### 2.1 Product Perspective
The FGL Salesforce Management Platform is a full-stack web application consisting of:
- **Frontend**: React.js with Tailwind CSS
- **Backend**: FastAPI (Python)
- **Database**: MongoDB

### 2.2 User Classes

| Role | Description | Permissions |
|------|-------------|-------------|
| SuperUser | System administrator | Full access to all features, user management, KPI assignments, view all KAM data |
| KAM | Key Account Manager | Create/manage own meetings, pipelines; view own KPI scores and rankings |

### 2.3 Operating Environment
- **Server**: Ubuntu Linux
- **Runtime**: Node.js 18+, Python 3.11+
- **Database**: MongoDB 6.0+
- **Process Manager**: PM2
- **Web Server**: Nginx (reverse proxy)

---

## 3. Functional Requirements

### 3.1 Authentication Module

#### 3.1.1 User Registration
- Users can register with name, email, mobile, and password
- New registrations have "Pending" status by default
- SuperUser must approve before user can login
- Password confirmation required

#### 3.1.2 User Login
- Email and password authentication
- JWT token-based session management
- Only "Active" users can login
- Appropriate error messages for Pending/Rejected/Disabled accounts

#### 3.1.3 Forgot Password
- User enters registered email address
- System sends password reset email with secure token
- Reset link valid for 15 minutes
- Email sent via SMTP (alerts.fgl@fiberathome.net)

#### 3.1.4 Reset Password
- User clicks reset link from email
- Enters new password with confirmation
- Token validated and marked as used after successful reset
- Redirects to login page

#### 3.1.5 Change Password (Logged-in users)
- Requires current password verification
- New password with confirmation
- Immediate effect after change

### 3.2 Dashboard Module

#### 3.2.1 Monthly Summary
- **Two-month comparison**: Current month vs Previous month
- Metrics displayed:
  - Total Meetings count
  - Total Pipeline count
  - Total Pipeline value (MRC)
  - Total Delivered count
  - Total Delivered value (MRC)
- Role-based filtering (KAMs see own data, SuperUser sees all)

#### 3.2.2 Quick Statistics
- Total active users count
- Pending approval requests
- Recent activities

### 3.3 Meetings Module

#### 3.3.1 Meeting Records
- **Fields**:
  - Serial Number (auto-generated: MTG-YYYY-XXXX)
  - Client Name, Address
  - Contact Name, Number
  - Primary Capacity: Requirement, Unit (Mbps/Gbps/IPLC), MRC, MRC Currency (BDT/USD), OTC, OTC Currency
  - Other Capacity: Requirement, Unit, MRC, MRC Currency, OTC, OTC Currency
  - Meeting Status: Scheduled/Completed/Cancelled/Follow-up Required
  - Meeting Date
  - Meeting Notes
  - KAM User ID

#### 3.3.2 Meeting Operations
- Create new meeting
- Edit existing meeting
- Delete meeting (soft delete)
- Search by client name or contact
- Filter by status
- Pagination support

### 3.4 Pipeline Module

#### 3.4.1 Pipeline Records
- **Fields**:
  - Serial Number (auto-generated: PIPE-YYYY-XXXX)
  - Client Name, Address
  - Contact Name, Number
  - Primary Capacity: Requirement, Unit, MRC, MRC Currency, OTC, OTC Currency
  - Other Capacity: Requirement, Unit, MRC, MRC Currency, OTC, OTC Currency
  - Confirmation Status: Confirmed/Pending/Lost
  - Confirmation Date (required when status is "Confirmed")
  - Confirmation Notes
  - **Delivered Status**: Yes (Delivered) / No / Pending / In Process
  - KAM User ID

#### 3.4.2 Pipeline Operations
- Create new pipeline
- Edit existing pipeline
- Delete pipeline (soft delete)
- Search and filter
- **Auto-sync with Delivered**: When Delivered Status changes to "Yes", automatically creates a Delivered record with KPI score
- **Auto-delete Delivered**: When Delivered Status changes FROM "Yes" to another status, soft-deletes the associated Delivered record

### 3.5 Delivered Module

#### 3.5.1 Delivered Records
- **Fields**:
  - Serial Number (auto-generated: DEL-YYYY-XXXX)
  - All client and capacity fields (copied from Pipeline)
  - Pipeline ID (reference to source pipeline)
  - KPI Score (editable by SuperUser)
  - Delivered Date
  - KAM User ID

#### 3.5.2 Delivered Operations
- View delivered records (auto-created from Pipeline)
- SuperUser can edit KPI scores inline
- Filter by KAM
- Summary statistics: Total Delivered, Total Capacity, Total Revenue, Total KPI Score

#### 3.5.3 From Pipeline Tab
- Shows pipelines marked as "Yes (Delivered)" for reference
- Read-only view

### 3.6 KPI Assignments Module (SuperUser Only)

#### 3.6.1 KPI Assignment Records
- **Fields**:
  - Month (YYYY-MM format)
  - KAM User ID
  - Revenue Target
  - Capacity Target
  - KPI Score Target

#### 3.6.2 KPI Operations
- Create monthly KPI assignments for KAMs
- Edit existing assignments
- Delete assignments
- View all assignments with KAM names

### 3.7 KAM Rankings Module (SuperUser Only)

#### 3.7.1 Rankings Display
- List of all KAMs ranked by total KPI score
- Shows:
  - Rank position
  - KAM name and email
  - Total Delivered count
  - Total KPI Score
  - Performance trend indicator

#### 3.7.2 KAM Profile
- Detailed view of individual KAM
- Personal information
- Monthly KPI assignments
- All delivered records
- Performance summary

### 3.8 User Management Module (SuperUser Only)

#### 3.8.1 User Operations
- View all registered users
- Approve pending registrations
- Reject registrations
- Disable/Enable user accounts
- Filter by status and role

---

## 4. Non-Functional Requirements

### 4.1 Security
- JWT token authentication with expiration
- Password hashing using bcrypt
- CORS protection
- Role-based access control on all endpoints
- Secure password reset tokens (15-minute expiry)

### 4.2 Performance
- API response time < 500ms
- Pagination on list endpoints (default 20, max 100)
- Database indexing on frequently queried fields

### 4.3 Usability
- Responsive design (desktop and tablet)
- Intuitive navigation with sidebar menu
- Form validation with clear error messages
- Loading states and confirmations

### 4.4 Reliability
- PM2 process management with auto-restart
- Soft delete for data preservation
- MongoDB backup support

---

## 5. Technical Architecture

### 5.1 System Architecture
```
┌─────────────────────────────────────────────────────────────┐
│                         Client                               │
│                    (Web Browser)                             │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTPS
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    Nginx Reverse Proxy                       │
│                   (103.131.159.248:80)                       │
└──────────┬─────────────────────────────────┬────────────────┘
           │                                 │
           ▼                                 ▼
┌─────────────────────┐         ┌─────────────────────────────┐
│   React Frontend    │         │     FastAPI Backend         │
│   (PM2: fgl-frontend)│        │    (PM2: fgl-backend)       │
│   Port: 3000        │         │    Port: 8001               │
└─────────────────────┘         └──────────────┬──────────────┘
                                               │
                                               ▼
                                ┌─────────────────────────────┐
                                │        MongoDB              │
                                │    (localhost:27017)        │
                                │    DB: fgl_salesforce       │
                                └─────────────────────────────┘
```

### 5.2 Directory Structure
```
/root/Salesforce-Management-Software/
├── backend/
│   ├── .env                    # Environment variables
│   ├── server.py               # FastAPI main application
│   ├── models.py               # Pydantic data models
│   ├── auth_utils.py           # JWT and password utilities
│   ├── dependencies.py         # Database and auth dependencies
│   ├── email_utils.py          # SMTP email sending
│   ├── init_superuser.py       # Initialize admin user
│   └── routes/
│       ├── auth.py             # Authentication endpoints
│       ├── users.py            # User management endpoints
│       ├── meetings.py         # Meeting CRUD endpoints
│       ├── pipelines.py        # Pipeline CRUD endpoints
│       ├── delivered.py        # Delivered CRUD endpoints
│       ├── kpi_assignments.py  # KPI assignment endpoints
│       ├── kam_management.py   # KAM profiles and rankings
│       └── dashboard.py        # Dashboard analytics
│
├── frontend/
│   ├── .env                    # Frontend environment
│   ├── package.json            # Dependencies
│   ├── src/
│   │   ├── App.js              # Main app with routing
│   │   ├── assets/
│   │   │   └── fgl-logo.png    # Company logo
│   │   ├── contexts/
│   │   │   └── AuthContext.js  # Authentication state
│   │   ├── components/
│   │   │   ├── Layout.js       # Main layout with sidebar
│   │   │   └── ProtectedRoute.js
│   │   └── pages/
│   │       ├── Login.js        # Animated login page
│   │       ├── Register.js
│   │       ├── ForgotPassword.js
│   │       ├── ResetPassword.js
│   │       ├── Dashboard.js
│   │       ├── Meetings.js
│   │       ├── Pipelines.js
│   │       ├── Delivered.js
│   │       ├── KPIAssignments.js
│   │       ├── KAMRankings.js
│   │       ├── KAMProfile.js
│   │       └── UserManagement.js
│   └── build/                  # Production build
│
└── venv/                       # Python virtual environment
```

---

## 6. Database Schema

### 6.1 Users Collection
```javascript
{
  user_id: String (UUID),
  name: String,
  email: String (unique, lowercase),
  mobile: String,
  password_hash: String,
  role: "SuperUser" | "KAM",
  status: "Pending" | "Active" | "Rejected" | "Disabled",
  created_at: DateTime,
  updated_at: DateTime,
  last_login_at: DateTime
}
```

### 6.2 Meetings Collection
```javascript
{
  meeting_id: String (UUID),
  serial_number: String (MTG-YYYY-XXXX),
  client_name: String,
  client_address: String,
  contact_name: String,
  contact_number: String,
  capacity_req: Number,
  capacity_unit: "Mbps" | "Gbps" | "IPLC",
  capacity_mrc: Number,
  capacity_mrc_currency: "BDT" | "USD",
  capacity_otc: Number,
  capacity_otc_currency: "BDT" | "USD",
  other_cap_req: Number,
  other_cap_unit: String,
  other_cap_mrc: Number,
  other_cap_mrc_currency: "BDT" | "USD",
  other_cap_otc: Number,
  other_cap_otc_currency: "BDT" | "USD",
  kam_user_id: String,
  meeting_status: String,
  meeting_date: DateTime,
  meeting_notes: String,
  created_at: DateTime,
  updated_at: DateTime,
  created_by: String,
  updated_by: String,
  is_deleted: Boolean
}
```

### 6.3 Pipelines Collection
```javascript
{
  pipeline_id: String (UUID),
  serial_number: String (PIPE-YYYY-XXXX),
  // ... same capacity fields as meetings ...
  kam_user_id: String,
  confirmation_status: "Confirmed" | "Pending" | "Lost",
  confirmation_date: DateTime,
  confirmation_notes: String,
  delivered_status: "Yes" | "No" | "Pending" | "In Process",
  created_at: DateTime,
  updated_at: DateTime,
  created_by: String,
  updated_by: String,
  is_deleted: Boolean
}
```

### 6.4 Delivered Collection
```javascript
{
  delivered_id: String (UUID),
  serial_number: String (DEL-YYYY-XXXX),
  // ... same capacity fields ...
  kam_user_id: String,
  pipeline_id: String (reference),
  kpi_score: Number,
  delivered_date: DateTime,
  created_at: DateTime,
  updated_at: DateTime,
  created_by: String,
  updated_by: String,
  is_deleted: Boolean
}
```

### 6.5 KPI Assignments Collection
```javascript
{
  assignment_id: String (UUID),
  month: String (YYYY-MM),
  kam_user_id: String,
  revenue_target: Number,
  capacity_target: Number,
  kpi_score_target: Number,
  created_at: DateTime,
  updated_at: DateTime,
  created_by: String,
  updated_by: String,
  is_deleted: Boolean
}
```

### 6.6 Password Reset Tokens Collection
```javascript
{
  token_id: String (UUID),
  user_id: String,
  token: String (secure random),
  created_at: DateTime,
  expires_at: DateTime,
  used: Boolean
}
```

---

## 7. API Endpoints

### 7.1 Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login and get JWT token |
| POST | /api/auth/forgot-password | Request password reset email |
| POST | /api/auth/reset-password | Reset password with token |
| POST | /api/auth/change-password | Change password (authenticated) |
| GET | /api/auth/me | Get current user info |

### 7.2 Users (SuperUser only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users/ | List all users |
| GET | /api/users/{user_id} | Get user details |
| PUT | /api/users/{user_id}/status | Update user status |

### 7.3 Meetings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/meetings/ | List meetings |
| POST | /api/meetings/ | Create meeting |
| GET | /api/meetings/{meeting_id} | Get meeting |
| PUT | /api/meetings/{meeting_id} | Update meeting |
| DELETE | /api/meetings/{meeting_id} | Delete meeting |

### 7.4 Pipelines
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/pipelines/ | List pipelines |
| POST | /api/pipelines/ | Create pipeline |
| GET | /api/pipelines/{pipeline_id} | Get pipeline |
| PUT | /api/pipelines/{pipeline_id} | Update pipeline |
| DELETE | /api/pipelines/{pipeline_id} | Delete pipeline |
| GET | /api/pipelines/stats/summary | Get pipeline statistics |

### 7.5 Delivered
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/delivered/ | List delivered records |
| GET | /api/delivered/{delivered_id} | Get delivered record |
| PATCH | /api/delivered/{delivered_id}/kpi-score | Update KPI score (SuperUser) |

### 7.6 KPI Assignments (SuperUser only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/kpi-assignments/ | List assignments |
| POST | /api/kpi-assignments/ | Create assignment |
| PUT | /api/kpi-assignments/{id} | Update assignment |
| DELETE | /api/kpi-assignments/{id} | Delete assignment |

### 7.7 KAM Management (SuperUser only)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/kam/profiles | List all KAM profiles |
| GET | /api/kam/profile/{kam_user_id} | Get KAM profile details |
| GET | /api/kam/rankings | Get KAM rankings by KPI |

### 7.8 Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard/monthly-summary | Get 2-month comparison |
| GET | /api/dashboard/total-summary | Get overall statistics |

---

## 8. User Interface

### 8.1 Login Page
- Animated dark theme with network particle effects
- FGL logo with glow effect
- Traveling light beam around card border
- Dynamic color-changing particles
- Glass-morphism card design
- Links to Register and Forgot Password

### 8.2 Navigation Sidebar
- FGL logo and branding
- Menu items:
  - Dashboard
  - Meetings
  - Pipeline
  - Delivered
  - KPI Assignments (SuperUser)
  - KAM Rankings (SuperUser)
  - User Management (SuperUser)
- User info and Logout button

### 8.3 Data Tables
- Sortable columns
- Search functionality
- Pagination
- Action buttons (Edit, Delete)
- Status badges with colors

### 8.4 Forms
- Modal-based create/edit forms
- Form validation
- Currency and unit dropdowns
- Date pickers
- Required field indicators

---

## 9. Email Configuration

### 9.1 SMTP Settings
```
Host: mail.fiberathome.net
Port: 587 (TLS)
User: alerts.fgl@fiberathome.net
From Name: FGL Salesforce Management
```

### 9.2 Email Templates
- **Password Reset Email**: HTML formatted with:
  - FGL branding header
  - Reset button/link
  - 15-minute expiry notice
  - Security disclaimer
  - Footer with copyright

---

## 10. Deployment & Maintenance

### 10.1 Service Management
```bash
# View status
pm2 status

# Restart services
pm2 restart fgl-backend
pm2 restart fgl-frontend

# View logs
pm2 logs fgl-backend
pm2 logs fgl-frontend
```

### 10.2 Auto-Start on Reboot
```bash
pm2 startup
pm2 save
```

### 10.3 Database Backup
```bash
# Manual backup
mongodump --db fgl_salesforce --out ~/backups/mongo_$(date +%Y%m%d)

# Restore from backup
mongorestore --db fgl_salesforce ~/backups/mongo_YYYYMMDD/fgl_salesforce
```

### 10.4 Automated Daily Backups
- Cron job at 2 AM daily
- Retains last 7 days of backups
- Script location: ~/backup_mongo.sh

---

## 11. Test Credentials

| Role | Email | Password |
|------|-------|----------|
| SuperUser | admin@fgl.com | Admin@123 |

---

## 12. Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 2, 2026 | Initial release with all 9 core features |
| 1.1 | Mar 2, 2026 | KPI auto-sync, delivered record management |
| 2.0 | Mar 3, 2026 | Login redesign, forgot password, bug fixes |

---

## 13. Developer Information

**Developed by**: Zobair Khan  
**Organization**: Fiber @ Home Global Limited  
**Repository**: https://github.com/kzobair/Salesforce-Management-Software

---

*© 2026 Fiber @ Home Global Limited. All rights reserved.*
