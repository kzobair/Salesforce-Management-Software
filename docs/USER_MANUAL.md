# FGL Salesforce Management Platform - User Manual

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles](#user-roles)
4. [Dashboard](#dashboard)
5. [Meetings Module](#meetings-module)
6. [Pipeline Module](#pipeline-module)
7. [Delivered Module](#delivered-module)
8. [KPI Assignments](#kpi-assignments)
9. [KAM Rankings](#kam-rankings)
10. [User Management](#user-management)

---

## Introduction

FGL Salesforce Management Platform is a comprehensive sales tracking system designed to help Key Account Managers (KAMs) and Super Users manage client meetings, sales pipelines, deliveries, and KPI performance tracking.

### Key Features
- Track client meetings and interactions
- Manage confirmed sales pipeline
- Monitor delivered clients with KPI scores
- Assign and track monthly KPI targets
- View KAM performance rankings
- Multi-currency support (BDT/USD)
- Multiple capacity units (Mbps/Gbps/IPLC)

---

## Getting Started

### Logging In
1. Navigate to the application URL
2. Enter your email address and password
3. Click **"Sign In"**

### First-Time Users
1. Click **"Register here"** on the login page
2. Fill in your details:
   - Full Name
   - Email Address
   - Mobile Number (optional)
   - Password (min 8 characters, must include uppercase, lowercase, and number)
3. Click **"Register"**
4. Wait for Super User approval before logging in

---

## User Roles

### Key Account Manager (KAM)
- Create and manage their own meetings
- Create and manage their own pipeline records
- View their delivered clients
- View their assigned KPI targets
- Track their own performance

### Super User
All KAM permissions plus:
- Approve/reject new user registrations
- View all KAMs' data
- Assign KPI targets to KAMs
- View KAM rankings and profiles
- Manage users (activate/disable accounts)

---

## Dashboard

The dashboard provides an overview of your sales performance.

### Monthly Comparison
Shows side-by-side comparison of:
- **Current Month**: Meetings, Pipeline, and Delivered counts
- **Previous Month**: Same metrics for comparison

### Total Statistics Cards
- **Total Meetings**: All-time meeting count
- **Confirmed Pipeline**: Total confirmed opportunities with MRC value
- **Delivered Clients**: Total delivered with revenue

### KPI Progress (KAM only)
If you have an assigned KPI for the current month, you'll see:
- Revenue Target progress bar
- Capacity Target progress bar
- KPI Score Target progress bar

### Quick Actions
Shortcut buttons to:
- Add Meeting
- Track Pipeline
- View Delivered
- KAM Rankings (Super User only)

---

## Meetings Module

### Creating a Meeting
1. Go to **Meetings** page
2. Click **"+ Add Meeting"**
3. Fill in the form:

| Field | Description | Required |
|-------|-------------|----------|
| Client Name | Name of the client company | Yes |
| Contact Name | Person you met with | Yes |
| Client Address | Physical address | Yes |
| Contact Number | Phone number | Yes |
| **Primary Capacity** | | |
| Capacity Req | Required capacity amount | Yes |
| Unit | Mbps / Gbps / IPLC | Yes |
| MRC | Monthly Recurring Charge | Yes |
| Currency | BDT or USD | Yes |
| OTC | One-Time Charge | No |
| Currency | BDT or USD | Yes |
| **Other Capacity** (Optional) | | |
| Same fields as above | For additional capacity needs | No |
| Meeting Minutes | Detailed notes from the meeting | Yes |

4. Click **"Add Meeting"**

### Editing a Meeting
1. Find the meeting in the table
2. Click **"Edit"**
3. Modify the details
4. Click **"Update Meeting"**

### Deleting a Meeting
1. Find the meeting in the table
2. Click **"Delete"**
3. Confirm the deletion

### Searching Meetings
Use the search box to filter by client name or contact name.

---

## Pipeline Module

The Pipeline module tracks confirmed sales opportunities.

### Creating a Pipeline Record
1. Go to **Pipeline** page
2. Click **"+ Add Pipeline"**
3. Fill in the form (similar to Meetings, plus):

| Field | Description | Options |
|-------|-------------|---------|
| Confirmation Status | Is this confirmed? | Pending / Confirmed |
| Confirmation Date | When was it confirmed? | Required if Confirmed |
| **Delivered Status** | Delivery status | Pending / In Process / Yes / No |
| Confirmation Notes | Additional notes | Optional |

4. Click **"Add Pipeline"**

### Delivered Status Options
- **Pending**: Not yet processed
- **In Process**: Currently being delivered
- **Yes**: Successfully delivered (will appear in Delivered tab)
- **No**: Not delivered / cancelled

### Pipeline Table Columns
- Serial # - Unique identifier
- Client Name
- Contact
- Capacity (with unit)
- MRC (with currency and OTC if applicable)
- Status (Pending/Confirmed)
- Delivered (Yes/No/Pending/In Process)
- Confirmation Date
- Actions (Edit/Delete)

---

## Delivered Module

Shows clients that have been successfully delivered.

### View Modes
Toggle between two views:
1. **From Pipeline**: Shows pipelines marked as "Yes" in Delivered Status
2. **Delivered Records**: Shows manually created delivered records

### Summary Statistics
- Total Delivered count
- Total Capacity delivered
- Total Revenue (MRC)
- Total KPI Score achieved

### Table Information
- Serial #
- Client Name
- Capacity (with unit)
- MRC (with currency)
- OTC (if applicable)
- KPI Score
- Delivery Date
- Status

---

## KPI Assignments

*Super User Only*

### Assigning KPI Targets
1. Go to **KPI Assignments** page
2. Click **"+ Assign KPI"**
3. Fill in the form:

| Field | Description |
|-------|-------------|
| Month | Select month (YYYY-MM format) |
| Key Account Manager | Select the KAM |
| Revenue Target | Target revenue in BDT |
| Capacity Target | Target capacity to deliver |
| KPI Score Target | Target KPI score to achieve |
| Notes | Optional instructions or focus areas |

4. Click **"Assign KPI"**

### Rules
- One assignment per KAM per month
- Cannot change KAM or month after creation (delete and recreate instead)
- Can update targets and notes

---

## KAM Rankings

*Super User Only*

### Viewing Rankings
1. Go to **KAM Rankings** page
2. See all KAMs ranked by Total KPI Score

### Rankings Table
- Rank (with medal for top 3: 🥇🥈🥉)
- KAM Name
- Email
- Total KPI Score
- Actions (View Profile)

### Viewing KAM Profile
1. Click **"View Profile"** next to a KAM
2. See detailed information:
   - Personal Information (name, email, mobile, role)
   - Performance Statistics (KPI score, meetings, pipelines, delivered, revenue)
   - KPI Assignment History

---

## User Management

*Super User Only*

### Approving New Users
1. Go to **User Management** page
2. Find users with "Pending" status
3. Click **"Approve"** to activate or **"Reject"** to deny

### Managing Users
- **Make Super User**: Promote a KAM to Super User
- **Disable**: Temporarily disable an account
- **Enable**: Re-enable a disabled account

### User Statuses
| Status | Description |
|--------|-------------|
| Pending | Awaiting approval |
| Active | Can log in and use the system |
| Rejected | Registration was denied |
| Disabled | Account temporarily disabled |

---

## Tips & Best Practices

### For KAMs
1. Record meetings immediately after they occur
2. Keep meeting minutes detailed and accurate
3. Update pipeline status promptly when confirmed
4. Mark delivered status as "Yes" once delivery is complete
5. Check your KPI progress regularly on the dashboard

### For Super Users
1. Review and approve pending users promptly
2. Assign KPI targets at the beginning of each month
3. Monitor KAM rankings to identify top performers
4. Use the monthly comparison to track team progress
5. Review individual KAM profiles for detailed performance analysis

---

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Enter | Submit forms |
| Escape | Close modals |
| Tab | Navigate between fields |

---

## Support

For technical support or questions, please contact your system administrator.

---

*Document Version: 1.0*
*Last Updated: February 2026*
