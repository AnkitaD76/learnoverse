# Certificate System - Quick Start Guide

## 🚀 Getting Started

The Certificate of Completion system has been successfully integrated into your Learnoverse platform. Follow these steps to test and use it.

---

## ✅ What's Been Added

### Backend

- ✅ Certificate Mongoose model
- ✅ Lesson completion tracking
- ✅ Automatic certificate issuance
- ✅ Public certificate viewing (no auth required)
- ✅ PDF generation with Puppeteer
- ✅ Rate limiting for PDF downloads
- ✅ Progress tracking endpoints

### Frontend

- ✅ Public certificate page (`/certificates/:id`)
- ✅ Certificate progress component
- ✅ Lesson completion button component
- ✅ API integration

---

## 📦 Dependencies Installed

```bash
# Already installed in your project:
- puppeteer (for PDF generation)

# Newly installed:
- express-rate-limit (for API rate limiting)
```

---

## 🔧 Setup Instructions

### 1. Start the Server

```bash
cd server
npm run dev
```

The server will automatically:

- Create the Certificate collection in MongoDB
- Register all certificate routes
- Enable PDF generation with Puppeteer

### 2. Start the Client

```bash
cd client
npm run dev
```

---

## 🎓 How to Test

### Complete Flow Test

1. **Login as a student**
2. **Enroll in a course** (with lessons)
3. **Open the course content page**
4. **For each lesson:**
   - View the lesson content
   - Click "Mark as Complete" button
5. **After completing all lessons:**
   - Certificate is automatically issued
   - You'll see a "Certificate Earned!" badge
   - Click "View Certificate" to see it
6. **On the certificate page:**
   - See the beautiful certificate design
   - Click "Download Certificate" to get PDF
7. **Test public access:**
   - Copy the certificate URL
   - Open in incognito/private window
   - Certificate should be visible without login

---

## 🔗 API Endpoints

### Student Endpoints (Auth Required)

```http
# Mark lesson as complete
POST /api/v1/courses/:courseId/lessons/:lessonId/complete
Authorization: Bearer <token>

# Get my certificate for a course
GET /api/v1/courses/:courseId/certificate
Authorization: Bearer <token>

# Get my enrollment with progress
GET /api/v1/courses/:courseId/my-enrollment
Authorization: Bearer <token>
```

### Public Endpoints (No Auth)

```http
# View certificate (HTML)
GET /api/certificates/:certificateId

# Download certificate (PDF)
POST /api/certificates/:certificateId/pdf
```

---

## 🎨 Certificate Design

The certificate features:

