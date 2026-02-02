# FGL Salesforce Management Platform - FAQ

## Table of Contents
1. [General Questions](#general-questions)
2. [Account & Login](#account--login)
3. [Meetings Module](#meetings-module)
4. [Pipeline Module](#pipeline-module)
5. [Delivered Module](#delivered-module)
6. [KPI & Performance](#kpi--performance)
7. [User Management](#user-management)
8. [Technical Issues](#technical-issues)

---

## General Questions

### Q1: What is FGL Salesforce Management Platform?
**A:** FGL Salesforce Management Platform is a comprehensive sales tracking system designed to help Key Account Managers (KAMs) manage client meetings, track sales pipelines, monitor deliveries, and measure KPI performance. It provides Super Users with oversight capabilities including user management and KAM performance rankings.

### Q2: Who should use this platform?
**A:** 
- **Key Account Managers (KAMs)**: Sales professionals who need to track their client interactions and sales progress
- **Super Users/Managers**: Team leaders who need to monitor team performance, approve users, and assign KPI targets

### Q3: What browsers are supported?
**A:** The platform supports all modern browsers:
- Google Chrome (recommended)
- Mozilla Firefox
- Microsoft Edge
- Safari

### Q4: Is there a mobile app?
**A:** Currently, there is no dedicated mobile app. However, the web application is responsive and works on mobile browsers.

### Q5: Can I access the platform from multiple devices?
**A:** Yes, you can log in from any device with a web browser. Your session will remain active based on the token expiration settings.

---

## Account & Login

### Q6: How do I create an account?
**A:**
1. Go to the login page
2. Click "Register here"
3. Fill in your details (name, email, password)
4. Submit the registration
5. Wait for a Super User to approve your account

### Q7: Why can't I log in after registering?
**A:** New accounts require Super User approval before they can log in. Contact your administrator to approve your account.

### Q8: I forgot my password. What should I do?
**A:** Contact your system administrator to reset your password. A password reset feature via email is planned for future updates.

### Q9: How do I change my password?
**A:** Password change functionality is available through the user profile settings. If not available, contact your administrator.

### Q10: What are the password requirements?
**A:** Passwords must:
- Be at least 8 characters long
- Contain at least one uppercase letter (A-Z)
- Contain at least one lowercase letter (a-z)
- Contain at least one number (0-9)

### Q11: Why was my account rejected?
**A:** Account rejection is at the discretion of the Super User. Common reasons include:
- Unrecognized email domain
- Duplicate account request
- Incomplete or suspicious information

Contact your administrator for specific details.

### Q12: My account is disabled. What should I do?
**A:** Contact your Super User or administrator to have your account re-enabled.

---

## Meetings Module

### Q13: What information should I include in a meeting record?
**A:** Include:
- Client company name and address
- Contact person's name and phone number
- Capacity requirements with units (Mbps/Gbps/IPLC)
- MRC (Monthly Recurring Charge) and OTC (One-Time Charge) with currency
- Detailed meeting minutes

### Q14: Can I edit a meeting after creating it?
**A:** Yes, click the "Edit" button next to any meeting to modify its details.

### Q15: What's the difference between MRC and OTC?
**A:**
- **MRC (Monthly Recurring Charge)**: The ongoing monthly fee charged to the client
- **OTC (One-Time Charge)**: A single, upfront charge (installation, setup, etc.)

### Q16: What are the capacity units?
**A:**
- **Mbps**: Megabits per second (standard bandwidth)
- **Gbps**: Gigabits per second (high-speed bandwidth)
- **IPLC**: International Private Leased Circuit (dedicated connection)

### Q17: Can Super Users see my meetings?
**A:** Yes, Super Users have access to view all KAMs' meetings for oversight and reporting purposes.

### Q18: Is there a limit to meeting minutes length?
**A:** Meeting minutes are limited to 5,000 characters. If you need more space, consider summarizing key points.

---

## Pipeline Module

### Q19: When should I create a Pipeline record?
**A:** Create a Pipeline record when:
- A client has shown serious interest
- You have a verbal or written commitment
- The deal is moving toward confirmation

### Q20: What's the difference between "Pending" and "Confirmed" status?
**A:**
- **Pending**: The opportunity is in progress but not yet confirmed
- **Confirmed**: The client has officially confirmed the deal

### Q21: What does "Delivered Status" mean?
**A:** Delivered Status tracks whether the pipeline has been fulfilled:
- **Pending**: Not yet processed for delivery
- **In Process**: Currently being delivered/installed
- **Yes**: Successfully delivered to the client
- **No**: Not delivered (cancelled or failed)

### Q22: Why do I need to enter a Confirmation Date?
**A:** The Confirmation Date is required when the status is "Confirmed" to track when the deal was finalized. This helps in monthly reporting and KPI calculations.

### Q23: Can I change a Pipeline's Delivered Status later?
**A:** Yes, you can edit any Pipeline record to update its Delivered Status as the deal progresses.

---

## Delivered Module

### Q24: What's the difference between "From Pipeline" and "Delivered Records" views?
**A:**
- **From Pipeline**: Shows pipelines that have been marked as "Yes" in Delivered Status
- **Delivered Records**: Shows manually created delivered records (for tracking deliveries not from pipeline)

### Q25: How is KPI Score calculated for deliveries?
**A:** KPI Score is assigned based on your KPI assignment targets. The score is entered when creating a delivered record and contributes to your total KPI achievement.

### Q26: Why don't I see my delivered pipelines in the Delivered tab?
**A:** Make sure the Pipeline's "Delivered Status" is set to "Yes". Only pipelines with "Yes" status appear in the Delivered tab.

---

## KPI & Performance

### Q27: What is KPI?
**A:** KPI (Key Performance Indicator) is a measurable value that demonstrates how effectively you are achieving business objectives. In this platform, KPIs include:
- Revenue targets
- Capacity targets
- KPI Score targets

### Q28: How often are KPIs assigned?
**A:** KPIs are typically assigned monthly by Super Users. Each KAM receives individual targets based on their role and territory.

### Q29: Where can I see my KPI targets?
**A:** Your current month's KPI targets are displayed on your Dashboard. You can also view your KPI history in your profile.

### Q30: How is my KPI progress calculated?
**A:** Progress is calculated as:
```
Progress % = (Achieved Value / Target Value) × 100
```
Progress bars show green (≥100%), yellow (≥70%), or red (<70%).

### Q31: What affects my KPI Score?
**A:** Your KPI Score is based on:
- Revenue generated from delivered clients
- Capacity delivered
- Number of successful deliveries

### Q32: How are KAM Rankings determined?
**A:** KAMs are ranked by their Total KPI Score in descending order. The KAM with the highest total score ranks #1.

### Q33: Can I see other KAMs' rankings?
**A:** Only Super Users can view the KAM Rankings page. Regular KAMs can only see their own performance.

---

## User Management

### Q34: How do I approve a new user? (Super User)
**A:**
1. Go to User Management
2. Find users with "Pending" status
3. Click "Approve" or "Reject"

### Q35: Can I change a user's role? (Super User)
**A:** Yes, you can promote a KAM to Super User by clicking "Make Super User" in User Management.

### Q36: How do I temporarily disable a user? (Super User)
**A:** Click the "Disable" button next to the user. They won't be able to log in until re-enabled.

### Q37: Can a disabled user's data still be accessed?
**A:** Yes, all data created by a disabled user remains in the system and can be viewed by Super Users.

---

## Technical Issues

### Q38: The page is loading slowly. What should I do?
**A:**
1. Check your internet connection
2. Clear your browser cache
3. Try a different browser
4. Contact your administrator if the problem persists

### Q39: I'm getting a "Session Expired" error.
**A:** Your login session has expired. Simply log in again to continue. Sessions typically expire after 24 hours of inactivity.

### Q40: The form won't submit. What's wrong?
**A:** Check for:
- Required fields marked with * that are empty
- Invalid data formats (e.g., email, phone number)
- Network connectivity issues
- Error messages displayed on the form

### Q41: Data I entered disappeared after saving.
**A:**
1. Check if there was an error message when saving
2. Refresh the page and check if the data appears
3. Try the operation again
4. Contact your administrator if the issue persists

### Q42: I can't see all the menu options.
**A:** Menu options are role-based:
- KAMs see: Dashboard, Meetings, Pipeline, Delivered
- Super Users see all above plus: KPI Assignments, KAM Rankings, User Management

### Q43: Export/Print functionality isn't working.
**A:** Export and print features are planned for future updates. Currently, you can use your browser's print function (Ctrl+P) to print any page.

### Q44: I found a bug. How do I report it?
**A:** Contact your system administrator with:
- Description of the issue
- Steps to reproduce
- Screenshots if possible
- Your browser and device information

### Q45: The numbers/calculations seem incorrect.
**A:** 
1. Verify the input data is correct
2. Check if all related records have been saved
3. Refresh the page to get the latest calculations
4. Contact your administrator if discrepancies persist

---

## Currency & Units

### Q46: Can I mix BDT and USD in the same record?
**A:** Yes, each MRC and OTC field has its own currency selector. You can use different currencies for different charges.

### Q47: Are currency conversions automatic?
**A:** No, the platform stores values in their original currency. There is no automatic conversion between BDT and USD.

### Q48: What if I need a different currency?
**A:** Currently, only BDT and USD are supported. Contact your administrator if you need additional currencies.

### Q49: What if I need a different capacity unit?
**A:** Currently supported units are Mbps, Gbps, and IPLC. Contact your administrator for additional unit requirements.

---

## Data & Privacy

### Q50: Who can see my data?
**A:**
- You can see your own data
- Super Users can see all users' data
- Other KAMs cannot see your data

### Q51: Is my data backed up?
**A:** Yes, the system performs regular automated backups. Contact your administrator for specific backup policies.

### Q52: Can I export my data?
**A:** Data export functionality is planned for future updates. Currently, contact your administrator for data export requests.

### Q53: What happens to my data if my account is disabled?
**A:** Your data remains in the system and is accessible by Super Users. It is not deleted when your account is disabled.

---

## Future Features

### Q54: What features are planned for future releases?
**A:** Planned features include:
- Data export (CSV/Excel)
- Email notifications
- Bulk data import
- Advanced reporting and analytics
- Mobile application
- Password reset via email
- Multi-language support

### Q55: How can I request a new feature?
**A:** Submit feature requests to your system administrator, who will evaluate and prioritize them for future updates.

---

## Contact & Support

### Q56: Who do I contact for help?
**A:** Contact your organization's system administrator or Super User for:
- Account issues
- Technical problems
- Feature requests
- Bug reports

---

*Document Version: 1.0*
*Last Updated: February 2026*
