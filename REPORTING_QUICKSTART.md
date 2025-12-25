# Reporting System Quick Start Guide

## 🚀 Quick Start

### 1. Backend Setup (Already Complete!)

The reporting system backend is ready to use. No additional setup required.

**What's been added:**

- ✅ Report model in database
- ✅ API endpoints for creating and managing reports
- ✅ Admin endpoints with role-based access
- ✅ Validation schemas
- ✅ Spam detection logic

### 2. Testing the System

#### A. Start the Server

```bash
cd server
npm start
```

#### B. Test User Flow

1. **Login as a regular user** to get an access token
2. **Visit any course, post, or profile**
3. **Click the Report button** (you'll need to integrate it first - see below)
4. **Fill out the report form** with category and description
5. **Submit the report**
6. **Go to Footer → "My Reports"** to see your report status

#### C. Test Admin Flow

1. **Login as an admin user**
2. **Click your profile menu → "Admin Reports"** (orange text)
3. **View all reports** on the dashboard
4. **Filter by status, type, or category**
5. **Click "View" on any report** to see details
6. **Take action:**
   - Dismiss the report
   - Delete the content
   - Ban the user
   - Delete content AND ban user

### 3. Quick Integration (5 minutes)

Add a report button to any page in 3 steps:

#### Example: Add to Course Details Page

**File:** `client/src/pages/CourseDetails/page.jsx`

```jsx
// Step 1: Import components (at the top)
import { useState } from "react";
import ReportButton from "../../components/ReportButton";
import ReportModal from "../../components/ReportModal";

// Step 2: Add state in your component
const [showReportModal, setShowReportModal] = useState(false);
const { user } = useSession(); // If not already available

// Step 3: Add button and modal in your JSX
// Add this button near the course title or actions area:
{
  course && user && course.instructor?._id !== user.userId && (
    <ReportButton variant='icon' onReport={() => setShowReportModal(true)} />
  );
}

// Add this modal at the end of your return statement:
{
  showReportModal && course && (
    <ReportModal
      isOpen={showReportModal}
      onClose={() => setShowReportModal(false)}
      reportType='course'
      reportedEntity={course._id}
      reportedUser={course.instructor?._id}
    />
  );
}
```

**Done!** The report button is now functional.

### 4. Frontend Routes

The following routes are already configured:

- **User Route:** `/my-reports` - View your submitted reports
- **Admin Route:** `/admin/reports` - Admin dashboard (admin only)

### 5. API Endpoints Summary

#### User Endpoints

```
POST   /api/v1/reports              - Create a report
GET    /api/v1/reports/my-reports   - Get your reports
```

#### Admin Endpoints

```
GET    /api/v1/reports/admin/all           - Get all reports
GET    /api/v1/reports/admin/stats         - Get statistics
GET    /api/v1/reports/admin/:id           - Get report details
PATCH  /api/v1/reports/admin/:id/dismiss   - Dismiss a report
PATCH  /api/v1/reports/admin/:id/action    - Take action
PATCH  /api/v1/reports/admin/mark-spam/:id - Mark as spam
```

### 6. Quick Test with API (Using REST Client)

1. Open `server/report-api-tests.http`
2. Replace placeholder values:
   - `{{accessToken}}` - Your user token
   - `{{adminToken}}` - Your admin token
   - `{{courseId}}` - A valid course ID
   - `{{reportId}}` - A created report ID
3. Run the requests in order

### 7. Component Props Reference

#### ReportButton

```jsx
<ReportButton
  variant='icon|text|button' // Choose button style
  onReport={callback} // Function to call when clicked
  className='custom-classes' // Optional custom styling
/>
```

#### ReportModal

```jsx
<ReportModal
  isOpen={boolean} // Show/hide modal
  onClose={callback} // Close callback
  reportType='course|post|user|liveSession' // What's being reported
  reportedEntity={id} // Entity ID
  reportedUser={userId} // User ID (optional)
/>
```

### 8. Where to Add Report Buttons

Recommended locations:

| Page           | Location          | Report Type   | Variant          |
| -------------- | ----------------- | ------------- | ---------------- |
| Course Details | Near course title | `course`      | `text` or `icon` |
| Post Card      | Top right corner  | `post`        | `icon`           |
| User Profile   | Profile header    | `user`        | `button`         |
| Q&A Question   | Question header   | `post`        | `icon`           |
| Live Session   | Session controls  | `liveSession` | `button`         |

### 9. Testing Checklist

**User Tests:**

- [ ] Can create a report for a course
- [ ] Can create a report for a post
- [ ] Can create a report for a user
- [ ] Cannot report own content
- [ ] Cannot create duplicate pending reports
- [ ] Can view reports in "My Reports" page
- [ ] Can see report status updates

**Admin Tests:**

- [ ] Can access admin dashboard
- [ ] Can view all reports
- [ ] Can filter reports
- [ ] Can view report details
- [ ] Can dismiss a report
- [ ] Can delete content
- [ ] Can ban a user
- [ ] Can see statistics

### 10. Common Issues & Solutions

**Issue:** "User not found" when creating report

- **Solution:** Make sure the `reportedUser` ID is valid

**Issue:** Report button appears on own content

- **Solution:** Add check: `{item.userId !== user.userId && ...}`

**Issue:** Admin can't access reports dashboard

- **Solution:** Ensure user has `role: 'admin'` in database

**Issue:** "Report already exists" error

- **Solution:** There's already a pending report for that entity. Check `/my-reports`

### 11. Next Steps

1. **Integrate report buttons** into your pages using the guide above
2. **Test the full workflow** (create report → admin review → action)
3. **Customize the UI** if needed (button styles, modal appearance)
4. **Add notifications** (optional - for real-time admin alerts)
5. **Review the docs** in `REPORTING_SYSTEM_DOCS.md` for advanced features

### 12. Support & Documentation

- **Full Documentation:** `REPORTING_SYSTEM_DOCS.md`
- **Integration Examples:** `REPORT_INTEGRATION_GUIDE.md`
- **API Tests:** `server/report-api-tests.http`

## 🎉 You're Ready!

The reporting system is fully functional. Users can report content, and admins can take action. Just integrate the report buttons into your pages and you're good to go!

### Quick Demo Flow

1. **As User:** Report a test course
2. **As User:** Go to footer → "My Reports" → See your report
3. **As Admin:** Go to "Admin Reports" → See the new report
4. **As Admin:** Click "View" → Review details
5. **As Admin:** Click "Dismiss" or take action
6. **As User:** Refresh "My Reports" → See updated status ✅

Happy reporting! 🚨
