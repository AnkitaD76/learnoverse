# Certificate of Completion System - Implementation Guide

## Overview

The Certificate of Completion feature has been successfully added to the Learnoverse platform. This document provides implementation details and integration instructions.

---

## Backend Implementation ✅

### 1. Database Model

**File:** `server/src/models/Certificate.js`

- Certificate model with fields: user, course, certificateNumber, issuedAt, status
- Unique compound index on (user, course) - one certificate per student per course
- Auto-generates certificate numbers in format: `LRN-YYYY-XXXXXXXX`

### 2. Course Completion Logic

**File:** `server/src/controllers/certificate.controller.js`

**Endpoint:** `POST /api/v1/courses/:id/lessons/:lessonId/complete`

- Marks lesson as complete for the enrolled student
- Tracks progress in `Enrollment.completedLessonIds`
- Automatically issues certificate when all lessons are completed
- Returns progress information and certificate details (if issued)

### 3. Public Certificate Routes

**File:** `server/src/routers/certificate.routes.js`

**Public Endpoints (No Authentication):**

- `GET /api/certificates/:certificateId` - View certificate details
- `POST /api/certificates/:certificateId/pdf` - Generate and download PDF

**Rate Limiting:**

- PDF generation limited to 5 requests per IP per 15 minutes
- In-memory rate limiting using `express-rate-limit`

### 4. PDF Generation

- Uses **Puppeteer** (server-side) to generate PDF from HTML
- PDFs are **NEVER stored** - generated on-demand
- HTML is the source of truth
- Tailwind CSS loaded via CDN for consistent rendering

### 5. Protected Endpoints

**Endpoints requiring authentication:**

- `GET /api/v1/courses/:id/certificate` - Get user's certificate for a course
- `GET /api/v1/courses/:id/my-enrollment` - Get enrollment with progress data
- `POST /api/v1/courses/:id/lessons/:lessonId/complete` - Mark lesson complete

---

## Frontend Implementation ✅

### 1. Certificate Page

**File:** `client/src/pages/Certificate/page.jsx`

**Route:** `/certificates/:certificateId` (Public)

**Features:**

- Displays certificate with professional Learnoverse design
- "Download Certificate" button to generate PDF
- Shows verification information
- Responsive layout with Tailwind CSS

### 2. Certificate Components

**File:** `client/src/components/CertificateProgress.jsx`

**Two Components:**

#### `<CertificateProgress />`

- Displays course completion progress
- Shows progress bar with percentage
- Displays certificate badge when earned
- "View Certificate" button links to certificate page

**Props:**

- `courseId` - Course ID
- `enrollment` - Enrollment object with `completedLessonIds`
- `totalLessons` - Total number of lessons

#### `<LessonCompletionButton />`

- Button to mark individual lessons as complete
- Shows "✓ Completed" when lesson is done
- Calls backend to update progress

**Props:**

- `courseId` - Course ID
- `lessonId` - Lesson ID
- `isCompleted` - Whether lesson is already completed
- `onComplete` - Callback when lesson is marked complete

### 3. API Functions

**File:** `client/src/api/certificates.js`

```javascript
// Get user's certificate for a course
getMyCertificate(courseId);

// Get public certificate details
getCertificate(certificateId);
```

**File:** `client/src/api/courses.js`

```javascript
// Mark lesson as complete
markLessonComplete(courseId, lessonId);

// Get user's enrollment with progress
fetchMyEnrollment(courseId);
```

---

## Integration Instructions

### Adding Certificate Progress to Course Pages

**Example: CourseContent Page**

```jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  CertificateProgress,
  LessonCompletionButton,
} from "../../components/CertificateProgress";
import { fetchCourseById, fetchMyEnrollment } from "../../api/courses";

const CourseContentPage = () => {
  const { courseId } = useParams();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);

  useEffect(() => {
    const load = async () => {
      const courseRes = await fetchCourseById(courseId);
      setCourse(courseRes.course);

      const enrollmentRes = await fetchMyEnrollment(courseId);
      setEnrollment(enrollmentRes.enrollment);
    };
    load();
  }, [courseId]);

  const handleLessonComplete = async (result) => {
    // Refresh enrollment data
    const enrollmentRes = await fetchMyEnrollment(courseId);
    setEnrollment(enrollmentRes.enrollment);

    // If certificate was issued, show congratulations
    if (result.certificate) {
      alert(`🎉 Congratulations! You've earned your certificate!`);
    }
  };

  if (!course) return <div>Loading...</div>;

  const isLessonCompleted = (lessonId) => {
    return enrollment?.completedLessonIds?.some(
      (id) => String(id) === String(lessonId)
    );
  };

  return (
    <div>
      {/* Show progress if user is enrolled */}
      {enrollment && (
        <CertificateProgress
          courseId={courseId}
          enrollment={enrollment}
          totalLessons={course.lessons.length}
        />
      )}

      {/* Lessons List */}
      {course.lessons.map((lesson) => (
        <div key={lesson._id}>
          <h3>{lesson.title}</h3>

          {/* Completion Button (only for enrolled students) */}
          {enrollment && (
            <LessonCompletionButton
              courseId={courseId}
              lessonId={lesson._id}
              isCompleted={isLessonCompleted(lesson._id)}
              onComplete={handleLessonComplete}
            />
          )}
        </div>
      ))}
    </div>
  );
};
```

---

## Certificate Design

The certificate uses the exact Tailwind design you provided:

- **Size:** 1123px × 794px (landscape orientation)
- **Colors:**
  - Border: `#7fb7c9` (teal blue)
  - Inner border: `#b8dbe6` (light blue)
  - Background: `#fffdf9` (warm white)
  - Text: `#3c7f91` (dark teal)
- **Verified Badge:** Yellow gradient circle
- **Certificate Number:** Displayed at bottom right

---

## Security Features

1. **Certificate Validation**

   - MongoDB ObjectId format validation
   - Status check (issued vs. revoked)
   - Public verification via URL

2. **Rate Limiting**

   - PDF generation limited per IP
   - Prevents abuse and server overload

3. **Immutability**

   - Certificate data cannot be changed after issuance
   - `issuedAt` field is immutable
   - Unique constraint prevents duplicates

4. **Server-Side Only**
   - All PDF generation happens on server
   - No client-side manipulation possible
   - HTML is authoritative source

---

## Testing

### Test Certificate Issuance

1. **Enroll in a course**
2. **Complete all lessons** using the completion button
3. **Certificate is automatically issued**
4. **View certificate** from course page
5. **Download PDF** from certificate page

### Test Public Access

1. Copy certificate URL: `/certificates/{certificateId}`
2. Open in incognito/private window (no login)
3. Certificate should display
4. Download PDF should work

### Test Rate Limiting

1. Download PDF 5 times quickly
2. 6th request should be rate-limited
3. Wait 15 minutes and try again

---

## Environment Requirements

**Backend:**

- `puppeteer` - Already installed (v20.8.0)
- `express-rate-limit` - Newly installed

**Frontend:**

- No new dependencies required

---

## Database Migration

The Certificate model will be automatically created when the server starts. No manual migration needed.

**To verify:**

```javascript
// In MongoDB
db.certificates.find();
```

---

## API Endpoints Summary

### Public (No Auth)

- `GET /api/certificates/:certificateId` - View certificate
- `POST /api/certificates/:certificateId/pdf` - Download PDF

### Protected (Auth Required)

- `POST /api/v1/courses/:id/lessons/:lessonId/complete` - Mark complete
- `GET /api/v1/courses/:id/certificate` - Get my certificate
- `GET /api/v1/courses/:id/my-enrollment` - Get my enrollment

---

## Next Steps

1. ✅ Backend models and controllers created
2. ✅ Certificate routes registered
3. ✅ Frontend certificate page created
4. ✅ Certificate components created
5. ✅ API functions implemented

**To Integrate:**

- Add `<CertificateProgress />` to your course detail pages
- Add `<LessonCompletionButton />` to lesson views
- Optionally show certificate badge in user dashboards

---

## Support

If you encounter any issues:

1. Check server logs for errors
2. Verify Puppeteer is installed correctly
3. Ensure MongoDB is running
4. Check rate limit configuration if PDF downloads fail

---

**Implementation Date:** December 25, 2025  
**Platform:** Learnoverse  
**Certificate Format:** LRN-YYYY-XXXXXXXX
