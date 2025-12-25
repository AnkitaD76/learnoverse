# Reporting System Documentation

## Overview

A comprehensive reporting system that allows users to report inappropriate content, suspicious activities, and platform issues. Admins can review reports and take action (dismiss or delete/ban).

## Features

### User Features

- ✅ Report courses, posts, users, and live sessions
- ✅ Select from predefined categories (Inappropriate Content, Spam, Harassment, Scam, Copyright, Other)
- ✅ Add detailed descriptions (10-1000 characters)
- ✅ Track report status in the footer ("My Reports" link)
- ✅ View report history with status updates
- ✅ Cannot report own content
- ✅ Cannot submit duplicate pending reports

### Admin Features

- ✅ Dedicated admin reports dashboard
- ✅ Filter reports by status, type, and category
- ✅ View detailed report information including:
  - Reporter details
  - Reported content preview
  - Report description
  - Timestamps
- ✅ Take action on reports:
  - Dismiss report
  - Delete content only
  - Ban user only
  - Delete content AND ban user
- ✅ Add admin notes to reports
- ✅ View statistics (pending, reviewed, dismissed, action-taken counts)
- ✅ Auto-detect spam reporters (70%+ dismissed reports)

## Report Categories

1. **Inappropriate Content** - Offensive, NSFW, or unsuitable content
2. **Spam** - Unsolicited promotional or repetitive content
3. **Harassment/Bullying** - Abusive or threatening behavior
4. **Scam/Fraud** - Fraudulent or deceptive practices
5. **Copyright Violation** - Unauthorized use of copyrighted material
6. **Other** - Any other issues not covered above

## Report Types

- **Course** - Report an entire course
- **Post** - Report posts/comments/questions/answers
- **User** - Report a user profile
- **Live Session** - Report a live session/class

## Report Statuses

- **Pending** - Awaiting admin review (default)
- **Reviewed** - Admin has reviewed but no action documented
- **Dismissed** - Report was dismissed (no action taken)
- **Action Taken** - Admin took action (deleted content/banned user)

## Backend Architecture

### Database Model (`server/src/models/Report.js`)

```javascript
{
  reporter: ObjectId (User),
  reportType: String (course|post|user|liveSession),
  reportedEntity: ObjectId (dynamic reference),
  reportedUser: ObjectId (User),
  category: String,
  description: String,
  status: String (pending|reviewed|dismissed|action-taken),
  reviewedBy: ObjectId (Admin),
  adminAction: String (none|dismissed|content-deleted|user-banned),
  adminNotes: String,
  reviewedAt: Date,
  isSpamReport: Boolean,
  timestamps: true
}
```

### API Endpoints

#### User Endpoints

**POST /api/v1/reports**

- Create a new report
- Validation: Zod schema
- Prevents self-reporting
- Prevents duplicate pending reports

**GET /api/v1/reports/my-reports**

- Get current user's reports
- Pagination supported
- Returns: reports list, pagination info

#### Admin Endpoints

**GET /api/v1/reports/admin/all**

- Get all reports with filters
- Query params: status, reportType, category, page, limit
- Returns: reports, stats, pagination

**GET /api/v1/reports/admin/:id**

- Get single report details
- Populates all related entities

**PATCH /api/v1/reports/admin/:id/dismiss**

- Dismiss a report
- Auto-checks for spam reporters

**PATCH /api/v1/reports/admin/:id/action**

- Take action on report
- Actions: delete-content, ban-user, delete-and-ban
- Deletes content and/or bans user

**PATCH /api/v1/reports/admin/mark-spam/:reporterId**

- Mark all reports from a user as spam

**GET /api/v1/reports/admin/stats**

- Get report statistics

### Controllers (`server/src/controllers/report.controller.js`)

- `createReport` - Create new report
- `getMyReports` - User's own reports
- `getAllReports` - Admin: All reports with filters
- `getReportById` - Admin: Single report details
- `dismissReport` - Admin: Dismiss report
- `takeActionOnReport` - Admin: Delete/ban actions
- `markReporterAsSpam` - Admin: Flag spam reporter
- `getReportStats` - Admin: Dashboard statistics

### Validation (`server/src/validations/report.validation.js`)

- `createReportSchema` - Validates report creation
- `updateReportSchema` - Validates admin updates
- `getReportsSchema` - Validates query filters
- `getUserReportsSchema` - Validates user queries

## Frontend Architecture

### Components

**ReportButton.jsx**

- Three variants: icon, text, button
- Props: onReport (callback), variant, className
- Prevents event propagation

**ReportModal.jsx**

- Full report submission form
- Category selection (radio buttons)
- Description textarea (10-1000 chars)
- Success/error handling
- Auto-closes after successful submission

### Pages

**MyReportsPage.jsx** (`/my-reports`)

- User's report history
- Status badges with icons
- Pagination
- Shows admin notes if available

**AdminReportsPage.jsx** (`/admin/reports`)

- Admin dashboard
- Stats cards (pending, reviewed, dismissed, action-taken)
- Filters (status, type, category)
- Reports table
- Detailed modal with action buttons
- Confirmation dialogs for actions

### API Client (`client/src/api/reports.js`)

```javascript
createReport(reportData);
getMyReports(page, limit);
getAllReports(filters);
getReportById(reportId);
dismissReport(reportId, adminNotes);
takeActionOnReport(reportId, action, adminNotes);
markReporterAsSpam(reporterId);
getReportStats();
```

## User Model Updates

