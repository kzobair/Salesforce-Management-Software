# Software Requirements Specification (SRS)
## FGL Salesforce Management Platform

---

**Document Version:** 2.0  
**Date:** February 2, 2026  
**Status:** Draft for Review  
**Prepared By:** FGL Development Team  
**Approved By:** [Pending Approval]

---

## Document Control

| Version | Date | Author | Changes | Approver |
|---------|------|--------|---------|----------|
| 1.0 | Feb 2, 2026 | Sales Operations | Initial Draft | - |
| 2.0 | Feb 2, 2026 | Development Team | Enhanced & Restructured | Pending |

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Introduction](#2-introduction)
3. [System Overview](#3-system-overview)
4. [User Personas & Roles](#4-user-personas--roles)
5. [Functional Requirements](#5-functional-requirements)
6. [Non-Functional Requirements](#6-non-functional-requirements)
7. [Data Model & Architecture](#7-data-model--architecture)
8. [User Interface Requirements](#8-user-interface-requirements)
9. [Security & Compliance](#9-security--compliance)
10. [Integration Requirements](#10-integration-requirements)
11. [Reporting & Analytics](#11-reporting--analytics)
12. [Deployment & Infrastructure](#12-deployment--infrastructure)
13. [Testing Strategy](#13-testing-strategy)
14. [Risk Assessment](#14-risk-assessment)
15. [Success Metrics](#15-success-metrics)
16. [Glossary](#16-glossary)
17. [Appendices](#17-appendices)

---

## 1. Executive Summary

### 1.1 Business Context

The **FGL Salesforce Management Platform** is a comprehensive web-based solution designed to streamline sales operations, pipeline management, and KPI tracking for FGL's sales organization. This system addresses the critical need for centralized meeting records, confirmed pipeline tracking, delivered client management, and performance monitoring across the Key Account Manager (KAM) team.

### 1.2 Key Objectives

- **Centralize Sales Data**: Consolidate meeting records, pipeline opportunities, and delivered clients in a single platform
- **Ensure Data Quality**: Track only confirmed pipeline opportunities validated by clients
- **Drive Accountability**: Enable KPI assignment and performance tracking at the individual KAM level
- **Enhance Visibility**: Provide real-time dashboards for both KAMs and sales leadership
- **Streamline Operations**: Replace manual tracking with automated, role-based workflows

### 1.3 Expected Benefits

| Benefit | Description | Expected Impact |
|---------|-------------|-----------------|
| Data Accuracy | Single source of truth for sales data | 95% reduction in data discrepancies |
| Time Savings | Automated reporting and tracking | 10-15 hours/week saved per KAM |
| Revenue Visibility | Real-time pipeline and delivery tracking | 100% pipeline transparency |
| Performance Management | KPI tracking against targets | Improved accountability & target achievement |
| Decision Making | Data-driven insights via dashboards | Faster, more informed decisions |

### 1.4 Scope Summary

**In Scope:**
- User registration, approval, and role-based access control
- Meeting records management
- Confirmed pipeline tracking with validation
- Delivered client tracking with KPI monitoring
- Monthly task and KPI assignment by sales leadership
- Real-time dashboards with current and previous month metrics

**Out of Scope (Phase 1):**
- Customer relationship management (CRM) features (e.g., email tracking, call logs)
- Contract management and document generation
- Automated workflow notifications (planned for Phase 2)
- Third-party system integrations (planned for future phases)
- Mobile native applications (web-responsive only)

---

## 2. Introduction

### 2.1 Purpose

This Software Requirements Specification (SRS) document provides a comprehensive description of the FGL Salesforce Management Platform. It defines all functional and non-functional requirements, system architecture, data models, and acceptance criteria necessary for the successful development, testing, deployment, and maintenance of the system.

### 2.2 Intended Audience

This document is intended for:

| Audience | Purpose | Key Sections |
|----------|---------|--------------|
| **Product Owner / Head of Sales** | Business validation and approval | Executive Summary, Functional Requirements, Success Metrics |
| **Sales Operations Team** | Requirements validation and UAT planning | Functional Requirements, UI Requirements, Workflows |
| **Key Account Managers (KAMs)** | End-user feature understanding | User Personas, Functional Requirements, UI Requirements |
| **Development Team** | System design and implementation | All Technical Sections, Data Model, Security |
| **QA / Testing Team** | Test planning and execution | Testing Strategy, Acceptance Criteria, Functional Requirements |
| **DevOps / Infrastructure Team** | Deployment planning | Deployment & Infrastructure, Non-Functional Requirements |
| **Project Managers** | Project planning and tracking | All Sections, Risk Assessment |

### 2.3 Document Conventions

- **Requirements Identifiers**: Each requirement has a unique ID (e.g., FR-AUTH-01, NFR-SEC-01)
  - **FR**: Functional Requirement
  - **NFR**: Non-Functional Requirement
  - **UI**: User Interface Requirement
  - **SEC**: Security Requirement
  - **INT**: Integration Requirement
- **Priority Levels**: Critical, High, Medium, Low
- **MoSCoW Method**: Must Have, Should Have, Could Have, Won't Have (this release)

### 2.4 Project Scope

The FGL Salesforce Management Platform is designed as a standalone web application with the following core capabilities:

**Core Modules:**
1. Authentication & User Management
2. Meeting List Management
3. Pipeline Management (Confirmed Only)
4. Delivered Client Tracking
5. Task & KPI Assignment
6. Dashboard & Analytics

**Key Differentiators:**
- **Confirmation-Based Pipeline**: Only client-confirmed opportunities appear in the pipeline (preventing inflated forecasts)
- **Monthly KPI Tracking**: Systematic assignment and monitoring of revenue and capacity targets
- **Role-Based Workflows**: Distinct capabilities for sales leadership vs. KAMs
- **Time-Based Analytics**: Month-over-month comparison for performance trending

### 2.5 Assumptions & Dependencies

**Assumptions:**
1. All users have access to modern web browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
2. Users have stable internet connectivity
3. The organization maintains an active list of KAMs
4. Client confirmation of pipeline opportunities is a validated business process
5. Monthly KPI targets will be consistently assigned by sales leadership

**Dependencies:**
1. Availability of secure hosting infrastructure
2. Access to a production-grade database system
3. Email service for password reset and notifications (future)
4. User training and adoption support from sales operations
5. Data migration support (if replacing existing systems)

**Constraints:**
1. Budget constraints may limit third-party integrations in Phase 1
2. Timeline constraint: Target go-live within 3 months
3. Initial deployment limited to 50-100 concurrent users
4. Must comply with organizational data privacy policies

---

## 3. System Overview

### 3.1 Product Perspective

The FGL Salesforce Management Platform is a **standalone web application** purpose-built for FGL's sales organization. It operates independently of existing systems in Phase 1, with future potential for integration with ERP, billing, or other enterprise systems.

**System Context Diagram:**

```
┌─────────────────────────────────────────────────────────────┐
│                    External Environment                      │
│                                                               │
│  ┌─────────────┐          ┌──────────────────────┐          │
│  │   Head of   │          │  Key Account         │          │
│  │    Sales    │          │  Managers (KAMs)     │          │
│  │ (Super User)│          │  (General Users)     │          │
│  └──────┬──────┘          └──────────┬───────────┘          │
│         │                            │                       │
│         │        ┌───────────────────┴────────┐              │
│         └────────►  FGL Salesforce Mgmt       │              │
│                  │      Platform (Web)        │              │
│                  └─────────────┬──────────────┘              │
│                                │                              │
│                  ┌─────────────▼──────────────┐              │
│                  │    Database (MongoDB/       │              │
│                  │    PostgreSQL/MySQL)        │              │
│                  └─────────────────────────────┘              │
│                                                               │
│  Future Integrations (Out of Scope - Phase 1):               │
│    - Email Service (Password Reset, Notifications)           │
│    - ERP System (Client Master Data)                         │
│    - Billing System (Revenue Validation)                     │
└─────────────────────────────────────────────────────────────┘
```

### 3.2 System Architecture (High-Level)

**Technology Stack Recommendations:**

| Layer | Technology Options | Recommendation |
|-------|-------------------|----------------|
| **Frontend** | React, Vue.js, Angular | React (modern, component-based) |
| **Backend** | Node.js, Python (FastAPI/Django), Java | Python FastAPI (rapid development, async support) |
| **Database** | MongoDB, PostgreSQL, MySQL | MongoDB (flexible schema, JSON-native) |
| **Authentication** | JWT, OAuth 2.0, Session-based | JWT (stateless, scalable) |
| **Hosting** | AWS, Azure, Google Cloud, On-premise | Cloud (AWS/Azure - scalable, managed) |
| **UI Framework** | Tailwind CSS, Material-UI, Bootstrap | Tailwind CSS (customizable, modern) |

**Architecture Pattern:**
- **Frontend**: Single Page Application (SPA) with React
- **Backend**: RESTful API with FastAPI
- **Database**: NoSQL (MongoDB) for flexibility
- **Authentication**: JWT-based with role claims
- **Deployment**: Containerized (Docker) for portability

### 3.3 User Journey Overview

**For Key Account Managers (KAMs):**

```
1. Register → 2. Wait for Approval → 3. Login → 4. View Dashboard
                                               ↓
5. Record Meetings → 6. Mark Pipeline as Confirmed → 7. Record Delivered Clients
                                               ↓
8. View Assigned KPIs → 9. Monitor Performance → 10. Export Reports
```

**For Head of Sales (Super User):**

```
1. Login → 2. Approve/Reject User Registrations → 3. View Organization Dashboard
                                                   ↓
4. Assign Monthly KPIs to KAMs → 5. Review Meeting/Pipeline/Delivered Data
                                                   ↓
6. Analyze Performance Trends → 7. Export Organization Reports
```

---

## 4. User Personas & Roles

### 4.1 Super User (Head of Sales)

**Profile:**
- **Name**: Sarah Johnson (Example Persona)
- **Role**: Head of Sales / Sales Director
- **Experience**: 15+ years in sales leadership
- **Technical Proficiency**: Moderate (comfortable with web applications, dashboards)
- **Primary Goals**:
  - Monitor overall sales performance across the team
  - Ensure KAMs meet their monthly targets
  - Maintain visibility into confirmed pipeline
  - Make data-driven decisions for resource allocation

**Key Responsibilities in System:**
1. Approve or reject new user registrations
2. Assign monthly revenue and capacity targets to KAMs
3. View all meeting, pipeline, and delivered records across the organization
4. Monitor KPI achievement vs. targets
5. Generate organization-wide reports
6. Manage KAM list and user access

**Pain Points (to be addressed):**
- Lack of real-time visibility into pipeline status
- Difficulty tracking individual KAM performance
- Manual consolidation of sales data from multiple sources
- Inability to distinguish between "hopeful" vs. "confirmed" pipeline

**Success Criteria:**
- Can assign monthly KPIs to all KAMs in under 30 minutes
- Can generate month-end performance reports in under 5 minutes
- Has real-time visibility into confirmed pipeline value
- Can identify underperforming KAMs and provide targeted support

---

### 4.2 Key Account Manager (KAM)

**Profile:**
- **Name**: Raj Patel (Example Persona)
- **Role**: Key Account Manager
- **Experience**: 3-5 years in B2B sales
- **Technical Proficiency**: Moderate (uses CRM, email, productivity tools daily)
- **Primary Goals**:
  - Track all client meetings and follow-ups
  - Maintain accurate pipeline of confirmed opportunities
  - Record delivered clients and associated revenue
  - Meet or exceed monthly KPI targets

**Key Responsibilities in System:**
1. Record all client meetings with detailed notes
2. Mark pipeline opportunities as "confirmed" only after client validation
3. Log delivered clients with actual capacity and revenue details
4. View assigned monthly KPIs and targets
5. Monitor personal performance via dashboard
6. Export reports for personal tracking

**Pain Points (to be addressed):**
- Spending too much time on manual data entry and reporting
- Difficulty tracking which opportunities are truly confirmed vs. speculative
- Lack of visibility into how performance compares to targets
- Manual calculation of monthly achievements

**Success Criteria:**
- Can record a new meeting in under 3 minutes
- Can update pipeline status on-the-go via web browser
- Has clear visibility into monthly targets and current achievement
- Can demonstrate pipeline status to leadership with confidence

---

### 4.3 Role-Based Access Control (RBAC) Matrix

| Feature / Module | Super User (Head of Sales) | KAM (General User) |
|------------------|---------------------------|-------------------|
| **User Management** |
| Register New Account | ✅ | ✅ |
| Approve/Reject Users | ✅ | ❌ |
| View All Users | ✅ | ❌ |
| **Dashboard** |
| View Personal Dashboard | ✅ | ✅ |
| View Organization Dashboard | ✅ | ❌ (own data only) |
| **Meeting List** |
| Create Meeting | ✅ | ✅ |
| Edit Meeting | ✅ | ✅ (own records) |
| Delete Meeting | ✅ | ✅ (own records) |
| View All Meetings | ✅ | ✅ (own records) / ❌ (others') |
| **Pipeline List** |
| Create Pipeline Entry | ✅ | ✅ |
| Mark as Confirmed | ✅ | ✅ (own records) |
| Edit Pipeline | ✅ | ✅ (own records) |
| View Confirmed Pipeline | ✅ | ✅ (own records) / ❌ (others') |
| **Delivered List** |
| Create Delivered Record | ✅ | ✅ |
| Edit Delivered Record | ✅ | ✅ (own records) |
| Enter KPI Value | ✅ | ✅ (own records) |
| View All Delivered | ✅ | ✅ (own records) / ❌ (others') |
| **Task & KPI Assignment** |
| Create/Edit KPI Assignments | ✅ | ❌ |
| View KPI Assignments | ✅ | ✅ (read-only, own only) |
| **Reporting** |
| Export Own Data | ✅ | ✅ |
| Export Organization Data | ✅ | ❌ |

---

## 5. Functional Requirements

### 5.1 Authentication & User Management

#### 5.1.1 User Registration

**User Story:**  
*As a new KAM, I want to register for an account so that I can access the salesforce management platform after approval.*

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **FR-AUTH-01** | System shall allow new users to self-register via a registration form | Must Have | • Registration form accessible without login<br>• Form includes: Full Name, Email, Mobile, Password, Confirm Password<br>• User account created with status = "Pending" |
| **FR-AUTH-02** | System shall prevent duplicate registrations using the same email address | Must Have | • Email uniqueness validated on submit<br>• Clear error message if email already exists<br>• Case-insensitive email matching |
| **FR-AUTH-03** | System shall enforce password policy requirements | Must Have | • Minimum 8 characters<br>• At least 1 uppercase, 1 lowercase, 1 number<br>• Password and Confirm Password must match<br>• Real-time validation feedback |
| **FR-AUTH-04** | System shall send confirmation notification upon successful registration | Should Have | • User sees success message<br>• Instructed to await admin approval<br>• Email notification sent (if email service available) |

**Business Rules:**
- All new registrations default to "Pending" status
- Users cannot login until status = "Active"
- Email addresses are case-insensitive and trimmed

---

#### 5.1.2 User Approval Workflow

**User Story:**  
*As Head of Sales, I want to review and approve/reject pending user registrations so that only authorized personnel can access the system.*

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **FR-AUTH-05** | System shall provide a User Management interface for Super User | Must Have | • List view of all pending registrations<br>• Shows: Name, Email, Registration Date<br>• Actions: Approve, Reject |
| **FR-AUTH-06** | System shall allow Super User to approve a pending user | Must Have | • One-click approval action<br>• User status updated to "Active"<br>• User can now login<br>• Confirmation message displayed |
| **FR-AUTH-07** | System shall allow Super User to reject a pending user | Must Have | • One-click reject action<br>• User status updated to "Rejected"<br>• User cannot login<br>• Option to provide rejection reason |
| **FR-AUTH-08** | System shall allow Super User to deactivate an active user | Should Have | • Deactivate action available for active users<br>• User status updated to "Disabled"<br>• User's active sessions invalidated<br>• User cannot login until reactivated |
| **FR-AUTH-09** | System shall maintain an audit log of approval/rejection actions | Should Have | • Log includes: User affected, Action taken, Admin who performed action, Timestamp<br>• Viewable by Super User |

---

#### 5.1.3 Login & Logout

**User Story:**  
*As an approved user, I want to securely login and logout so that I can access my account and protect my data.*

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **FR-AUTH-10** | System shall provide a login page for approved users | Must Have | • Login form with Email and Password fields<br>• "Remember Me" option<br>• Link to "Forgot Password" |
| **FR-AUTH-11** | System shall authenticate users against approved accounts only | Must Have | • Only users with status = "Active" can login<br>• Invalid credentials show generic error ("Invalid email or password")<br>• Pending/Rejected users cannot login |
| **FR-AUTH-12** | System shall create a secure session upon successful login | Must Have | • JWT token generated with user ID and role<br>• Token stored securely (httpOnly cookie or localStorage with precautions)<br>• Token includes expiration time |
| **FR-AUTH-13** | System shall redirect users to Dashboard after login | Must Have | • Successful login redirects to Dashboard<br>• User's role determines dashboard view |
| **FR-AUTH-14** | System shall provide a logout function | Must Have | • Logout button accessible from all pages<br>• Clears user session/token<br>• Redirects to login page |
| **FR-AUTH-15** | System shall implement session timeout for inactivity | Should Have | • Session expires after 30 minutes of inactivity (configurable)<br>• User redirected to login with timeout message<br>• Option to extend session before timeout |

---

#### 5.1.4 Password Management

**User Story:**  
*As a user, I want to reset my password if I forget it so that I can regain access to my account.*

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **FR-AUTH-16** | System shall provide a "Forgot Password" feature | Must Have | • Link available on login page<br>• Form to enter registered email address |
| **FR-AUTH-17** | System shall send password reset instructions via email | Must Have | • Email contains secure reset link or OTP<br>• Link/OTP expires after 15 minutes<br>• Email sent only if email exists (no user enumeration) |
| **FR-AUTH-18** | System shall allow users to reset password via secure link/OTP | Must Have | • Reset form requires: OTP/Token, New Password, Confirm Password<br>• Password policy enforced<br>• Old password invalidated upon successful reset |
| **FR-AUTH-19** | System shall allow logged-in users to change password | Should Have | • Change Password option in user profile<br>• Requires: Current Password, New Password, Confirm Password<br>• Password policy enforced |

---

### 5.2 Meeting List Module

#### 5.2.1 Meeting Record Management

**User Story:**  
*As a KAM, I want to record details of client meetings so that I can maintain a comprehensive log of all interactions and follow-ups.*

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **FR-MTG-01** | System shall allow KAMs to create new meeting records | Must Have | • "Add Meeting" button accessible from Meeting List page<br>• Form includes all required fields (see FR-MTG-02)<br>• Save and Cancel actions available |
| **FR-MTG-02** | System shall capture the following meeting data fields | Must Have | **Required Fields:**<br>• Serial Number (auto-generated)<br>• Client Name (text, max 200 chars)<br>• Client Address (text, max 500 chars)<br>• Contact Name (text, max 200 chars)<br>• Contact Number (text, validated for phone format)<br>• Capacity Requirement (numeric, ≥ 0)<br>• Capacity Monthly Recurring Charge (MRC) (numeric, ≥ 0, currency format)<br>• Other Capacity Requirement (numeric, ≥ 0, optional)<br>• Other Capacity MRC (numeric, ≥ 0, optional, currency format)<br>• Key Account Manager (dropdown, auto-populated with logged-in user for KAM role)<br>• Meeting Minutes (long text, max 5000 chars) |
| **FR-MTG-03** | System shall validate meeting data upon save | Must Have | • Client Name cannot be empty<br>• Contact Number validated for format (10-15 digits, optional country code)<br>• Numeric fields accept only numbers (decimals allowed)<br>• Numeric fields cannot be negative<br>• Capacity and MRC fields default to 0 if empty |
| **FR-MTG-04** | System shall allow KAMs to edit their own meeting records | Must Have | • Edit button available for own records<br>• Same form as create, pre-filled with existing data<br>• Update timestamp recorded upon save |
| **FR-MTG-05** | System shall allow KAMs to delete their own meeting records | Should Have | • Delete button with confirmation prompt<br>• Soft delete (record marked as deleted, not permanently removed)<br>• Deleted records not visible in lists but retained in database |
| **FR-MTG-06** | System shall auto-populate KAM field with logged-in user | Must Have | • KAM field pre-filled for KAM role users<br>• Super User can select any KAM from dropdown<br>• KAM dropdown populated from active users with role = KAM |
| **FR-MTG-07** | System shall display a list of all meetings | Must Have | • Table view with columns: Serial Number, Client Name, Contact Name, Meeting Date, KAM, Actions<br>• Pagination (20 records per page, configurable)<br>• KAMs see only their own meetings; Super User sees all |

**Business Rules:**
- Serial numbers are system-generated and sequential (e.g., MTG-2026-0001)
- Meeting date defaults to current date/time when record is created
- Capacity and MRC values stored with 2 decimal precision

---

#### 5.2.2 Meeting List Views & Filters

**User Story:**  
*As a user, I want to search and filter meeting records so that I can quickly find specific client meetings.*

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **FR-MTG-08** | System shall provide search functionality for meeting records | Must Have | • Search bar above meeting list<br>• Searches: Client Name, Contact Name<br>• Real-time search (debounced)<br>• Case-insensitive partial matching |
| **FR-MTG-09** | System shall provide filter options for meeting records | Should Have | • Filter by KAM (dropdown, Super User only)<br>• Filter by Date Range (From Date - To Date)<br>• Filter by Month (dropdown: Current Month, Previous Month, Custom)<br>• Apply and Clear Filter buttons |
| **FR-MTG-10** | System shall allow sorting of meeting records | Should Have | • Sortable columns: Serial Number, Client Name, Meeting Date<br>• Ascending/Descending toggle<br>• Default sort: Meeting Date (descending) |

---

### 5.3 Pipeline List Module (Confirmed Only)

#### 5.3.1 Pipeline Management

**User Story:**  
*As a KAM, I want to track pipeline opportunities that have been confirmed by clients so that I can forecast revenue accurately and focus on high-probability deals.*

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **FR-PIPE-01** | System shall allow KAMs to create pipeline records | Must Have | • "Add Pipeline" button accessible<br>• Form includes all required fields (similar to Meeting, see FR-PIPE-02)<br>• Additional fields for confirmation tracking |
| **FR-PIPE-02** | System shall capture the following pipeline data fields | Must Have | **Required Fields:**<br>• Serial Number (auto-generated)<br>• Client Name (text, max 200 chars)<br>• Client Address (text, max 500 chars)<br>• Contact Name (text, max 200 chars)<br>• Contact Number (text, validated)<br>• Capacity Requirement (numeric, ≥ 0)<br>• Capacity MRC (numeric, ≥ 0, currency)<br>• Other Capacity Requirement (numeric, ≥ 0, optional)<br>• Other Capacity MRC (numeric, ≥ 0, optional)<br>• Key Account Manager (dropdown)<br>• **Confirmation Status** (dropdown: Pending, Confirmed)<br>• **Confirmation Date** (date field, required if status = Confirmed)<br>• **Confirmation Notes** (text, max 1000 chars, optional) |
| **FR-PIPE-03** | System shall enforce "Confirmed Only" rule for pipeline visibility | Must Have | • **Pipeline List view displays ONLY records with Confirmation Status = "Confirmed"**<br>• Unconfirmed (Pending) records not shown in main Pipeline List<br>• Optional: Separate "Unconfirmed Pipeline" view for tracking (could have feature) |
| **FR-PIPE-04** | System shall require confirmation details when marking pipeline as confirmed | Must Have | • If Confirmation Status set to "Confirmed", Confirmation Date is mandatory<br>• Confirmation Date cannot be future date<br>• Confirmation Notes field available but optional<br>• Validation prevents saving confirmed pipeline without date |
| **FR-PIPE-05** | System shall allow KAMs to convert meeting records to pipeline | Could Have | • "Convert to Pipeline" action on Meeting records<br>• Pre-fills pipeline form with meeting data<br>• User can edit before saving<br>• Original meeting record retained (not deleted) |
| **FR-PIPE-06** | System shall allow KAMs to edit pipeline records | Must Have | • Edit button available for own records<br>• All fields editable including confirmation status<br>• If changing from Confirmed to Pending, record disappears from Pipeline List |
| **FR-PIPE-07** | System shall allow KAMs to delete pipeline records | Should Have | • Delete with confirmation prompt<br>• Soft delete (marked as deleted, retained in DB) |

**Business Rules:**
- **Only confirmed pipeline counts toward forecasts and dashboard metrics**
- Serial numbers auto-generated (e.g., PIPE-2026-0001)
- Confirmation Date drives which month the pipeline belongs to (for reporting)
- Pipeline records with Pending status stored but not shown in primary Pipeline List

---

#### 5.3.2 Pipeline List Views & Filters

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **FR-PIPE-08** | System shall display list of confirmed pipeline records | Must Have | • Table view with columns: Serial Number, Client Name, Capacity Req, Capacity MRC, Confirmation Date, KAM<br>• Pagination (20 records per page)<br>• KAMs see only own records; Super User sees all |
| **FR-PIPE-09** | System shall provide search and filter for pipeline records | Must Have | • Search: Client Name, Contact Name<br>• Filter by KAM (Super User only)<br>• Filter by Confirmation Date range<br>• Filter by Month |
| **FR-PIPE-10** | System shall calculate and display total pipeline value | Should Have | • Total Capacity Requirement (sum)<br>• Total Capacity MRC (sum)<br>• Displayed at top of Pipeline List or in dashboard |

---

### 5.4 Delivered List Module

#### 5.4.1 Delivered Client Management

**User Story:**  
*As a KAM, I want to record delivered clients with actual revenue and KPI details so that I can track my achievements and report on closed deals.*

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **FR-DEL-01** | System shall allow KAMs to create delivered client records | Must Have | • "Add Delivered" button accessible<br>• Form includes all required fields (see FR-DEL-02) |
| **FR-DEL-02** | System shall capture the following delivered client data fields | Must Have | **Required Fields:**<br>• Serial Number (auto-generated)<br>• Client Name (text, max 200 chars)<br>• Client Address (text, max 500 chars)<br>• Contact Name (text, max 200 chars)<br>• Contact Number (text, validated)<br>• Capacity Requirement (numeric, ≥ 0) - actual delivered<br>• Capacity MRC (numeric, ≥ 0, currency) - actual revenue<br>• Other Capacity Requirement (numeric, ≥ 0, optional)<br>• Other Capacity MRC (numeric, ≥ 0, optional)<br>• Key Account Manager (dropdown)<br>• **KPI Value** (numeric, ≥ 0) - achievement metric<br>• **Delivered Date** (date, required) - when service was delivered<br>• **Delivered Status** (dropdown: Delivered, Partial, Cancelled, optional) |
| **FR-DEL-03** | System shall validate delivered data upon save | Must Have | • Client Name cannot be empty<br>• Delivered Date is mandatory<br>• Delivered Date cannot be future date<br>• KPI Value is mandatory<br>• Numeric validations same as Meeting/Pipeline |
| **FR-DEL-04** | System shall allow KAMs to convert pipeline records to delivered | Could Have | • "Mark as Delivered" action on Pipeline records<br>• Pre-fills delivered form with pipeline data<br>• User confirms actual capacity and revenue<br>• Original pipeline record retained or status updated |
| **FR-DEL-05** | System shall allow KAMs to edit delivered records | Must Have | • Edit button for own records<br>• All fields editable including KPI and delivered date |
| **FR-DEL-06** | System shall allow KAMs to delete delivered records | Should Have | • Delete with confirmation<br>• Soft delete (retained in DB) |

**Business Rules:**
- Delivered Date determines which month the delivery counts toward (critical for KPI tracking)
- KPI Value is a numeric achievement metric (definition may vary by organization - e.g., revenue, capacity, contracts)
- Serial numbers: DEL-2026-0001

---

#### 5.4.2 Delivered List Views & Filters

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **FR-DEL-07** | System shall display list of delivered client records | Must Have | • Table: Serial Number, Client Name, Capacity Req, Capacity MRC, KPI Value, Delivered Date, KAM<br>• Pagination (20 records per page)<br>• KAMs see own; Super User sees all |
| **FR-DEL-08** | System shall provide search and filter for delivered records | Must Have | • Search: Client Name, Contact Name<br>• Filter by KAM<br>• Filter by Delivered Date range<br>• Filter by Month<br>• Filter by Delivered Status |
| **FR-DEL-09** | System shall calculate and display total delivered metrics | Must Have | • Total Capacity Delivered (sum)<br>• Total Revenue (Capacity MRC sum)<br>• Total KPI Achievement (sum or average, configurable)<br>• Displayed at top of list or in dashboard |

---

### 5.5 Task & KPI Assignment Module

#### 5.5.1 KPI Assignment (Super User Only)

**User Story:**  
*As Head of Sales, I want to assign monthly revenue and capacity targets to each KAM so that I can set clear expectations and track performance.*

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **FR-TASK-01** | System shall allow only Super User to create KPI assignments | Must Have | • "Assign KPI" feature accessible only to Super User role<br>• Form includes all required fields (see FR-TASK-02)<br>• Regular users (KAMs) cannot access this feature (UI hidden, API protected) |
| **FR-TASK-02** | System shall capture the following KPI assignment data | Must Have | **Required Fields:**<br>• Serial Number (auto-generated)<br>• **Month** (Month-Year picker, e.g., Feb 2026)<br>• **Key Account Manager** (dropdown, active KAMs)<br>• **Revenue Target** (numeric, ≥ 0, currency format)<br>• **Capacity Target** (numeric, ≥ 0)<br>• **Notes** (text, max 1000 chars, optional) |
| **FR-TASK-03** | System shall validate KPI assignment data | Must Have | • Month and KAM are mandatory<br>• Revenue Target and Capacity Target are mandatory and ≥ 0<br>• Prevent duplicate assignments for same KAM + Month (unique constraint)<br>• Warning if overwriting existing assignment for same KAM + Month |
| **FR-TASK-04** | System shall allow Super User to edit KPI assignments | Must Have | • Edit button available for all KPI assignments<br>• Can update targets and notes<br>• Cannot change Month or KAM (delete and recreate instead) |
| **FR-TASK-05** | System shall allow Super User to delete KPI assignments | Should Have | • Delete with confirmation<br>• Soft delete (retained in DB for audit) |
| **FR-TASK-06** | System shall support bulk KPI assignment | Could Have | • Upload CSV with KAM, Month, Revenue Target, Capacity Target<br>• Validate and import multiple assignments at once<br>• Error handling for invalid rows |

**Business Rules:**
- One KPI assignment per KAM per month
- Month field determines which dashboard period the target applies to
- If no KPI assigned for a month, KAM sees "No targets assigned" in dashboard

---

#### 5.5.2 KPI Viewing (KAM Read-Only)

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **FR-TASK-07** | System shall allow KAMs to view their assigned KPIs | Must Have | • "My KPIs" page accessible to KAMs<br>• List view showing: Month, Revenue Target, Capacity Target, Notes<br>• KAMs see ONLY their own assignments (filtered by user ID)<br>• Read-only (no edit/delete actions) |
| **FR-TASK-08** | System shall display current month KPI assignment prominently | Should Have | • Dashboard widget showing current month targets<br>• Includes: Revenue Target, Capacity Target, Current Achievement, % Progress<br>• Visual indicator if target met or not |

---

### 5.6 Dashboard & Analytics

#### 5.6.1 Dashboard Overview

**User Story:**  
*As a user, I want to see a dashboard with key metrics for the current and previous month so that I can quickly understand sales performance.*

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **FR-DASH-01** | System shall display a Dashboard as the landing page after login | Must Have | • Dashboard is the first page users see<br>• Divided into sections: Summary Cards, Charts, Recent Activity |
| **FR-DASH-02** | System shall show metrics for Current Month and Previous Month | Must Have | • Two columns: "This Month" and "Last Month"<br>• Metrics side-by-side for easy comparison<br>• Month labels clearly displayed (e.g., "February 2026" vs "January 2026") |
| **FR-DASH-03** | Dashboard data shall be role-based | Must Have | • **KAMs**: See only their own data (meetings, pipeline, delivered they created)<br>• **Super User**: See organization-wide data (all KAMs combined)<br>• Optional toggle for Super User to view individual KAM dashboard |

---

#### 5.6.2 Dashboard Metrics

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **FR-DASH-04** | System shall display Meeting metrics | Must Have | • **Total Meetings**: Count of meeting records created in the month<br>• Comparison: This Month vs Last Month<br>• Percentage change indicator |
| **FR-DASH-05** | System shall display Pipeline metrics | Must Have | • **Total Confirmed Pipeline**: Count of confirmed pipeline records<br>• **Total Pipeline Value (Capacity MRC)**: Sum of capacity MRC for confirmed records<br>• Filtered by Confirmation Date within the month<br>• This Month vs Last Month comparison |
| **FR-DASH-06** | System shall display Delivered metrics | Must Have | • **Total Delivered Clients**: Count of delivered records<br>• **Total Revenue (Capacity MRC)**: Sum of capacity MRC for delivered records<br>• **Total Capacity Delivered**: Sum of capacity requirement<br>• **Total KPI Achievement**: Sum of KPI values<br>• Filtered by Delivered Date within the month<br>• This Month vs Last Month comparison |
| **FR-DASH-07** | System shall display KPI Progress (for KAMs with assignments) | Must Have | • **Revenue Target vs Achieved**: Progress bar showing % of target met<br>• **Capacity Target vs Achieved**: Progress bar showing % of target met<br>• Calculated as: (Sum of Delivered Capacity MRC / Revenue Target) × 100<br>• Green if ≥ 100%, Yellow if 70-99%, Red if < 70% |
| **FR-DASH-08** | System shall provide visual charts for trends | Should Have | • Line chart: Meetings over last 6 months<br>• Bar chart: Pipeline vs Delivered (last 6 months)<br>• Pie chart: Delivered by KAM (Super User view only) |

**Business Rules:**
- "Current Month" = month of current system date
- "Previous Month" = month immediately before current month
- Metrics calculated in real-time (no batch processing delay)
- Dashboard should load in < 3 seconds

---

#### 5.6.3 Recent Activity

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **FR-DASH-09** | System shall display recent activity feed on dashboard | Should Have | • List of last 10 actions:<br>  - Meeting added<br>  - Pipeline confirmed<br>  - Client delivered<br>  - KPI assigned (Super User)<br>• Each entry shows: Action type, User, Timestamp, Link to record |

---

### 5.7 Reporting & Export

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **FR-RPT-01** | System shall allow users to export Meeting list to Excel/CSV | Should Have | • "Export" button on Meeting List page<br>• Exports currently filtered/searched data<br>• Includes all columns<br>• File named: Meetings_YYYY-MM-DD.xlsx |
| **FR-RPT-02** | System shall allow users to export Pipeline list to Excel/CSV | Should Have | • Same as FR-RPT-01 for Pipeline<br>• File named: Pipeline_YYYY-MM-DD.xlsx |
| **FR-RPT-03** | System shall allow users to export Delivered list to Excel/CSV | Should Have | • Same as FR-RPT-01 for Delivered<br>• File named: Delivered_YYYY-MM-DD.xlsx |
| **FR-RPT-04** | System shall allow Super User to export organization-wide summary | Could Have | • "Export Summary Report" from dashboard<br>• Includes: All KAMs, Monthly targets, Achievements, Pipeline, Delivered<br>• File named: SalesSummary_YYYY-MM.xlsx |

---

## 6. Non-Functional Requirements

### 6.1 Performance Requirements

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| **NFR-PERF-01** | System shall support at least 100 concurrent users | 100 users | Load testing |
| **NFR-PERF-02** | Page load time shall not exceed 3 seconds for standard pages | ≤ 3 sec | Performance monitoring |
| **NFR-PERF-03** | Dashboard shall load within 3 seconds | ≤ 3 sec | Performance testing |
| **NFR-PERF-04** | Search results shall return within 1 second | ≤ 1 sec | Query optimization |
| **NFR-PERF-05** | System shall handle lists with up to 10,000 records per module without performance degradation | 10,000 records | Stress testing with pagination |
| **NFR-PERF-06** | API response time shall not exceed 500ms for CRUD operations | ≤ 500ms | API performance monitoring |

**Scalability:**
- System architecture should support horizontal scaling (add more server instances)
- Database should support indexing on frequently queried fields (email, KAM ID, dates)

---

### 6.2 Security Requirements

| ID | Requirement | Priority | Implementation |
|----|-------------|----------|----------------|
| **NFR-SEC-01** | System shall store passwords using industry-standard hashing (bcrypt/Argon2) | Must Have | • Passwords hashed with salt before storage<br>• Plain-text passwords never stored or logged |
| **NFR-SEC-02** | System shall enforce role-based access control (RBAC) at API level | Must Have | • All API endpoints validate user role<br>• Unauthorized access returns 403 Forbidden<br>• Frontend UI hides unavailable features |
| **NFR-SEC-03** | System shall use HTTPS for all communications | Must Have | • SSL/TLS certificate installed<br>• HTTP requests redirected to HTTPS<br>• Secure cookies with Secure and HttpOnly flags |
| **NFR-SEC-04** | System shall implement JWT-based authentication | Must Have | • JWT tokens with expiration (1 hour for access, 7 days for refresh)<br>• Tokens signed with secret key<br>• Token includes user ID and role claims |
| **NFR-SEC-05** | System shall protect against SQL injection (if using SQL DB) | Must Have | • Use parameterized queries or ORM<br>• Input sanitization |
| **NFR-SEC-06** | System shall protect against XSS (Cross-Site Scripting) | Must Have | • Sanitize user input before rendering<br>• Content Security Policy (CSP) headers |
| **NFR-SEC-07** | System shall protect against CSRF (Cross-Site Request Forgery) | Must Have | • CSRF tokens for state-changing operations<br>• SameSite cookie attribute |
| **NFR-SEC-08** | System shall implement rate limiting to prevent brute-force attacks | Should Have | • Login attempts limited to 5 per minute per IP<br>• Account lockout after 5 failed attempts (15 min cooldown) |
| **NFR-SEC-09** | System shall log all authentication and authorization events | Must Have | • Log: Successful logins, failed logins, logouts, permission denials<br>• Logs include: User ID, IP address, Timestamp, Action |
| **NFR-SEC-10** | System shall implement session timeout for inactive users | Must Have | • Session expires after 30 minutes of inactivity<br>• User prompted to re-login |

---

### 6.3 Reliability & Availability

| ID | Requirement | Target | Measurement |
|----|-------------|--------|-------------|
| **NFR-REL-01** | System shall have 99.5% uptime (monthly) | 99.5% | Uptime monitoring tools |
| **NFR-REL-02** | System shall perform daily automated backups | Daily | Backup logs |
| **NFR-REL-03** | System shall support point-in-time recovery within 4 hours | ≤ 4 hours | Disaster recovery testing |
| **NFR-REL-04** | System shall gracefully handle errors without data loss | N/A | Error handling testing |
| **NFR-REL-05** | System shall log all critical errors for troubleshooting | N/A | Centralized logging (e.g., ELK stack) |

---

### 6.4 Usability Requirements

| ID | Requirement | Priority | Acceptance Criteria |
|----|-------------|----------|-------------------|
| **NFR-USE-01** | System shall be accessible via modern web browsers | Must Have | • Supports latest 2 versions of Chrome, Firefox, Safari, Edge<br>• Responsive design for desktop (1920×1080 and 1366×768) |
| **NFR-USE-02** | System UI shall be intuitive requiring minimal training | Must Have | • New users can complete basic tasks (add meeting, view dashboard) within 15 minutes<br>• Consistent navigation and layout |
| **NFR-USE-03** | System shall provide inline help and tooltips for complex fields | Should Have | • Question mark icons with hover tooltips<br>• Help text for "Confirmed Pipeline", "KPI Value", etc. |
| **NFR-USE-04** | System shall provide clear error messages and validation feedback | Must Have | • Field-level validation with red borders and error text<br>• Success messages for saved actions<br>• No technical jargon in user-facing messages |
| **NFR-USE-05** | System shall be responsive for tablet devices (768px and above) | Should Have | • Layout adapts to tablet screens<br>• Touch-friendly buttons and forms |

---

### 6.5 Maintainability Requirements

| ID | Requirement | Priority | Implementation |
|----|-------------|----------|----------------|
| **NFR-MAIN-01** | Code shall follow industry best practices and coding standards | Must Have | • Linting (ESLint for JS, Pylint for Python)<br>• Code reviews before merging |
| **NFR-MAIN-02** | System shall use modular architecture for easy updates | Must Have | • Separation of concerns (frontend, backend, database)<br>• RESTful API design |
| **NFR-MAIN-03** | System shall include comprehensive API documentation | Should Have | • Swagger/OpenAPI documentation<br>• Covers all endpoints, parameters, responses |
| **NFR-MAIN-04** | System shall include developer setup documentation | Must Have | • README with setup instructions<br>• Environment configuration guide |

---

### 6.6 Compatibility Requirements

| ID | Requirement | Priority | Details |
|----|-------------|----------|---------|
| **NFR-COMP-01** | System shall support import of data from CSV files | Could Have | • Import meetings, pipeline, delivered from CSV templates<br>• Data validation on import |
| **NFR-COMP-02** | System shall use standard date formats (ISO 8601) | Must Have | • YYYY-MM-DD format<br>• Time zones handled consistently |

---

### 6.7 Auditability Requirements

| ID | Requirement | Priority | Implementation |
|----|-------------|----------|----------------|
| **NFR-AUD-01** | System shall track created_by and updated_by for all records | Must Have | • Every record includes: created_at, created_by, updated_at, updated_by<br>• User ID stored, not just name (for historical accuracy) |
| **NFR-AUD-02** | System shall maintain audit logs for critical actions | Should Have | • Log: User approvals, KPI assignments, record deletions<br>• Logs immutable and viewable by Super User |

---

## 7. Data Model & Architecture

### 7.1 Entity Relationship Diagram (Logical)

```
┌─────────────────────┐
│       User          │
├─────────────────────┤
│ user_id (PK)        │
│ name                │
│ email (unique)      │
│ mobile              │
│ password_hash       │
│ role (enum)         │◄──────┐
│ status (enum)       │       │
│ created_at          │       │
│ updated_at          │       │
│ last_login_at       │       │
└─────────────────────┘       │
                               │
                               │ (created_by)
       ┌───────────────────────┼────────────────────────────────┐
       │                       │                                │
       │                       │                                │
┌──────▼──────────────┐ ┌──────▼──────────────┐ ┌──────▼──────────────┐
│    Meeting          │ │    Pipeline         │ │    Delivered        │
├─────────────────────┤ ├─────────────────────┤ ├─────────────────────┤
│ meeting_id (PK)     │ │ pipeline_id (PK)    │ │ delivered_id (PK)   │
│ serial_number       │ │ serial_number       │ │ serial_number       │
│ client_name         │ │ client_name         │ │ client_name         │
│ client_address      │ │ client_address      │ │ client_address      │
│ contact_name        │ │ contact_name        │ │ contact_name        │
│ contact_number      │ │ contact_number      │ │ contact_number      │
│ capacity_req        │ │ capacity_req        │ │ capacity_req        │
│ capacity_mrc        │ │ capacity_mrc        │ │ capacity_mrc        │
│ other_cap_req       │ │ other_cap_req       │ │ other_cap_req       │
│ other_cap_mrc       │ │ other_cap_mrc       │ │ other_cap_mrc       │
│ kam_user_id (FK)    │ │ kam_user_id (FK)    │ │ kam_user_id (FK)    │
│ meeting_minutes     │ │ confirmation_status │ │ kpi_value           │
│ created_at          │ │ confirmation_date   │ │ delivered_date      │
│ created_by (FK)     │ │ confirmation_notes  │ │ delivered_status    │
│ updated_at          │ │ created_at          │ │ created_at          │
│ updated_by (FK)     │ │ created_by (FK)     │ │ created_by (FK)     │
│ is_deleted          │ │ updated_at          │ │ updated_at          │
└─────────────────────┘ │ updated_by (FK)     │ │ updated_by (FK)     │
                        │ is_deleted          │ │ is_deleted          │
                        └─────────────────────┘ └─────────────────────┘

┌──────────────────────────┐
│ TaskKPIAssignment        │
├──────────────────────────┤
│ assignment_id (PK)       │
│ serial_number            │
│ month (YYYY-MM)          │
│ kam_user_id (FK) ◄───────┼─────┐
│ revenue_target           │     │
│ capacity_target          │     │
│ notes                    │     │
│ created_by (FK)          │     │ (unique: kam_user_id + month)
│ created_at               │     │
│ updated_at               │     │
│ updated_by (FK)          │     │
│ is_deleted               │     │
└──────────────────────────┘     │
                                 │
                                 └─────────────────┐
                                                   │
                          ┌────────────────────────┘
                          │
                    ┌─────▼──────────────┐
                    │  AuditLog          │
                    ├────────────────────┤
                    │ log_id (PK)        │
                    │ user_id (FK)       │
                    │ action             │
                    │ entity_type        │
                    │ entity_id          │
                    │ timestamp          │
                    │ ip_address         │
                    │ details (JSON)     │
                    └────────────────────┘
```

---

### 7.2 Database Schema (MongoDB Collections)

**Collection: users**
```json
{
  "_id": "ObjectId",
  "user_id": "UUID (unique)",
  "name": "String",
  "email": "String (unique, lowercase)",
  "mobile": "String (optional)",
  "password_hash": "String",
  "role": "Enum: [SuperUser, KAM]",
  "status": "Enum: [Pending, Active, Rejected, Disabled]",
  "created_at": "ISODate",
  "updated_at": "ISODate",
  "last_login_at": "ISODate"
}
```

**Collection: meetings**
```json
{
  "_id": "ObjectId",
  "meeting_id": "UUID",
  "serial_number": "String (e.g., MTG-2026-0001)",
  "client_name": "String",
  "client_address": "String",
  "contact_name": "String",
  "contact_number": "String",
  "capacity_req": "Decimal",
  "capacity_mrc": "Decimal",
  "other_cap_req": "Decimal",
  "other_cap_mrc": "Decimal",
  "kam_user_id": "UUID (ref: users.user_id)",
  "meeting_minutes": "String",
  "created_at": "ISODate",
  "created_by": "UUID",
  "updated_at": "ISODate",
  "updated_by": "UUID",
  "is_deleted": "Boolean (default: false)"
}
```

**Collection: pipelines**
```json
{
  "_id": "ObjectId",
  "pipeline_id": "UUID",
  "serial_number": "String (e.g., PIPE-2026-0001)",
  "client_name": "String",
  "client_address": "String",
  "contact_name": "String",
  "contact_number": "String",
  "capacity_req": "Decimal",
  "capacity_mrc": "Decimal",
  "other_cap_req": "Decimal",
  "other_cap_mrc": "Decimal",
  "kam_user_id": "UUID",
  "confirmation_status": "Enum: [Pending, Confirmed]",
  "confirmation_date": "ISODate (nullable)",
  "confirmation_notes": "String",
  "created_at": "ISODate",
  "created_by": "UUID",
  "updated_at": "ISODate",
  "updated_by": "UUID",
  "is_deleted": "Boolean"
}
```

**Collection: delivered**
```json
{
  "_id": "ObjectId",
  "delivered_id": "UUID",
  "serial_number": "String (e.g., DEL-2026-0001)",
  "client_name": "String",
  "client_address": "String",
  "contact_name": "String",
  "contact_number": "String",
  "capacity_req": "Decimal",
  "capacity_mrc": "Decimal",
  "other_cap_req": "Decimal",
  "other_cap_mrc": "Decimal",
  "kam_user_id": "UUID",
  "kpi_value": "Decimal",
  "delivered_date": "ISODate",
  "delivered_status": "Enum: [Delivered, Partial, Cancelled]",
  "created_at": "ISODate",
  "created_by": "UUID",
  "updated_at": "ISODate",
  "updated_by": "UUID",
  "is_deleted": "Boolean"
}
```

**Collection: kpi_assignments**
```json
{
  "_id": "ObjectId",
  "assignment_id": "UUID",
  "serial_number": "String (e.g., KPI-2026-0001)",
  "month": "String (YYYY-MM)",
  "kam_user_id": "UUID",
  "revenue_target": "Decimal",
  "capacity_target": "Decimal",
  "notes": "String",
  "created_by": "UUID",
  "created_at": "ISODate",
  "updated_at": "ISODate",
  "updated_by": "UUID",
  "is_deleted": "Boolean"
}
```
**Unique Index:** `{ kam_user_id: 1, month: 1 }` (to prevent duplicate assignments)

**Collection: audit_logs**
```json
{
  "_id": "ObjectId",
  "log_id": "UUID",
  "user_id": "UUID",
  "action": "String (e.g., 'LOGIN', 'APPROVE_USER', 'CREATE_MEETING')",
  "entity_type": "String (e.g., 'User', 'Meeting', 'Pipeline')",
  "entity_id": "UUID (nullable)",
  "timestamp": "ISODate",
  "ip_address": "String",
  "details": "Object (JSON with additional context)"
}
```

---

### 7.3 Indexes (for Performance)

| Collection | Index Fields | Purpose |
|------------|-------------|---------|
| users | email (unique) | Fast login lookup |
| users | status, role | Filter by status and role |
| meetings | kam_user_id, created_at | Filter by KAM and date |
| meetings | client_name (text index) | Search by client name |
| pipelines | kam_user_id, confirmation_status, confirmation_date | Filter confirmed pipeline |
| pipelines | client_name (text index) | Search |
| delivered | kam_user_id, delivered_date | Filter by KAM and date |
| delivered | client_name (text index) | Search |
| kpi_assignments | kam_user_id, month (unique composite) | Prevent duplicates, fast lookup |

---

### 7.4 Technology Stack

**Frontend:**
- **Framework**: React 18+
- **State Management**: React Context API or Redux Toolkit
- **Routing**: React Router v6
- **UI Library**: Tailwind CSS
- **Forms**: React Hook Form
- **Charts**: Recharts or Chart.js
- **HTTP Client**: Axios
- **Date Handling**: date-fns or Day.js

**Backend:**
- **Framework**: Python FastAPI
- **Authentication**: JWT (python-jose)
- **Password Hashing**: bcrypt
- **Validation**: Pydantic models
- **Database Driver**: Motor (async MongoDB driver)
- **CORS**: FastAPI CORS middleware

**Database:**
- **Primary**: MongoDB 6.0+
- **Backup**: Automated daily backups to cloud storage

**DevOps:**
- **Containerization**: Docker
- **Orchestration**: Docker Compose (development), Kubernetes (production)
- **CI/CD**: GitHub Actions or GitLab CI
- **Hosting**: AWS (EC2, RDS, S3) or Azure or Google Cloud
- **Monitoring**: Prometheus + Grafana, or cloud-native monitoring

---

## 8. User Interface Requirements

### 8.1 General UI Guidelines

| ID | Guideline | Details |
|----|-----------|---------|
| **UI-01** | Consistent Navigation | • Top navigation bar with logo, Dashboard, Meetings, Pipeline, Delivered, Tasks/KPIs, User Profile<br>• Active page highlighted<br>• Logout button in user profile dropdown |
| **UI-02** | Responsive Layout | • Desktop-first (1920×1080, 1366×768)<br>• Tablet support (768px and above)<br>• Mobile responsive (optional for Phase 1) |
| **UI-03** | Color Scheme | • Primary: Blue (#3B82F6) for buttons, links<br>• Success: Green (#10B981) for confirmations, positive metrics<br>• Warning: Yellow (#F59E0B) for alerts<br>• Danger: Red (#EF4444) for errors, delete actions<br>• Neutral: Gray shades for backgrounds and text |
| **UI-04** | Typography | • Font: Inter, Roboto, or system fonts<br>• Headings: Bold, larger sizes (H1: 32px, H2: 24px, H3: 20px)<br>• Body: 16px (readable) |
| **UI-05** | Loading States | • Spinner or skeleton screens for data loading<br>• "Loading..." text or visual indicator<br>• Disabled buttons during form submission |
| **UI-06** | Error Handling | • Field-level validation (red border, inline error text below field)<br>• Toast notifications for success/error messages (top-right corner)<br>• 404 page for invalid routes |

---

### 8.2 Page-Level UI Requirements

#### 8.2.1 Login Page

**Layout:**
- Centered card with logo, title "FGL Salesforce Management"
- Form fields: Email, Password
- Actions: Login button, "Forgot Password?" link, "Register" link

**Wireframe (Conceptual):**
```
┌─────────────────────────────────────────┐
│              [FGL Logo]                 │
│     FGL Salesforce Management           │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ Email:    [________________]      │ │
│  │ Password: [________________]      │ │
│  │ [ ] Remember Me                   │ │
│  │                                   │ │
│  │       [Login Button]              │ │
│  │                                   │ │
│  │  Forgot Password? | Register      │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

---

#### 8.2.2 Registration Page

**Layout:**
- Form fields: Full Name, Email, Mobile Number, Password, Confirm Password
- Actions: Register button, "Already have an account? Login" link

---

#### 8.2.3 Dashboard Page

**Layout:**
- Top: Welcome message ("Welcome, [User Name]")
- Summary Cards (Grid: 2×2 or 3×2):
  - **This Month**: Meetings, Confirmed Pipeline, Delivered, Revenue
  - **Last Month**: Same metrics for comparison
- KPI Progress Section (for KAMs with assignments):
  - Revenue Target vs Achieved (progress bar)
  - Capacity Target vs Achieved (progress bar)
- Charts Section:
  - Line chart: Meetings over last 6 months
  - Bar chart: Pipeline vs Delivered
- Recent Activity Feed (sidebar or bottom section)

**Wireframe (Conceptual):**
```
┌──────────────────────────────────────────────────────────┐
│  [Dashboard]                           [User: John] [↓]  │
├──────────────────────────────────────────────────────────┤
│  Welcome, John Doe                                       │
│                                                          │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │ This Month      │  │ Last Month      │               │
│  │ Meetings: 25    │  │ Meetings: 20    │               │
│  │ Pipeline: 10    │  │ Pipeline: 8     │               │
│  │ Delivered: 5    │  │ Delivered: 4    │               │
│  │ Revenue: $50K   │  │ Revenue: $40K   │               │
│  └─────────────────┘  └─────────────────┘               │
│                                                          │
│  KPI Progress (February 2026):                          │
│  Revenue Target: $100K  ████████░░ 80% ($80K)           │
│  Capacity Target: 500   ██████░░░░ 60% (300)            │
│                                                          │
│  [Line Chart: Meetings Trend]                           │
│  [Bar Chart: Pipeline vs Delivered]                     │
│                                                          │
│  Recent Activity:                                        │
│  • Meeting added: Acme Corp (2 mins ago)                │
│  • Pipeline confirmed: XYZ Ltd (1 hour ago)             │
│  • Client delivered: ABC Inc (3 hours ago)              │
└──────────────────────────────────────────────────────────┘
```

---

#### 8.2.4 Meeting List Page

**Layout:**
- Top: Page title "Meeting Records", "Add Meeting" button (primary)
- Search bar (search by client name)
- Filter dropdowns: KAM (Super User only), Month
- Table with columns:
  - Serial Number
  - Client Name
  - Contact Name
  - Meeting Date
  - KAM (name)
  - Actions (View, Edit, Delete icons)
- Pagination controls at bottom

**Wireframe (Conceptual):**
```
┌──────────────────────────────────────────────────────────┐
│  Meeting Records                        [Add Meeting]    │
├──────────────────────────────────────────────────────────┤
│  Search: [_________________]  KAM: [____]  Month: [____] │
│                                                          │
│  ┌────┬──────────────┬───────────┬────────┬─────┬──────┐│
│  │ S# │ Client Name  │ Contact   │ Date   │ KAM │ Act. ││
│  ├────┼──────────────┼───────────┼────────┼─────┼──────┤│
│  │ 1  │ Acme Corp    │ John Doe  │ Feb 1  │ Raj │ 👁 ✏ │││
│  │ 2  │ XYZ Ltd      │ Jane Smith│ Feb 2  │ Raj │ 👁 ✏ │││
│  └────┴──────────────┴───────────┴────────┴─────┴──────┘│
│                                                          │
│  [Prev] Page 1 of 5 [Next]                              │
└──────────────────────────────────────────────────────────┘
```

---

#### 8.2.5 Add/Edit Meeting Form

**Layout:**
- Modal or dedicated page with form
- Fields arranged in 2 columns (desktop) or single column (tablet/mobile):
  - Client Name, Client Address
  - Contact Name, Contact Number
  - Capacity Requirement, Capacity MRC
  - Other Capacity Requirement, Other Capacity MRC
  - Key Account Manager (dropdown, pre-filled for KAMs)
  - Meeting Minutes (large text area)
- Actions: Save, Cancel

---

#### 8.2.6 Pipeline List Page

**Similar to Meeting List, with differences:**
- Columns: Serial Number, Client Name, Capacity Req, Capacity MRC, Confirmation Date, KAM, Actions
- Only shows records with Confirmation Status = "Confirmed"
- "Add Pipeline" button
- Total Pipeline Value displayed at top (sum of Capacity MRC)

---

#### 8.2.7 Delivered List Page

**Similar to Meeting List, with differences:**
- Columns: Serial Number, Client Name, Capacity Req, Capacity MRC, KPI Value, Delivered Date, KAM, Actions
- "Add Delivered" button
- Total Revenue and Total KPI displayed at top

---

#### 8.2.8 Task & KPI Assignment Page (Super User Only)

**Layout:**
- Top: Page title "Task & KPI Assignments", "Assign KPI" button
- List/Table view:
  - Columns: Month, KAM, Revenue Target, Capacity Target, Actions (Edit, Delete)
- Filter by Month

---

#### 8.2.9 User Management Page (Super User Only)

**Layout:**
- Tabs: "Pending Approvals", "Active Users", "Rejected Users"
- Pending Approvals tab:
  - List of pending users with Name, Email, Registration Date
  - Actions: Approve (green button), Reject (red button)
- Active Users tab:
  - List with Name, Email, Role, Last Login
  - Actions: Deactivate

---

### 8.3 UI Component Library (Recommended)

- **Buttons**: Primary (blue), Secondary (gray outline), Danger (red), Disabled (gray)
- **Forms**: Input fields with labels, validation messages, placeholders
- **Modals**: For confirmations (delete, logout), forms (add/edit records)
- **Tables**: Sortable columns, pagination, row hover effects
- **Cards**: For dashboard summary metrics
- **Toast Notifications**: Top-right corner, auto-dismiss after 5 seconds
- **Progress Bars**: For KPI tracking (visual, with percentage)

---

## 9. Security & Compliance

### 9.1 Authentication Flow

**Registration → Approval → Login Flow:**

```
1. User fills registration form → POST /api/auth/register
2. Backend creates user with status = "Pending"
3. User sees "Registration successful, awaiting approval" message

4. Super User logs in → navigates to User Management
5. Super User clicks "Approve" → POST /api/users/approve/{user_id}
6. Backend updates user status to "Active"

7. User logs in → POST /api/auth/login with email + password
8. Backend validates credentials, checks status = "Active"
9. Backend generates JWT token with claims: { user_id, email, role, exp }
10. Frontend stores token (localStorage or httpOnly cookie)
11. Frontend includes token in Authorization header for all API requests: "Bearer <token>"

12. Backend middleware validates token on every protected API call
13. If token expired or invalid → 401 Unauthorized → Frontend redirects to login
```

---

### 9.2 Password Policy

- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 digit (0-9)
- Optional: At least 1 special character (!@#$%^&*)

---

### 9.3 Data Privacy

- Personal data (email, mobile, names) stored securely in database
- Access logs maintained for audit purposes
- No sharing of user data with third parties (internal use only)
- Data retention policy: Records retained indefinitely unless explicitly deleted (soft delete)

---

### 9.4 Compliance Considerations

- **GDPR (if applicable)**: Right to access, rectify, delete personal data
- **Data Localization**: If required by jurisdiction, ensure database hosted in compliant region
- **Audit Trails**: Maintain logs for compliance audits

---

## 10. Integration Requirements

**Phase 1 Scope:** Standalone system, no external integrations

**Future Phases (Out of Scope for Initial Release):**

| Integration | Purpose | Priority |
|-------------|---------|----------|
| **Email Service (SendGrid, AWS SES)** | Password reset emails, notifications | High |
| **ERP System** | Sync client master data | Medium |
| **Billing System** | Validate delivered revenue | Medium |
| **Calendar Integration (Google, Outlook)** | Schedule meetings | Low |
| **Notification Service (Slack, MS Teams)** | Real-time alerts for KPI assignments, approvals | Low |

---

## 11. Reporting & Analytics

### 11.1 Standard Reports

| Report | Description | Audience | Export Format |
|--------|-------------|----------|---------------|
| **Meeting Report** | List of all meetings with filters | All users | Excel, CSV |
| **Pipeline Report** | Confirmed pipeline with values | All users | Excel, CSV |
| **Delivered Report** | Delivered clients with KPIs | All users | Excel, CSV |
| **Monthly Summary** | KPI targets vs achieved for all KAMs | Super User | Excel |
| **KAM Performance** | Individual KAM performance over time | Super User | Excel, PDF (future) |

---

### 11.2 Dashboard Analytics

- **Trend Analysis**: Month-over-month growth in meetings, pipeline, delivered
- **KPI Achievement Rate**: Percentage of KAMs meeting their targets
- **Conversion Metrics**: Meeting → Pipeline → Delivered conversion rates (future enhancement)

---

## 12. Deployment & Infrastructure

### 12.1 Deployment Architecture

**Option 1: Cloud Deployment (Recommended)**

```
                        ┌──────────────┐
                        │  Users       │
                        │ (Browsers)   │
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │ Load Balancer│
                        │ (AWS ALB)    │
                        └──────┬───────┘
                               │
                ┌──────────────┴──────────────┐
                │                             │
         ┌──────▼──────┐            ┌────────▼────────┐
         │  Frontend   │            │  Backend        │
         │  (React)    │            │  (FastAPI)      │
         │  EC2/S3+CF  │            │  EC2/ECS        │
         └─────────────┘            └────────┬────────┘
                                             │
                                    ┌────────▼────────┐
                                    │  Database       │
                                    │  (MongoDB Atlas)│
                                    │  or RDS         │
                                    └─────────────────┘
```

**Components:**
- **Frontend**: Static files hosted on AWS S3 + CloudFront (CDN) OR deployed to EC2/container
- **Backend**: FastAPI deployed on AWS EC2, ECS (Docker containers), or AWS Lambda (serverless)
- **Database**: MongoDB Atlas (managed) or self-hosted MongoDB on EC2
- **Load Balancer**: AWS Application Load Balancer for high availability
- **Storage**: AWS S3 for backups and exported reports

---

### 12.2 Environment Setup

| Environment | Purpose | URL | Database |
|-------------|---------|-----|----------|
| **Development** | Local development | http://localhost:3000 | Local MongoDB |
| **Staging** | Pre-production testing | https://staging.fgl-sales.com | Staging DB (cloud) |
| **Production** | Live system | https://app.fgl-sales.com | Production DB (cloud) |

---

### 12.3 Infrastructure Requirements

| Resource | Specification | Justification |
|----------|---------------|---------------|
| **Frontend Server** | 2 vCPU, 4 GB RAM | React build served via Nginx or S3 |
| **Backend Server** | 4 vCPU, 8 GB RAM | FastAPI with async support for 100 concurrent users |
| **Database** | 4 vCPU, 16 GB RAM, 100 GB SSD | MongoDB with indexes for fast queries |
| **Backup Storage** | 50 GB (expandable) | Daily backups |

---

### 12.4 Continuous Integration / Continuous Deployment (CI/CD)

**CI/CD Pipeline (GitHub Actions Example):**

1. **Code Commit** → Developer pushes to Git repository
2. **Automated Tests** → Run unit tests, integration tests
3. **Build** → Build frontend (React) and backend (Docker image)
4. **Deploy to Staging** → Automatically deploy to staging environment
5. **Manual QA** → QA team tests on staging
6. **Deploy to Production** → Manual approval → Deploy to production

---

## 13. Testing Strategy

### 13.1 Testing Phases

| Phase | Type | Scope | Responsibility |
|-------|------|-------|----------------|
| **Unit Testing** | Automated | Individual functions/components | Developers |
| **Integration Testing** | Automated | API endpoints, database interactions | Developers |
| **System Testing** | Manual + Automated | End-to-end workflows | QA Team |
| **User Acceptance Testing (UAT)** | Manual | Business scenarios with real users | Sales Operations + KAMs |
| **Performance Testing** | Automated | Load testing with 100+ concurrent users | QA Team |
| **Security Testing** | Automated + Manual | Vulnerability scanning, penetration testing | Security Team |

---

### 13.2 Test Cases (High-Level Examples)

**Authentication:**
- TC-AUTH-01: User can register with valid details → Success
- TC-AUTH-02: User cannot register with existing email → Error
- TC-AUTH-03: Pending user cannot login → Error
- TC-AUTH-04: Super User can approve pending user → User becomes active
- TC-AUTH-05: Approved user can login with correct credentials → Success
- TC-AUTH-06: User session times out after 30 minutes → Redirect to login

**Meeting Management:**
- TC-MTG-01: KAM can create meeting record with all required fields → Success
- TC-MTG-02: Client Name field cannot be empty → Validation error
- TC-MTG-03: Capacity MRC must be numeric and ≥ 0 → Validation error if invalid
- TC-MTG-04: KAM can edit their own meeting → Success
- TC-MTG-05: KAM cannot edit another KAM's meeting → Error (if policy enforced)
- TC-MTG-06: Super User can view all meetings → Success

**Pipeline Management:**
- TC-PIPE-01: Unconfirmed pipeline record not visible in Pipeline List → Success
- TC-PIPE-02: Pipeline marked as "Confirmed" with date appears in list → Success
- TC-PIPE-03: Cannot mark as confirmed without confirmation date → Validation error

**Dashboard:**
- TC-DASH-01: Dashboard displays current month and previous month metrics → Success
- TC-DASH-02: KAM sees only their own data → Success
- TC-DASH-03: Super User sees organization-wide data → Success
- TC-DASH-04: KPI progress bar shows correct percentage → Success

**Performance:**
- TC-PERF-01: Dashboard loads in < 3 seconds with 1000 records → Success
- TC-PERF-02: System handles 100 concurrent users without errors → Success

---

### 13.3 Acceptance Criteria Validation

Each functional requirement (FR-XXX-XX) will be validated against its acceptance criteria during UAT. A checklist will be maintained with Pass/Fail status for each requirement.

---

## 14. Risk Assessment

### 14.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Database Performance Degradation** | High | Medium | • Implement proper indexing<br>• Optimize queries<br>• Monitor performance with tools<br>• Plan for database scaling |
| **Security Vulnerabilities** | High | Medium | • Follow security best practices<br>• Conduct security testing<br>• Regular dependency updates<br>• Implement rate limiting and WAF |
| **Integration Complexity (Future)** | Medium | Low (Phase 1) | • Design modular API architecture<br>• Document API contracts<br>• Plan integrations in future phases |
| **Data Loss** | High | Low | • Automated daily backups<br>• Test disaster recovery procedures<br>• Implement audit logs |
| **Session Management Issues** | Medium | Medium | • Use proven JWT libraries<br>• Implement secure token storage<br>• Test timeout functionality |

---

### 14.2 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **User Adoption Resistance** | High | Medium | • Involve users early in design<br>• Provide comprehensive training<br>• Ensure intuitive UI<br>• Offer ongoing support |
| **Data Quality Issues** | Medium | Medium | • Enforce validation rules<br>• Provide data entry guidelines<br>• Conduct data audits |
| **Scope Creep** | Medium | High | • Clearly define Phase 1 scope<br>• Maintain prioritized backlog for future phases<br>• Formal change request process |
| **Timeline Delays** | Medium | Medium | • Realistic project planning<br>• Agile sprints with regular reviews<br>• Buffer time for testing and fixes |

---

### 14.3 Operational Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Insufficient Training** | Medium | Medium | • Create user manuals and video tutorials<br>• Conduct live training sessions<br>• Designate super users for peer support |
| **Lack of Support Resources** | Medium | Low | • Document common issues and solutions<br>• Establish helpdesk or support channel<br>• Monitor user feedback |

---

## 15. Success Metrics

### 15.1 System Performance Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **System Uptime** | 99.5% monthly | Monitoring tools (Pingdom, UptimeRobot) |
| **Page Load Time** | < 3 seconds | Performance monitoring (Lighthouse, Google Analytics) |
| **API Response Time** | < 500ms | Backend logging, APM tools |
| **Concurrent Users Supported** | 100+ | Load testing (JMeter, Locust) |

---

### 15.2 Business Success Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **User Adoption Rate** | 90% of KAMs actively using within 1 month | User login analytics |
| **Data Accuracy** | 95% reduction in data discrepancies | Data audits, user feedback |
| **Time Savings** | 10+ hours/week saved per user | User surveys, time tracking |
| **Pipeline Visibility** | 100% of confirmed pipeline tracked | Data completeness reports |
| **KPI Achievement** | 80% of KAMs meeting targets (organizational goal) | Monthly performance reports |

---

### 15.3 User Satisfaction Metrics

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| **User Satisfaction Score** | 8/10 or higher | Post-launch survey |
| **Net Promoter Score (NPS)** | 50+ | Survey: "How likely are you to recommend this system?" |
| **Support Ticket Volume** | < 5 tickets/week after initial launch | Helpdesk tracking |

---

## 16. Glossary

| Term | Definition |
|------|------------|
| **KAM** | Key Account Manager - Sales personnel responsible for managing client accounts and generating revenue |
| **Super User** | Head of Sales or administrator with full system access and user management capabilities |
| **MRC** | Monthly Recurring Charge - Recurring revenue from clients on a monthly basis |
| **Capacity Requirement** | Numerical value representing service capacity (e.g., bandwidth in Mbps/Gbps) |
| **Confirmed Pipeline** | Sales opportunities that have been validated and confirmed by clients (not speculative) |
| **Delivered** | Clients for whom services have been successfully delivered and are generating revenue |
| **KPI** | Key Performance Indicator - Measurable value demonstrating effectiveness (e.g., revenue, capacity delivered) |
| **RBAC** | Role-Based Access Control - Security approach restricting system access based on user roles |
| **JWT** | JSON Web Token - Compact, URL-safe means of representing claims for secure authentication |
| **CRUD** | Create, Read, Update, Delete - Basic database operations |
| **API** | Application Programming Interface - Set of protocols for building and integrating application software |
| **UAT** | User Acceptance Testing - Final testing phase where end-users validate the system |
| **CSV** | Comma-Separated Values - File format for data export |

---

## 17. Appendices

### Appendix A: Sample Data

**Sample Meeting Record:**
```json
{
  "serial_number": "MTG-2026-0001",
  "client_name": "Acme Corporation",
  "client_address": "123 Business St, Dhaka, Bangladesh",
  "contact_name": "John Doe",
  "contact_number": "+880-1234567890",
  "capacity_req": 100,
  "capacity_mrc": 50000,
  "other_cap_req": 50,
  "other_cap_mrc": 25000,
  "kam_user_id": "uuid-of-raj-patel",
  "meeting_minutes": "Discussed bandwidth requirements for new office. Client interested in 100 Mbps link with potential for upgrade to 150 Mbps in Q3. Follow-up meeting scheduled for Feb 15."
}
```

**Sample KPI Assignment:**
```json
{
  "serial_number": "KPI-2026-0001",
  "month": "2026-02",
  "kam_user_id": "uuid-of-raj-patel",
  "revenue_target": 500000,
  "capacity_target": 1000,
  "notes": "Focus on enterprise clients in Dhaka and Chittagong. Priority: Telco and banking sectors."
}
```

---

### Appendix B: API Endpoints (Summary)

**Authentication:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token
- `POST /api/auth/logout` - Logout

**User Management (Super User):**
- `GET /api/users/pending` - List pending users
- `POST /api/users/approve/{user_id}` - Approve user
- `POST /api/users/reject/{user_id}` - Reject user
- `GET /api/users/active` - List active users
- `POST /api/users/deactivate/{user_id}` - Deactivate user

**Meetings:**
- `GET /api/meetings` - List meetings (filtered by role)
- `POST /api/meetings` - Create meeting
- `GET /api/meetings/{meeting_id}` - Get meeting details
- `PUT /api/meetings/{meeting_id}` - Update meeting
- `DELETE /api/meetings/{meeting_id}` - Delete meeting (soft)

**Pipeline:**
- `GET /api/pipelines` - List confirmed pipelines
- `POST /api/pipelines` - Create pipeline
- `PUT /api/pipelines/{pipeline_id}` - Update pipeline
- `DELETE /api/pipelines/{pipeline_id}` - Delete pipeline

**Delivered:**
- `GET /api/delivered` - List delivered clients
- `POST /api/delivered` - Create delivered record
- `PUT /api/delivered/{delivered_id}` - Update delivered
- `DELETE /api/delivered/{delivered_id}` - Delete delivered

**KPI Assignments (Super User):**
- `GET /api/kpi-assignments` - List KPI assignments
- `POST /api/kpi-assignments` - Create assignment
- `PUT /api/kpi-assignments/{assignment_id}` - Update assignment
- `DELETE /api/kpi-assignments/{assignment_id}` - Delete assignment

**Dashboard:**
- `GET /api/dashboard/summary` - Get dashboard metrics (role-based)

**Reports:**
- `GET /api/reports/meetings/export` - Export meetings to Excel/CSV
- `GET /api/reports/pipeline/export` - Export pipeline
- `GET /api/reports/delivered/export` - Export delivered
- `GET /api/reports/summary/export` - Export monthly summary (Super User)

---

### Appendix C: Change Log (From Version 1.0 to 2.0)

**Major Enhancements:**

1. **Added Executive Summary** - Provides high-level business context, objectives, expected benefits, and scope summary for stakeholders
2. **Expanded Introduction** - Added detailed audience table, document conventions, assumptions, dependencies, and constraints
3. **Enhanced System Overview** - Added system context diagram, technology stack recommendations, and user journey flows
4. **Detailed User Personas** - Created comprehensive personas for Super User and KAM with pain points and success criteria
5. **RBAC Matrix** - Added detailed role-based access control matrix for all features
6. **Comprehensive Functional Requirements** - Expanded all FR sections with:
   - User stories for context
   - Detailed acceptance criteria in table format
   - Business rules
   - Priority levels
7. **Enhanced Non-Functional Requirements** - Added specific targets and measurement methods for:
   - Performance (with load testing targets)
   - Security (with detailed implementation)
   - Reliability & Availability
   - Usability
   - Maintainability
   - Compatibility
   - Auditability
8. **Data Model & Architecture** - Added:
   - Entity Relationship Diagram
   - Detailed MongoDB schema with sample documents
   - Index strategy for performance
   - Technology stack recommendations with justification
9. **UI Requirements** - Added:
   - General UI guidelines (color scheme, typography, loading states)
   - Page-level UI requirements with wireframes
   - UI component library recommendations
10. **Security & Compliance** - Added:
    - Detailed authentication flow diagram
    - Password policy
    - Data privacy considerations
    - Compliance checklist
11. **Integration Requirements** - Documented future integrations with priorities
12. **Reporting & Analytics** - Added standard reports table and analytics capabilities
13. **Deployment & Infrastructure** - Added:
    - Deployment architecture diagram
    - Environment setup
    - Infrastructure requirements
    - CI/CD pipeline
14. **Testing Strategy** - Added:
    - Testing phases table
    - Sample test cases
    - Acceptance criteria validation approach
15. **Risk Assessment** - Added comprehensive risk analysis with:
    - Technical risks
    - Business risks
    - Operational risks
    - Mitigation strategies
16. **Success Metrics** - Added measurable KPIs for:
    - System performance
    - Business success
    - User satisfaction
17. **Appendices** - Added:
    - Sample data (JSON examples)
    - API endpoints summary
    - Change log

**Structural Improvements:**
- Professional table of contents with anchors
- Consistent requirement ID format (FR-XXX-XX, NFR-XXX-XX)
- Tables for better readability
- Visual diagrams (ERD, architecture, workflows)
- Clear section hierarchy
- Document control and versioning

**Content Enhancements:**
- All business rules explicitly stated
- All assumptions and dependencies documented
- Clear acceptance criteria for every requirement
- Priority levels (Must Have, Should Have, Could Have)
- Target metrics for non-functional requirements
- Comprehensive glossary

---

## Document Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Product Owner** | [Name] | __________ | __/__/__ |
| **Head of Sales** | [Name] | __________ | __/__/__ |
| **Lead Developer** | [Name] | __________ | __/__/__ |
| **QA Lead** | [Name] | __________ | __/__/__ |
| **Project Manager** | [Name] | __________ | __/__/__ |

---

## Next Steps

1. **Review & Approval** - Circulate this SRS v2.0 to all stakeholders for review and approval
2. **Requirements Workshop** - Conduct a walkthrough session with sales team and development team
3. **Design Phase** - Create detailed UI/UX designs and database schema
4. **Sprint Planning** - Break down requirements into development sprints (2-week sprints recommended)
5. **Development Kickoff** - Begin Phase 1 implementation with MVP features
6. **Continuous Feedback** - Maintain open communication channel for requirement clarifications

---

**END OF DOCUMENT**

---

*This Software Requirements Specification is a living document and will be updated as requirements evolve. All changes must be formally reviewed and approved through the change management process.*
