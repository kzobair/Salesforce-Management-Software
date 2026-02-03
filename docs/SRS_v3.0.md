# FGL Salesforce Management Platform
## Software Requirements Specification (SRS)
### Version 3.0

---

## Document Information

| Field | Details |
|-------|---------|
| **Document Title** | Software Requirements Specification |
| **Project Name** | FGL Salesforce Management Platform |
| **Version** | 3.0 |
| **Date** | February 2026 |
| **Status** | Final |
| **Prepared By** | FGL Development Team |

---

## Revision History

| Version | Date | Description | Author |
|---------|------|-------------|--------|
| 1.0 | January 2026 | Initial SRS Draft | FGL Team |
| 2.0 | January 2026 | Added 9 enhancement requirements | FGL Team |
| 3.0 | February 2026 | Final version with complete implementation details | FGL Team |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features](#3-system-features)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [Data Models](#6-data-models)
7. [API Specifications](#7-api-specifications)
8. [User Interface Requirements](#8-user-interface-requirements)
9. [Security Requirements](#9-security-requirements)
10. [Deployment Requirements](#10-deployment-requirements)
11. [Appendices](#11-appendices)

---

## 1. Introduction

### 1.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the FGL Salesforce Management Platform. It details the functional and non-functional requirements, system features, user interfaces, and technical specifications necessary for the development, deployment, and maintenance of the system.

### 1.2 Scope

The FGL Salesforce Management Platform is a web-based application designed to streamline sales operations for FGL (FiberAtHome). The system enables Key Account Managers (KAMs) to track client meetings, manage sales pipelines, monitor deliveries, and measure performance against KPI targets. Super Users (Managers) have additional capabilities to oversee team performance, approve users, and assign KPI targets.

#### 1.2.1 In Scope
- User authentication and authorization
- Meeting management
- Sales pipeline tracking
- Delivery monitoring
- KPI assignment and tracking
- Performance analytics and reporting
- User management
- Multi-currency support (BDT/USD)
- Multiple capacity units (Mbps/Gbps/IPLC)

#### 1.2.2 Out of Scope
- Mobile native applications
- Integration with external CRM systems
- Automated email notifications (future enhancement)
- Financial/billing integration

### 1.3 Definitions, Acronyms, and Abbreviations

| Term | Definition |
|------|------------|
| **KAM** | Key Account Manager - Sales personnel responsible for managing client relationships |
| **Super User** | Administrator/Manager with elevated privileges |
| **MRC** | Monthly Recurring Charge - Regular monthly fee charged to clients |
| **OTC** | One-Time Charge - Single, upfront charge for services |
| **KPI** | Key Performance Indicator - Measurable value demonstrating effectiveness |
| **Pipeline** | Confirmed sales opportunities in progress |
| **Delivered** | Successfully completed and delivered services |
| **BDT** | Bangladeshi Taka (currency) |
| **USD** | United States Dollar (currency) |
| **Mbps** | Megabits per second (bandwidth unit) |
| **Gbps** | Gigabits per second (bandwidth unit) |
| **IPLC** | International Private Leased Circuit |
| **JWT** | JSON Web Token - Authentication mechanism |
| **API** | Application Programming Interface |
| **CRUD** | Create, Read, Update, Delete operations |

### 1.4 References

- IEEE 830-1998 Standard for Software Requirements Specifications
- FGL Business Process Documentation
- MongoDB Documentation
- FastAPI Documentation
- React.js Documentation

### 1.5 Overview

This document is organized into the following sections:
- **Section 2**: Overall system description and context
- **Section 3**: Detailed functional requirements
- **Section 4**: External interface requirements
- **Section 5**: Non-functional requirements
- **Section 6**: Data models and database schema
- **Section 7**: API specifications
- **Section 8**: User interface requirements
- **Section 9**: Security requirements
- **Section 10**: Deployment requirements
- **Section 11**: Appendices

---

## 2. Overall Description

### 2.1 Product Perspective

The FGL Salesforce Management Platform is a standalone web application that operates independently. It consists of:

- **Frontend Application**: React-based single-page application (SPA)
- **Backend API**: FastAPI-based RESTful API server
- **Database**: MongoDB document database
- **Web Server**: Nginx reverse proxy

#### 2.1.1 System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                           │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      NGINX REVERSE PROXY                         │
│                         (Port 80/443)                            │
└─────────────────────────────────────────────────────────────────┘
                    │                           │
                    ▼                           ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐
│      REACT FRONTEND         │   │      FASTAPI BACKEND        │
│        (Port 3000)          │   │        (Port 8001)          │
│                             │   │                             │
│  • User Interface           │   │  • REST API Endpoints       │
│  • State Management         │   │  • Business Logic           │
│  • Client-side Routing      │   │  • Authentication           │
│  • Form Validation          │   │  • Data Validation          │
└─────────────────────────────┘   └─────────────────────────────┘
                                                │
                                                ▼
                                  ┌─────────────────────────────┐
                                  │        MONGODB              │
                                  │       (Port 27017)          │
                                  │                             │
                                  │  • Users Collection         │
                                  │  • Meetings Collection      │
                                  │  • Pipelines Collection     │
                                  │  • Delivered Collection     │
                                  │  • KPI Assignments          │
                                  └─────────────────────────────┘
```

### 2.2 Product Functions

The system provides the following major functions:

#### 2.2.1 User Management
- User registration with approval workflow
- Role-based authentication (KAM, Super User)
- Session management with JWT tokens
- User activation/deactivation

#### 2.2.2 Meeting Management
- Record client meetings with detailed information
- Track capacity requirements and pricing
- Support multiple currencies (BDT/USD)
- Support multiple capacity units (Mbps/Gbps/IPLC)
- Search and filter meetings

#### 2.2.3 Pipeline Management
- Track confirmed sales opportunities
- Monitor confirmation status
- Track delivery status (Yes/No/Pending/In Process)
- Support OTC charges alongside MRC

#### 2.2.4 Delivery Tracking
- View delivered services from confirmed pipelines
- Track KPI scores for deliveries
- Generate delivery summaries

#### 2.2.5 KPI Management
- Assign monthly targets to KAMs
- Track revenue, capacity, and score targets
- Monitor KPI achievement

#### 2.2.6 Analytics & Reporting
- Dashboard with 2-month summary comparison
- KAM performance rankings
- Individual KAM profiles with statistics

### 2.3 User Classes and Characteristics

#### 2.3.1 Key Account Manager (KAM)

| Attribute | Description |
|-----------|-------------|
| **Role** | Sales personnel |
| **Technical Expertise** | Basic computer literacy |
| **Frequency of Use** | Daily |
| **Primary Functions** | Record meetings, manage pipeline, track deliveries |
| **Access Level** | Own data only |

#### 2.3.2 Super User (Manager/Administrator)

| Attribute | Description |
|-----------|-------------|
| **Role** | Sales Manager / Administrator |
| **Technical Expertise** | Intermediate computer literacy |
| **Frequency of Use** | Daily |
| **Primary Functions** | All KAM functions + user management, KPI assignment, team analytics |
| **Access Level** | All data across all users |

### 2.4 Operating Environment

#### 2.4.1 Server Requirements

| Component | Requirement |
|-----------|-------------|
| **Operating System** | Ubuntu 20.04+ LTS |
| **CPU** | Minimum 2 cores, Recommended 4 cores |
| **RAM** | Minimum 4 GB, Recommended 8 GB |
| **Storage** | Minimum 20 GB SSD |
| **Python** | 3.11 or higher |
| **Node.js** | 18.x or higher |
| **MongoDB** | 6.0 or higher |
| **Nginx** | Latest stable version |

#### 2.4.2 Client Requirements

| Component | Requirement |
|-----------|-------------|
| **Browser** | Chrome 90+, Firefox 88+, Safari 14+, Edge 90+ |
| **Screen Resolution** | Minimum 1280x720 |
| **JavaScript** | Enabled |
| **Cookies** | Enabled |

### 2.5 Design and Implementation Constraints

1. **Technology Stack**: Must use React, FastAPI, and MongoDB
2. **Authentication**: JWT-based token authentication
3. **API Design**: RESTful API principles
4. **Responsive Design**: Support desktop and tablet devices
5. **Browser Compatibility**: Support modern browsers only
6. **Data Persistence**: All data stored in MongoDB
7. **Stateless Backend**: No server-side sessions

### 2.6 Assumptions and Dependencies

#### 2.6.1 Assumptions
- Users have stable internet connectivity
- Users have basic computer literacy
- Server has reliable power and network connectivity
- MongoDB is running and accessible

#### 2.6.2 Dependencies
- MongoDB database service
- Node.js runtime environment
- Python runtime environment
- Nginx web server
- PM2 process manager

---

## 3. System Features

### 3.1 Authentication Module

#### 3.1.1 User Registration

**Description**: Allow new users to register for an account.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| AUTH-REG-001 | System shall provide a registration form with fields: Name, Email, Mobile (optional), Password |
| AUTH-REG-002 | System shall validate email format and uniqueness |
| AUTH-REG-003 | System shall enforce password policy: minimum 8 characters, 1 uppercase, 1 lowercase, 1 number |
| AUTH-REG-004 | System shall set new user status to "Pending" by default |
| AUTH-REG-005 | System shall assign "KAM" role to new registrations by default |
| AUTH-REG-006 | System shall display appropriate success/error messages |

#### 3.1.2 User Login

**Description**: Allow registered and approved users to log in.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| AUTH-LOGIN-001 | System shall provide login form with Email and Password fields |
| AUTH-LOGIN-002 | System shall validate credentials against stored data |
| AUTH-LOGIN-003 | System shall verify user status is "Active" before allowing login |
| AUTH-LOGIN-004 | System shall generate JWT access token upon successful login |
| AUTH-LOGIN-005 | System shall store token in browser localStorage |
| AUTH-LOGIN-006 | System shall redirect to Dashboard upon successful login |
| AUTH-LOGIN-007 | System shall display error message for invalid credentials |
| AUTH-LOGIN-008 | System shall display message for pending/rejected/disabled accounts |

#### 3.1.3 User Logout

**Description**: Allow users to securely log out.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| AUTH-LOGOUT-001 | System shall provide logout option in navigation |
| AUTH-LOGOUT-002 | System shall clear stored token on logout |
| AUTH-LOGOUT-003 | System shall redirect to login page after logout |

#### 3.1.4 Session Management

**Description**: Manage user sessions securely.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| AUTH-SESSION-001 | System shall set token expiration to 24 hours |
| AUTH-SESSION-002 | System shall automatically redirect to login when token expires |
| AUTH-SESSION-003 | System shall include token in all API requests |
| AUTH-SESSION-004 | System shall validate token on each protected API request |

---

### 3.2 Dashboard Module

#### 3.2.1 Dashboard Overview

**Description**: Display summary statistics and quick actions.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| DASH-001 | System shall display welcome message with user name and role |
| DASH-002 | System shall display 2-month summary (current and previous month) |
| DASH-003 | System shall show meetings count for each month |
| DASH-004 | System shall show pipeline count and MRC value for each month |
| DASH-005 | System shall show delivered count and KPI score for each month |
| DASH-006 | System shall display total statistics cards (all-time) |
| DASH-007 | System shall display KPI progress bars for KAM users (if assigned) |
| DASH-008 | System shall provide quick action links to main modules |
| DASH-009 | System shall show "KAM Rankings" quick action for Super Users only |

#### 3.2.2 Monthly Comparison

**Description**: Compare current and previous month performance.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| DASH-COMP-001 | Current month card shall display month name and "Current" label |
| DASH-COMP-002 | Previous month card shall display month name and "Previous" label |
| DASH-COMP-003 | Each card shall show: Meetings count, Pipeline count with MRC, Delivered count with KPI |
| DASH-COMP-004 | Current month card shall have green accent border |
| DASH-COMP-005 | Previous month card shall have gray accent border |

---

### 3.3 Meetings Module

#### 3.3.1 Meeting List

**Description**: Display list of all meetings.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| MTG-LIST-001 | System shall display meetings in a tabular format |
| MTG-LIST-002 | Table shall show: Serial #, Client Name, Contact Person, Contact Number, Capacity (with unit), MRC (with currency and OTC), Meeting Date, Actions |
| MTG-LIST-003 | System shall provide search functionality by client name or contact |
| MTG-LIST-004 | KAM users shall see only their own meetings |
| MTG-LIST-005 | Super Users shall see all meetings |
| MTG-LIST-006 | System shall display "No meetings found" message when list is empty |

#### 3.3.2 Create Meeting

**Description**: Allow users to create new meeting records.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| MTG-CREATE-001 | System shall provide "Add Meeting" button |
| MTG-CREATE-002 | System shall display meeting form in a modal dialog |
| MTG-CREATE-003 | Form shall include Client Information section: Client Name*, Contact Person*, Client Address*, Contact Number* |
| MTG-CREATE-004 | Form shall include Primary Capacity section: Capacity Req* (with unit dropdown), MRC* (with currency dropdown), OTC (with currency dropdown) |
| MTG-CREATE-005 | Capacity unit dropdown shall include: Mbps, Gbps, IPLC |
| MTG-CREATE-006 | Currency dropdown shall include: BDT, USD |
| MTG-CREATE-007 | Form shall include Other Capacity section (optional): Capacity Req (with unit), MRC (with currency), OTC (with currency) |
| MTG-CREATE-008 | Form shall include Meeting Minutes* field (textarea) |
| MTG-CREATE-009 | System shall validate all required fields before submission |
| MTG-CREATE-010 | System shall auto-assign current user as KAM |
| MTG-CREATE-011 | System shall auto-generate serial number |
| MTG-CREATE-012 | System shall display success message upon creation |

#### 3.3.3 Edit Meeting

**Description**: Allow users to modify existing meetings.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| MTG-EDIT-001 | System shall provide "Edit" action for each meeting |
| MTG-EDIT-002 | System shall populate form with existing meeting data |
| MTG-EDIT-003 | System shall allow modification of all fields |
| MTG-EDIT-004 | System shall preserve original creation date |
| MTG-EDIT-005 | System shall update modified date on save |

#### 3.3.4 Delete Meeting

**Description**: Allow users to delete meetings.

**Priority**: Medium

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| MTG-DEL-001 | System shall provide "Delete" action for each meeting |
| MTG-DEL-002 | System shall soft-delete records (set is_deleted flag) |
| MTG-DEL-003 | Deleted meetings shall not appear in list |

---

### 3.4 Pipeline Module

#### 3.4.1 Pipeline List

**Description**: Display list of all pipeline records.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| PIP-LIST-001 | System shall display pipelines in a tabular format |
| PIP-LIST-002 | Table shall show: Serial #, Client Name, Contact, Capacity (with unit), MRC (with currency and OTC), Status, Delivered Status, Confirmation Date, Actions |
| PIP-LIST-003 | Status column shall display "Pending" or "Confirmed" with color coding |
| PIP-LIST-004 | Delivered Status column shall display: Yes (blue), In Process (purple), No (red), Pending (gray) |
| PIP-LIST-005 | System shall provide search functionality |
| PIP-LIST-006 | KAM users shall see only their own pipelines |
| PIP-LIST-007 | Super Users shall see all pipelines |

#### 3.4.2 Create Pipeline

**Description**: Allow users to create new pipeline records.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| PIP-CREATE-001 | System shall provide "Add Pipeline" button |
| PIP-CREATE-002 | Form shall include all meeting fields plus: |
| PIP-CREATE-003 | Confirmation Status* dropdown: Pending, Confirmed |
| PIP-CREATE-004 | Confirmation Date* (required if status is Confirmed) |
| PIP-CREATE-005 | Delivered Status* dropdown: Pending, In Process, Yes, No |
| PIP-CREATE-006 | Confirmation Notes (optional textarea) |
| PIP-CREATE-007 | System shall auto-generate serial number |

#### 3.4.3 Edit Pipeline

**Description**: Allow users to modify existing pipelines.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| PIP-EDIT-001 | System shall allow editing all pipeline fields |
| PIP-EDIT-002 | System shall allow changing Delivered Status |
| PIP-EDIT-003 | When Delivered Status changed to "Yes", pipeline shall appear in Delivered module |

#### 3.4.4 Delete Pipeline

**Description**: Allow users to delete pipelines.

**Priority**: Medium

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| PIP-DEL-001 | System shall provide "Delete" action |
| PIP-DEL-002 | System shall soft-delete records |

---

### 3.5 Delivered Module

#### 3.5.1 Delivered List

**Description**: Display list of delivered services.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| DEL-LIST-001 | System shall provide two view modes: "From Pipeline" and "Delivered Records" |
| DEL-LIST-002 | "From Pipeline" view shall show pipelines with Delivered Status = "Yes" |
| DEL-LIST-003 | "Delivered Records" view shall show manually created delivered records |
| DEL-LIST-004 | Table shall show: Serial #, Client, Capacity (with unit), MRC (with currency), OTC, KPI Score, Date, Status |
| DEL-LIST-005 | System shall display summary statistics: Total Count, Total Capacity, Total Revenue, Total KPI Score |

#### 3.5.2 Summary Statistics

**Description**: Display aggregated delivery statistics.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| DEL-STATS-001 | System shall calculate and display total delivered count |
| DEL-STATS-002 | System shall calculate and display total capacity delivered |
| DEL-STATS-003 | System shall calculate and display total revenue (MRC) |
| DEL-STATS-004 | System shall calculate and display total KPI achievement |

---

### 3.6 KPI Assignment Module (Super User Only)

#### 3.6.1 KPI Assignment List

**Description**: Display list of KPI assignments.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| KPI-LIST-001 | System shall restrict access to Super Users only |
| KPI-LIST-002 | Table shall show: Month, KAM Name, Revenue Target, Capacity Target, KPI Score Target, Notes, Actions |
| KPI-LIST-003 | System shall provide filter by month |
| KPI-LIST-004 | System shall provide filter by KAM |

#### 3.6.2 Create KPI Assignment

**Description**: Allow Super Users to assign KPI targets.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| KPI-CREATE-001 | Form shall include: Month* (YYYY-MM picker), KAM* (dropdown of active KAMs) |
| KPI-CREATE-002 | Form shall include: Revenue Target*, Capacity Target*, KPI Score Target* |
| KPI-CREATE-003 | Form shall include: Notes (optional) |
| KPI-CREATE-004 | System shall prevent duplicate assignment (same KAM + same month) |
| KPI-CREATE-005 | System shall validate all required fields |

#### 3.6.3 Edit KPI Assignment

**Description**: Allow Super Users to modify KPI assignments.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| KPI-EDIT-001 | System shall allow editing targets and notes |
| KPI-EDIT-002 | System shall NOT allow changing KAM or Month (delete and recreate instead) |

#### 3.6.4 Delete KPI Assignment

**Description**: Allow Super Users to delete KPI assignments.

**Priority**: Medium

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| KPI-DEL-001 | System shall provide delete action |
| KPI-DEL-002 | System shall confirm before deletion |

---

### 3.7 KAM Rankings Module (Super User Only)

#### 3.7.1 Rankings Display

**Description**: Display KAM performance rankings.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| RANK-001 | System shall restrict access to Super Users only |
| RANK-002 | System shall display all KAMs ranked by Total KPI Score (descending) |
| RANK-003 | Table shall show: Rank, KAM Name, Email, Total KPI Score, Actions |
| RANK-004 | Top 3 ranks shall display medal icons (🥇🥈🥉) |
| RANK-005 | System shall provide "View Profile" action for each KAM |

---

### 3.8 KAM Profile Module (Super User Only)

#### 3.8.1 Profile Display

**Description**: Display individual KAM profile with detailed statistics.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| PROF-001 | System shall restrict access to Super Users only |
| PROF-002 | System shall display Personal Information: Name, Email, Mobile, Role |
| PROF-003 | System shall display Performance Statistics: Total KPI Score, Meetings Count, Pipelines Count, Delivered Count, Total Revenue, Total Capacity |
| PROF-004 | System shall display KPI Assignment History table |
| PROF-005 | KPI History shall show: Month, KPI Score Target, Revenue Target, Capacity Target, Notes |
| PROF-006 | System shall provide "Back to Rankings" navigation |

---

### 3.9 User Management Module (Super User Only)

#### 3.9.1 User List

**Description**: Display and manage all users.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| USER-LIST-001 | System shall restrict access to Super Users only |
| USER-LIST-002 | Table shall show: Name, Email, Mobile, Role, Status, Created Date, Actions |
| USER-LIST-003 | Status shall be color-coded: Pending (yellow), Active (green), Rejected (red), Disabled (gray) |

#### 3.9.2 User Actions

**Description**: Allow Super Users to manage user accounts.

**Priority**: High

**Functional Requirements**:

| ID | Requirement |
|----|-------------|
| USER-ACT-001 | "Approve" action shall change status from Pending to Active |
| USER-ACT-002 | "Reject" action shall change status from Pending to Rejected |
| USER-ACT-003 | "Make Super User" action shall change role from KAM to SuperUser |
| USER-ACT-004 | "Disable" action shall change status to Disabled |
| USER-ACT-005 | "Enable" action shall change status to Active |
| USER-ACT-006 | Super Users cannot disable their own account |

---

## 4. External Interface Requirements

### 4.1 User Interfaces

#### 4.1.1 General UI Requirements

| ID | Requirement |
|----|-------------|
| UI-GEN-001 | All pages shall have consistent navigation header |
| UI-GEN-002 | Navigation shall include: Dashboard, Meetings, Pipeline, Delivered |
| UI-GEN-003 | Super User navigation shall additionally include: KPI Assignments, KAM Rankings, User Management |
| UI-GEN-004 | All pages shall display current user name and logout option |
| UI-GEN-005 | Forms shall clearly indicate required fields with asterisk (*) |
| UI-GEN-006 | Error messages shall be displayed in red |
| UI-GEN-007 | Success messages shall be displayed in green |
| UI-GEN-008 | Loading states shall display spinner animation |

#### 4.1.2 Responsive Design

| ID | Requirement |
|----|-------------|
| UI-RESP-001 | Application shall be optimized for desktop (1280px+) |
| UI-RESP-002 | Application shall be usable on tablet (768px+) |
| UI-RESP-003 | Tables shall be horizontally scrollable on smaller screens |

### 4.2 Hardware Interfaces

The system does not have direct hardware interfaces. All interactions occur through standard web browsers.

### 4.3 Software Interfaces

#### 4.3.1 Database Interface

| Component | Specification |
|-----------|---------------|
| Database | MongoDB 6.0+ |
| Driver | Motor (async MongoDB driver for Python) |
| Connection | Via MONGO_URL environment variable |

#### 4.3.2 Web Server Interface

| Component | Specification |
|-----------|---------------|
| Web Server | Nginx |
| Frontend Proxy | localhost:3000 |
| Backend Proxy | localhost:8001 |

### 4.4 Communications Interfaces

#### 4.4.1 HTTP/HTTPS

| Protocol | Usage |
|----------|-------|
| HTTP | Development environment |
| HTTPS | Production environment (recommended) |

#### 4.4.2 API Communication

| Format | Specification |
|--------|---------------|
| Request Format | JSON |
| Response Format | JSON |
| Authentication | Bearer Token (JWT) |

---

## 5. Non-Functional Requirements

### 5.1 Performance Requirements

| ID | Requirement |
|----|-------------|
| PERF-001 | Page load time shall be under 3 seconds on standard connection |
| PERF-002 | API response time shall be under 500ms for standard operations |
| PERF-003 | System shall support minimum 50 concurrent users |
| PERF-004 | Database queries shall be optimized with proper indexing |

### 5.2 Safety Requirements

| ID | Requirement |
|----|-------------|
| SAFE-001 | System shall perform soft-delete to prevent accidental data loss |
| SAFE-002 | System shall maintain audit trail (created_at, updated_at) |
| SAFE-003 | System shall validate all inputs to prevent data corruption |

### 5.3 Security Requirements

| ID | Requirement |
|----|-------------|
| SEC-001 | Passwords shall be hashed using bcrypt algorithm |
| SEC-002 | Authentication shall use JWT tokens |
| SEC-003 | Tokens shall expire after 24 hours |
| SEC-004 | All API endpoints (except login/register) shall require authentication |
| SEC-005 | Role-based access control shall be enforced |
| SEC-006 | MongoDB shall not expose ObjectId in API responses |
| SEC-007 | CORS shall be configured to allow only authorized origins |
| SEC-008 | Production deployment shall use HTTPS |

### 5.4 Software Quality Attributes

#### 5.4.1 Availability
- System shall have 99% uptime
- PM2 shall auto-restart failed processes

#### 5.4.2 Maintainability
- Code shall follow consistent formatting standards
- Components shall be modular and reusable
- API endpoints shall follow RESTful conventions

#### 5.4.3 Portability
- System shall run on any Linux server meeting requirements
- Frontend shall work on all modern browsers

#### 5.4.4 Scalability
- Database schema shall support horizontal scaling
- Stateless backend design enables load balancing

### 5.5 Business Rules

| ID | Rule |
|----|------|
| BUS-001 | New users must be approved by Super User before login |
| BUS-002 | Only one KPI assignment per KAM per month |
| BUS-003 | KAMs can only view/edit their own data |
| BUS-004 | Super Users can view all data |
| BUS-005 | Delivered status "Yes" triggers appearance in Delivered module |

---

## 6. Data Models

### 6.1 User Model

```javascript
{
  user_id: String (UUID),           // Unique identifier
  name: String,                     // Full name
  email: String,                    // Email address (unique)
  mobile: String (optional),        // Mobile number
  role: String,                     // "KAM" | "SuperUser"
  status: String,                   // "Pending" | "Active" | "Rejected" | "Disabled"
  password_hash: String,            // Bcrypt hashed password
  created_at: DateTime,             // Registration timestamp
  updated_at: DateTime,             // Last update timestamp
  last_login_at: DateTime           // Last login timestamp
}
```

### 6.2 Meeting Model

```javascript
{
  meeting_id: String (UUID),        // Unique identifier
  serial_number: String,            // Auto-generated serial
  kam_user_id: String,              // Reference to user
  
  // Client Information
  client_name: String,
  client_address: String,
  contact_name: String,
  contact_number: String,
  
  // Primary Capacity
  capacity_req: Number,
  capacity_unit: String,            // "Mbps" | "Gbps" | "IPLC"
  capacity_mrc: Number,
  capacity_mrc_currency: String,    // "BDT" | "USD"
  capacity_otc: Number,
  capacity_otc_currency: String,    // "BDT" | "USD"
  
  // Other Capacity (optional)
  other_cap_req: Number,
  other_cap_unit: String,
  other_cap_mrc: Number,
  other_cap_mrc_currency: String,
  other_cap_otc: Number,
  other_cap_otc_currency: String,
  
  // Meeting Details
  meeting_minutes: String,
  meeting_date: DateTime,
  
  // Metadata
  created_at: DateTime,
  updated_at: DateTime,
  is_deleted: Boolean
}
```

### 6.3 Pipeline Model

```javascript
{
  pipeline_id: String (UUID),       // Unique identifier
  serial_number: String,            // Auto-generated serial
  kam_user_id: String,              // Reference to user
  
  // Client Information (same as Meeting)
  client_name: String,
  client_address: String,
  contact_name: String,
  contact_number: String,
  
  // Capacity Information (same as Meeting)
  capacity_req: Number,
  capacity_unit: String,
  capacity_mrc: Number,
  capacity_mrc_currency: String,
  capacity_otc: Number,
  capacity_otc_currency: String,
  other_cap_req: Number,
  other_cap_unit: String,
  other_cap_mrc: Number,
  other_cap_mrc_currency: String,
  other_cap_otc: Number,
  other_cap_otc_currency: String,
  
  // Pipeline Specific
  confirmation_status: String,      // "Pending" | "Confirmed"
  confirmation_date: DateTime,
  confirmation_notes: String,
  delivered_status: String,         // "Pending" | "In Process" | "Yes" | "No"
  
  // Metadata
  created_at: DateTime,
  updated_at: DateTime,
  is_deleted: Boolean
}
```

### 6.4 Delivered Model

```javascript
{
  delivered_id: String (UUID),      // Unique identifier
  serial_number: String,            // Auto-generated serial
  kam_user_id: String,              // Reference to user
  pipeline_id: String (optional),   // Reference to pipeline
  
  // Client Information
  client_name: String,
  
  // Capacity Information
  capacity_req: Number,
  capacity_unit: String,
  capacity_mrc: Number,
  capacity_mrc_currency: String,
  capacity_otc: Number,
  capacity_otc_currency: String,
  
  // Delivered Specific
  delivered_date: DateTime,
  delivered_status: String,
  kpi_score: Number,
  
  // Metadata
  created_at: DateTime,
  updated_at: DateTime,
  is_deleted: Boolean
}
```

### 6.5 KPI Assignment Model

```javascript
{
  assignment_id: String (UUID),     // Unique identifier
  month: String,                    // "YYYY-MM" format
  kam_user_id: String,              // Reference to user
  
  // Targets
  revenue_target: Number,
  capacity_target: Number,
  kpi_score_target: Number,
  
  // Additional
  notes: String,
  
  // Metadata
  created_at: DateTime,
  updated_at: DateTime
}
```

---

## 7. API Specifications

### 7.1 Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login and get token | No |
| GET | `/api/auth/me` | Get current user info | Yes |

### 7.2 User Management Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/users/` | List all users | Yes | SuperUser |
| GET | `/api/users/{user_id}` | Get user details | Yes | SuperUser |
| PUT | `/api/users/{user_id}/approve` | Approve user | Yes | SuperUser |
| PUT | `/api/users/{user_id}/reject` | Reject user | Yes | SuperUser |
| PUT | `/api/users/{user_id}/disable` | Disable user | Yes | SuperUser |
| PUT | `/api/users/{user_id}/enable` | Enable user | Yes | SuperUser |
| PUT | `/api/users/{user_id}/make-superuser` | Promote to SuperUser | Yes | SuperUser |

### 7.3 Meeting Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/meetings/` | List meetings | Yes |
| POST | `/api/meetings/` | Create meeting | Yes |
| GET | `/api/meetings/{meeting_id}` | Get meeting details | Yes |
| PUT | `/api/meetings/{meeting_id}` | Update meeting | Yes |
| DELETE | `/api/meetings/{meeting_id}` | Delete meeting | Yes |

### 7.4 Pipeline Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/pipelines/` | List pipelines | Yes |
| POST | `/api/pipelines/` | Create pipeline | Yes |
| GET | `/api/pipelines/{pipeline_id}` | Get pipeline details | Yes |
| PUT | `/api/pipelines/{pipeline_id}` | Update pipeline | Yes |
| DELETE | `/api/pipelines/{pipeline_id}` | Delete pipeline | Yes |
| GET | `/api/pipelines/delivered-pipelines` | Get pipelines with delivered_status="Yes" | Yes |

### 7.5 Delivered Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/delivered/` | List delivered records | Yes |
| POST | `/api/delivered/` | Create delivered record | Yes |
| GET | `/api/delivered/stats/summary` | Get delivery statistics | Yes |

### 7.6 KPI Assignment Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/kpi-assignments/` | List KPI assignments | Yes | SuperUser |
| POST | `/api/kpi-assignments/` | Create KPI assignment | Yes | SuperUser |
| PUT | `/api/kpi-assignments/{id}` | Update KPI assignment | Yes | SuperUser |
| DELETE | `/api/kpi-assignments/{id}` | Delete KPI assignment | Yes | SuperUser |
| GET | `/api/kpi-assignments/my-current` | Get current user's KPI | Yes | KAM |

### 7.7 Dashboard Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/dashboard/monthly-summary` | Get 2-month summary | Yes |
| GET | `/api/dashboard/total-summary` | Get total statistics | Yes |

### 7.8 KAM Management Endpoints

| Method | Endpoint | Description | Auth | Role |
|--------|----------|-------------|------|------|
| GET | `/api/kam/rankings` | Get KAM rankings | Yes | SuperUser |
| GET | `/api/kam/profile/{kam_user_id}` | Get KAM profile | Yes | SuperUser |

---

## 8. User Interface Requirements

### 8.1 Login Page

**Components:**
- Logo and application title
- Email input field
- Password input field
- "Sign In" button
- "Register here" link
- Error message display area

### 8.2 Registration Page

**Components:**
- Logo and application title
- Name input field
- Email input field
- Mobile input field (optional)
- Password input field
- "Register" button
- "Back to Login" link
- Error/success message display area

### 8.3 Dashboard Page

**Components:**
- Welcome header with user name and role
- Monthly comparison cards (current and previous)
- Total statistics cards (3 cards)
- KPI progress section (for KAMs)
- Quick action buttons
- System status indicator

### 8.4 Meetings Page

**Components:**
- Page title and description
- "Add Meeting" button
- Search input
- Meetings table with pagination
- Meeting form modal (create/edit)
- Delete confirmation dialog

### 8.5 Pipeline Page

**Components:**
- Page title and description
- "Add Pipeline" button
- Search input
- Filter options
- Pipeline table with pagination
- Pipeline form modal (create/edit)
- Delete confirmation dialog

### 8.6 Delivered Page

**Components:**
- Page title and description
- View mode toggle (From Pipeline / Delivered Records)
- Summary statistics cards (4 cards)
- Delivered table with pagination

### 8.7 KPI Assignments Page (Super User)

**Components:**
- Page title and description
- "Assign KPI" button
- Filter by month
- Filter by KAM
- KPI assignments table
- KPI form modal (create/edit)

### 8.8 KAM Rankings Page (Super User)

**Components:**
- Page title
- Rankings table with medal icons
- "View Profile" links

### 8.9 KAM Profile Page (Super User)

**Components:**
- "Back to Rankings" link
- Personal information card
- Performance statistics card (6 metrics)
- KPI assignment history table

### 8.10 User Management Page (Super User)

**Components:**
- Page title
- Users table
- Status badges (color-coded)
- Action buttons (Approve, Reject, Disable, Enable, Make Super User)

---

## 9. Security Requirements

### 9.1 Authentication Security

| Requirement | Implementation |
|-------------|----------------|
| Password Storage | Bcrypt hashing with salt |
| Token Type | JWT (JSON Web Token) |
| Token Expiration | 24 hours |
| Token Storage | Browser localStorage |

### 9.2 Authorization Security

| Role | Access Level |
|------|--------------|
| KAM | Own data only |
| SuperUser | All data + admin functions |

### 9.3 API Security

| Requirement | Implementation |
|-------------|----------------|
| Authentication | Bearer token in Authorization header |
| Input Validation | Pydantic models for request validation |
| CORS | Configured for authorized origins only |
| ObjectId Exposure | Excluded from all API responses |

### 9.4 Data Security

| Requirement | Implementation |
|-------------|----------------|
| Data at Rest | MongoDB encryption (optional) |
| Data in Transit | HTTPS (production) |
| Soft Delete | Data preserved with is_deleted flag |

---

## 10. Deployment Requirements

### 10.1 Server Requirements

| Component | Specification |
|-----------|---------------|
| OS | Ubuntu 20.04+ LTS |
| Python | 3.11+ |
| Node.js | 18+ |
| MongoDB | 6.0+ |
| Nginx | Latest stable |
| PM2 | Latest stable |

### 10.2 Environment Configuration

**Backend (.env)**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=fgl_salesforce
JWT_SECRET_KEY=<secure-random-string>
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

**Frontend (.env)**
```
REACT_APP_BACKEND_URL=http://your-server-ip
```

### 10.3 Process Management

| Process | Manager | Command |
|---------|---------|---------|
| Frontend | PM2 | `pm2 start "yarn start" --name fgl-frontend` |
| Backend | PM2 | `pm2 start "venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001" --name fgl-backend` |

### 10.4 Nginx Configuration

```nginx
server {
    listen 80;
    server_name YOUR_SERVER_IP;

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
    }
}
```

---

## 11. Appendices

### Appendix A: Default Credentials

| Role | Email | Password |
|------|-------|----------|
| Super User | admin@fgl.com | Admin@123 |

> **Note:** Change default credentials immediately after installation.

### Appendix B: Currency Symbols

| Currency | Symbol | Display Format |
|----------|--------|----------------|
| BDT | ৳ | ৳1,000 |
| USD | $ | $1,000 |

### Appendix C: Status Definitions

**User Status:**
| Status | Description |
|--------|-------------|
| Pending | Awaiting approval |
| Active | Can access system |
| Rejected | Registration denied |
| Disabled | Temporarily blocked |

**Pipeline Confirmation Status:**
| Status | Description |
|--------|-------------|
| Pending | Not yet confirmed |
| Confirmed | Deal confirmed |

**Pipeline Delivered Status:**
| Status | Description |
|--------|-------------|
| Pending | Not processed |
| In Process | Being delivered |
| Yes | Successfully delivered |
| No | Not delivered/cancelled |

### Appendix D: Serial Number Format

| Module | Format | Example |
|--------|--------|---------|
| Meeting | MTG-YYYYMMDD-XXXX | MTG-20260201-0001 |
| Pipeline | PIP-YYYYMMDD-XXXX | PIP-20260201-0001 |
| Delivered | DEL-YYYYMMDD-XXXX | DEL-20260201-0001 |

### Appendix E: File Structure

```
/Salesforce-Management-Software
├── backend/
│   ├── .env
│   ├── requirements.txt
│   ├── server.py
│   ├── models.py
│   ├── auth_utils.py
│   ├── dependencies.py
│   ├── init_superuser.py
│   └── routes/
│       ├── auth.py
│       ├── users.py
│       ├── meetings.py
│       ├── pipelines.py
│       ├── delivered.py
│       ├── kpi_assignments.py
│       ├── kam_management.py
│       └── dashboard.py
├── frontend/
│   ├── .env
│   ├── package.json
│   ├── craco.config.js
│   └── src/
│       ├── App.js
│       ├── contexts/
│       │   └── AuthContext.js
│       ├── components/
│       │   ├── Layout.js
│       │   └── ProtectedRoute.js
│       └── pages/
│           ├── Login.js
│           ├── Register.js
│           ├── Dashboard.js
│           ├── Meetings.js
│           ├── Pipelines.js
│           ├── Delivered.js
│           ├── KPIAssignments.js
│           ├── KAMRankings.js
│           ├── KAMProfile.js
│           └── UserManagement.js
└── docs/
    ├── USER_MANUAL.md
    ├── INSTALLATION_GUIDE.md
    └── FAQ.md
```

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Project Manager | | | |
| Technical Lead | | | |
| Quality Assurance | | | |
| Client Representative | | | |

---

*End of Document*