Added `isBanned` field to User model:

```javascript
isBanned: {
  type: Boolean,
  default: false
}
```

When a user is banned:

- `isActive` set to `false`
- `isBanned` set to `true`

## Spam Detection

Automatic spam reporter detection:

- Triggered when admin dismisses a report
- Checks if reporter has 5+ total reports
- If 70%+ are dismissed, marks all reports as spam
- Future enhancement: Could auto-block spam reporters

## Integration Guide

See `REPORT_INTEGRATION_GUIDE.md` for detailed examples of how to add report buttons to:

- Course Details pages
- Posts pages
- Profile pages
- Q&A pages
- Live Session pages

### Quick Integration Example

```jsx
import { useState } from "react";
import ReportButton from "../../components/ReportButton";
import ReportModal from "../../components/ReportModal";

// In your component:
const [showReportModal, setShowReportModal] = useState(false);
const { user } = useSession();

// Add button (only if not the owner):
{
  item.userId !== user.userId && (
    <ReportButton variant='icon' onReport={() => setShowReportModal(true)} />
  );
}

// Add modal:
{
  showReportModal && (
    <ReportModal
      isOpen={showReportModal}
      onClose={() => setShowReportModal(false)}
      reportType='course' // or 'post', 'user', 'liveSession'
      reportedEntity={item._id}
      reportedUser={item.userId}
    />
  );
}
```

## Routes

### User Routes

- `/my-reports` - View own reports

### Admin Routes

- `/admin/reports` - Reports dashboard (admin only)

## Security & Permissions

### User Actions

- Any authenticated user can submit reports
- Users cannot report themselves
- Users cannot submit duplicate pending reports

### Admin Actions

- Only users with role='admin' can access admin endpoints
- Protected by `authorizeRoles('admin')` middleware
- Admin routes use ProtectedRoute with requiredRole prop

## Future Enhancements

1. Real-time notifications for admins (WebSocket)
2. Email notifications to reporters when reports are resolved
3. Auto-moderation (hide content after X reports)
4. Report appeal system
5. Moderator role (between user and admin)
6. Report priority levels
7. Bulk actions on reports
8. Report analytics dashboard
9. Export reports to CSV
10. Integration with content moderation AI

## Testing

### Manual Testing Checklist

**User Flow:**

- [ ] Submit a report for a course
- [ ] Submit a report for a post
- [ ] Submit a report for a user
- [ ] Try to report own content (should fail)
- [ ] Try to submit duplicate report (should fail)
- [ ] View reports in "My Reports" page
- [ ] Check report status updates

**Admin Flow:**

- [ ] Access admin reports dashboard
- [ ] Filter reports by status
- [ ] Filter reports by type
- [ ] Filter reports by category
- [ ] View report details
- [ ] Dismiss a report
- [ ] Delete content
- [ ] Ban a user
- [ ] Delete content AND ban user
- [ ] Add admin notes
- [ ] View statistics

### API Testing

Use the provided test file: `server/report-api-tests.http`

```http
### Create Report
POST http://localhost:3000/api/v1/reports
Content-Type: application/json
Authorization: Bearer {{accessToken}}

{
  "reportType": "course",
  "reportedEntity": "{{courseId}}",
  "category": "spam",
  "description": "This course is clearly spam content..."
}

### Get My Reports
GET http://localhost:3000/api/v1/reports/my-reports?page=1&limit=10
Authorization: Bearer {{accessToken}}

### Admin: Get All Reports
GET http://localhost:3000/api/v1/reports/admin/all?status=pending
Authorization: Bearer {{adminToken}}

### Admin: Dismiss Report
PATCH http://localhost:3000/api/v1/reports/admin/{{reportId}}/dismiss
Content-Type: application/json
Authorization: Bearer {{adminToken}}

{
  "adminNotes": "Not a valid concern"
}

### Admin: Take Action
PATCH http://localhost:3000/api/v1/reports/admin/{{reportId}}/action
Content-Type: application/json
Authorization: Bearer {{adminToken}}

{
  "action": "delete-and-ban",
  "adminNotes": "Severe violation"
}
```

## Dependencies

### Backend

- `mongoose` - Database modeling
- `zod` - Validation schemas
- `http-status-codes` - HTTP status constants

### Frontend

- `lucide-react` - Icons
- `react` - UI framework
- `axios` - HTTP client
- `react-router-dom` - Routing

## File Structure

```
server/
  src/
    models/
      Report.js                    # Report model
      User.js                      # Updated with isBanned field
    controllers/
      report.controller.js         # Report controllers
    routers/
      report.routes.js             # Report routes
    validations/
      report.validation.js         # Zod schemas
    middleware/
      validateRequest.js           # Request validation middleware

client/
  src/
    api/
      reports.js                   # API client
    components/
      ReportButton.jsx             # Report button component
      ReportModal.jsx              # Report modal component
      Footer.jsx                   # Updated with My Reports link
      Header.jsx                   # Updated with Admin Reports link
    pages/
      MyReports/
        MyReportsPage.jsx          # User reports page
      AdminReports/
        AdminReportsPage.jsx       # Admin dashboard
    router/
      index.jsx                    # Updated with report routes
      ProtectedRoute.jsx           # Updated with role-based access
```

## Conclusion

The reporting system is now fully implemented and ready to use. Users can report any inappropriate content or behavior, and admins have a powerful dashboard to review and take action on reports. The system includes spam detection, status tracking, and comprehensive filtering options.