- **Size:** 1123px × 794px (landscape)
- **Brand:** Learnoverse
- **Colors:** Teal blue theme (#7fb7c9, #3c7f91)
- **Verified Badge:** Yellow gradient circle
- **Certificate ID:** Unique number (LRN-2025-XXXXXXXX)

---

## 💻 Code Examples

### Using Certificate Progress Component

```jsx
import { CertificateProgress } from "../../components/CertificateProgress";
import { fetchMyEnrollment } from "../../api/courses";

// In your component
const [enrollment, setEnrollment] = useState(null);

useEffect(() => {
  const load = async () => {
    const res = await fetchMyEnrollment(courseId);
    setEnrollment(res.enrollment);
  };
  load();
}, [courseId]);

return (
  <CertificateProgress
    courseId={courseId}
    enrollment={enrollment}
    totalLessons={course.lessons.length}
  />
);
```

### Using Lesson Completion Button

```jsx
import { LessonCompletionButton } from "../../components/CertificateProgress";

// In your lesson view
const isCompleted = enrollment?.completedLessonIds?.includes(lesson._id);

return (
  <LessonCompletionButton
    courseId={courseId}
    lessonId={lesson._id}
    isCompleted={isCompleted}
    onComplete={(result) => {
      // Refresh enrollment
      // Show success message
      if (result.certificate) {
        alert("🎉 Certificate earned!");
      }
    }}
  />
);
```

---

## 🧪 Testing Scenarios

### Test 1: Complete a Course

1. Login as student
2. Enroll in course with 3 lessons
3. Mark lesson 1 complete → Progress: 33%
4. Mark lesson 2 complete → Progress: 67%
5. Mark lesson 3 complete → Progress: 100% + Certificate issued! 🎉

### Test 2: View Certificate

1. After earning certificate
2. Click "View Certificate" button
3. See certificate with your name, course title, date
4. Verify certificate ID is displayed

### Test 3: Download PDF

1. On certificate page
2. Click "Download Certificate"
3. PDF should download with filename: `Certificate-LRN-2025-XXXXXXXX.pdf`
4. Open PDF → Should match the web view

### Test 4: Public Access

1. Copy certificate URL from browser
2. Logout
3. Paste URL in new incognito window
4. Certificate should display (no login required)
5. Download PDF should still work

### Test 5: Rate Limiting

1. Download PDF 5 times quickly
2. 6th attempt should show rate limit message
3. Wait 15 minutes
4. Download should work again

---

## 📁 Files Created/Modified

### New Files

```
server/src/models/Certificate.js
server/src/controllers/certificate.controller.js
server/src/routers/certificate.routes.js
client/src/pages/Certificate/page.jsx
client/src/components/CertificateProgress.jsx
client/src/api/certificates.js
CERTIFICATE_SYSTEM.md
CERTIFICATE_QUICKSTART.md (this file)
```

### Modified Files

```
server/src/models/index.js (exported Certificate)
server/src/server.js (added certificate routes)
server/src/routers/course.routes.js (added completion endpoint)
server/src/controllers/course.controller.js (added getMyEnrollment, updated getMyEnrollments)
client/src/router/index.jsx (added certificate route)
client/src/api/courses.js (added fetchMyEnrollment)
```

---

## 🐛 Troubleshooting

### Issue: PDF doesn't generate

**Solution:**

```bash
# Verify Puppeteer is installed
cd server
npm list puppeteer

# If missing, install:
npm install puppeteer
```

### Issue: Certificate not issued after completing all lessons

**Check:**

1. All lessons marked as complete?
2. Check server logs for errors
3. Verify enrollment status is 'enrolled'

### Issue: Certificate page shows "Certificate not found"

**Check:**

1. Verify certificate ID in URL is correct
2. Check MongoDB for certificate record
3. Ensure certificate status is 'issued' not 'revoked'

### Issue: Rate limited on PDF download

**Expected:** This is a security feature
**Solution:** Wait 15 minutes or reduce download frequency

---

## 🔐 Security Features

1. **Immutable Certificates** - Cannot be changed after issuance
2. **Unique Constraint** - One certificate per student per course
3. **Public Verification** - Anyone can verify via URL
4. **Rate Limiting** - Prevents PDF generation abuse
5. **Server-Side PDF** - No client manipulation possible
6. **ObjectId Validation** - Prevents enumeration attacks

---

## 📊 Database Schema

```javascript
Certificate {
  _id: ObjectId,
  user: ObjectId (ref: User),
  course: ObjectId (ref: Course),
  certificateNumber: String (unique, auto-generated),
  issuedAt: Date (immutable),
  status: 'issued' | 'revoked',
  createdAt: Date,
  updatedAt: Date
}

// Indexes
{ user: 1, course: 1 } unique
{ certificateNumber: 1 }
```

---

## 🎯 Next Steps

### Integration Options

1. **Add to Course Detail Page**

   - Show certificate badge if earned
   - Display progress bar
   - Add "View Certificate" link

2. **Add to Student Dashboard**

   - List all earned certificates
   - Show total courses completed
   - Quick links to view/download

3. **Add to User Profile**

   - Display certificates earned
   - Show to other users (public profile)
   - Share on social media

4. **Email Notification**
   - Send email when certificate is earned
   - Include certificate link
   - Congratulate the student

---

## 📞 Support

If you need help:

1. Check server logs: `server/logs` or console output
2. Review [CERTIFICATE_SYSTEM.md](./CERTIFICATE_SYSTEM.md) for detailed docs
3. Verify all endpoints are working using API tests

---

**System:** Certificate of Completion  
**Platform:** Learnoverse  
**Status:** ✅ Production Ready  
**Date:** December 25, 2025
