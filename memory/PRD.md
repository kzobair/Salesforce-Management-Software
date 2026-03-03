# FGL Salesforce Management Platform - PRD

## Original Problem Statement
Build a salesforce management software named "FGL Salesforce Management Platform" with the following core features and 9 specific adjustments:

### Core Features
- User authentication with Super User approval workflow
- Meeting records management
- Pipeline (confirmed sales) tracking
- Delivered clients management
- KPI assignments and tracking

### 9 User-Requested Adjustments (Implemented)
1. ✅ Add "One Time Charge" (OTC) field beside each MRC field
2. ✅ All MRC & OTC fields have currency option (BDT or USD)
3. ✅ All capacity fields have a unit (Mbps, Gbps, IPLC)
4. ✅ Dashboard has 2-month summary (Current and Previous month)
5. ✅ Pipeline tab has "Delivered" status field (Yes/No/Pending/In Process)
6. ✅ Delivered tab shows only pipelines marked as 'Yes' in delivered status
7. ✅ KPI Assignment has "KPI Value or Score" field
8. ✅ Superuser can access each KAM's profile with all details and KPI Score
9. ✅ Superuser sees "KAM Status" Tab showing KAM rankings by KPI score

## Technical Architecture

### Backend (FastAPI + MongoDB)
```
/app/backend/
├── server.py              # Main FastAPI application
├── models.py              # Pydantic models for all entities
├── auth_utils.py          # JWT authentication utilities
├── dependencies.py        # Database and auth dependencies
├── init_superuser.py      # Initialize default admin user
└── routes/
    ├── auth.py            # Authentication routes
    ├── users.py           # User management routes
    ├── meetings.py        # Meeting CRUD routes
    ├── pipelines.py       # Pipeline CRUD routes
    ├── delivered.py       # Delivered CRUD routes
    ├── kpi_assignments.py # KPI assignment routes
    ├── kam_management.py  # KAM profiles and rankings
    └── dashboard.py       # Dashboard analytics routes
```

### Frontend (React + Tailwind CSS)
```
/app/frontend/src/
├── App.js                 # Main app with routing
├── contexts/
│   └── AuthContext.js     # Authentication context
├── components/
│   ├── Layout.js          # Main layout with navigation
│   └── ProtectedRoute.js  # Route protection wrapper
└── pages/
    ├── Login.js           # Login page
    ├── Register.js        # Registration page
    ├── Dashboard.js       # Dashboard with 2-month summary
    ├── Meetings.js        # Meetings management
    ├── Pipelines.js       # Pipeline management
    ├── Delivered.js       # Delivered clients view
    ├── KPIAssignments.js  # KPI assignments (SuperUser)
    ├── KAMRankings.js     # KAM rankings (SuperUser)
    ├── KAMProfile.js      # Individual KAM profile (SuperUser)
    └── UserManagement.js  # User management (SuperUser)
```

## Key Data Models

### User
- `user_id`, `name`, `email`, `mobile`
- `role`: "SuperUser" | "KAM"
- `status`: "Pending" | "Active" | "Rejected" | "Disabled"

### Meeting/Pipeline/Delivered
- `client_name`, `client_address`, `contact_name`, `contact_number`
- `capacity_req`, `capacity_unit` (Mbps/Gbps/IPLC)
- `capacity_mrc`, `capacity_mrc_currency` (BDT/USD)
- `capacity_otc`, `capacity_otc_currency` (BDT/USD)
- `other_cap_*` fields for secondary capacity
- Pipeline: `delivered_status` (Yes/No/Pending/In Process)
- Delivered: `kpi_score`, `delivered_date`

### KPI Assignment
- `month` (YYYY-MM), `kam_user_id`
- `revenue_target`, `capacity_target`, `kpi_score_target`

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login and get JWT token

### Core Modules
- `/api/meetings/` - Meeting CRUD
- `/api/pipelines/` - Pipeline CRUD
- `/api/delivered/` - Delivered CRUD
- `/api/kpi-assignments/` - KPI assignment CRUD (SuperUser)

### Dashboard & Analytics
- GET `/api/dashboard/monthly-summary` - 2-month comparison
- GET `/api/dashboard/total-summary` - Overall statistics

### KAM Management (SuperUser only)
- GET `/api/kam/profiles` - All KAM profiles
- GET `/api/kam/profile/{kam_user_id}` - Individual KAM profile
- GET `/api/kam/rankings` - KAM rankings by KPI score

## Test Credentials
- **Super User**: admin@fgl.com / Admin@123

## What's Been Implemented

### February 2, 2026
- ✅ Fixed critical frontend compilation error (babel plugin recursion)
- ✅ Implemented all 9 user adjustments
- ✅ Created KAMRankings and KAMProfile pages
- ✅ Added 2-month dashboard summary
- ✅ Added OTC fields with currency dropdowns
- ✅ Added capacity unit dropdowns
- ✅ Added Delivered Status to Pipeline
- ✅ Updated Delivered page to show pipelines with "Yes" status
- ✅ Added KPI Score Target to KPI Assignments
- ✅ All backend APIs created and tested (100% pass)
- ✅ All frontend features verified working

### March 3, 2026
- ✅ Redesigned Login Page with professional, animated design
  - Added animated network canvas with floating particles and connection lines
  - Implemented glass-morphism card with dark gradient background
  - Added FGL "Fiber @ Home Global" logo with glow effect
  - Blue accent color theme matching the app's existing theme
  - Smooth entrance animations for all form elements
  - Interactive input fields with blue glow on focus
  - Traveling light beam animation around the login card border
  - Dynamic color-changing particles
  - Added developer credit: "Developed by Zobair Khan"
- ✅ Logo saved to `/app/frontend/src/assets/fgl-logo.png`
- ✅ Fixed bug: Serial number generation for delivered records was crashing when encountering corrupted data (invalid serial format)
- ✅ Fixed bug: Delivered records now properly soft-delete when pipeline status changes FROM "Yes" to another status

## Future Enhancements (Backlog)
- Refactor large `Meetings.js` into smaller components
- Add export functionality (CSV/Excel)
- Add date range filters for reports
- Add email notifications for approvals
- Add bulk import for meetings/pipelines
- v2.0 features (to be defined)
