# Learnoverse: Learn, Teach & Trade Knowledge
## Software Requirements Specification (SRS)

---

## Document Metadata

| Field | Value |
|-------|-------|
| **Date** | January 13, 2026 |
| **Version** | 2.0 |
| **Status** | Updated from Codebase Analysis |
| **Audience** | Product, Engineering, QA, and Stakeholders |
| **Project Repository** | https://github.com/AnkitaD76/learnoverse |

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [External Interface Requirements](#3-external-interface-requirements)
4. [System Features](#4-system-features)
5. [Quality Requirements](#5-quality-requirements-non-functional)
6. [User Roles & Permissions](#6-user-roles--permissions)
7. [Architecture & Design](#7-architecture--design)
8. [Data Model](#8-data-model)
9. [API Endpoints](#9-api-endpoints)
10. [Release Status](#10-release-status)
11. [Success Metrics](#11-success-metrics)
12. [Risk & Mitigation](#12-risk--mitigation)
13. [Traceability Matrix](#13-traceability-matrix)
14. [Document Control](#14-document-control)
15. [Glossary](#15-glossary)

---

## Executive Summary

**Learnoverse** is a comprehensive peer-to-peer learning and knowledge trading platform that enables users to:
- **Learn** from experts through video and text-based courses
- **Teach** others by creating and publishing courses
- **Trade knowledge** through a points-based economy and skill swap system

The platform supports multiple user roles (Students, Instructors, Admins, Moderators) with a virtual currency system that allows knowledge trading without traditional currency barriers. Key features include real-time messaging, live video sessions via Jitsi, Q&A forums, course assessments with certificates, and comprehensive admin moderation tools.

---

## 1. Introduction

### 1.1 Purpose
This Software Requirements Specification (SRS) formally defines the functional and non-functional requirements for the Learnoverse platform. It serves as the single source of truth for product planning, engineering implementation, testing, and stakeholder alignment.

### 1.2 Scope
Learnoverse enables users to:
- Create and consume video/text-based courses
- Exchange skills using a points-based economy
- Communicate in real-time via messaging and live video sessions
- Validate achievements via certificates
- Participate in Q&A forums and community posts

**Technical Components:**
- Web Frontend: React 19 / Vite 7
- REST API Backend: Node.js 18+ / Express 5.x
- Real-time Services: Socket.io 4.x
- Database: MongoDB with Mongoose ODM
- Media Storage: Cloudinary
- Email: Nodemailer
- Video Conferencing: Jitsi Meet Integration

### 1.3 Definitions & Acronyms

| Term | Definition |
|------|------------|
| FR | Functional Requirement |
| NFR | Non-Functional Requirement |
| JWT | JSON Web Token |
| RBAC | Role-Based Access Control |
| API | Application Programming Interface |
| ODM | Object Document Mapper |
| SRS | Software Requirements Specification |

### 1.4 References
- [README.md](README.md) - Project Overview
- [server/ARCHITECTURE.md](server/ARCHITECTURE.md) - Wallet System Architecture
- [SOCKET_IO_SETUP.md](SOCKET_IO_SETUP.md) - Real-time Communication Setup
- [client/WALLET_IMPLEMENTATION.md](client/WALLET_IMPLEMENTATION.md) - Wallet Frontend Guide

---

## 2. Overall Description

### 2.1 Product Perspective
Learnoverse is a multi-tier web application consisting of:

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (React 19 + Vite 7)                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Pages     │  │ Components  │  │  Contexts (State)       │  │
│  │  (35+ pages)│  │ (Reusable)  │  │  Session, Wallet        │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   SERVER (Node.js + Express 5.x)                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │  Controllers│  │  Middleware │  │  Services               │  │
│  │  (19 files) │  │  Auth, RBAC │  │  Search, Completion     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Routers   │  │   Models    │  │  Socket.io (Real-time)  │  │
│  │  (18 routes)│  │ (24 models) │  │  Notifications, Chat    │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       DATABASE (MongoDB)                         │
│              24 Collections via Mongoose ODM                     │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Product Functions Summary

| Category | Features |
|----------|----------|
| **Authentication** | Registration, Login, Logout, Email Verification, Password Reset |
| **Courses** | Browse, Search, Create, Enroll, Lessons (Video/Text/Live) |
| **Payments** | Points Wallet, Buy/Sell Points, Course Enrollment, Refunds |
| **Assessments** | Assignments, Quizzes, Manual Grading, Retakes |
| **Certificates** | Auto-generation on completion, PDF download, Verification |
| **Communication** | Real-time Messaging, Notifications, Live Video Sessions |
| **Community** | Q&A Forum, Posts, Likes, Comments, Reviews |
| **Admin** | User Management, Course Approval, Reports, Analytics |

### 2.3 User Classes & Characteristics

| Role | Description | Key Capabilities |
|------|-------------|------------------|
| **Student** | Primary content consumer | Enroll in courses, submit assessments, earn certificates |
| **Instructor** | Content creator | Create courses, grade submissions, earn points from enrollments |
| **Moderator** | Content moderator | Review reports, moderate content |
| **Admin** | System administrator | All moderator permissions + user management, course approval |

### 2.4 Operating Environment

**Client Requirements:**
- Modern browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Responsive design: 320px minimum width
- JavaScript enabled

**Server Requirements:**
- Node.js 18+
- MongoDB 6.0+
- HTTPS/TLS 1.3

### 2.5 Design Constraints
- Security compliance with OWASP Top 10
- Rate limiting on authentication and API endpoints
- Accessibility: WCAG 2.1 AA target
- External service dependencies: Cloudinary, Email provider, Jitsi

### 2.6 Assumptions & Dependencies
- Reliable email delivery service (Nodemailer with SMTP)
- Cloudinary availability for media uploads
- MongoDB Atlas for database hosting
- Jitsi Meet for video conferencing

---

## 3. External Interface Requirements

### 3.1 User Interfaces

**35+ Page Components:**

| Category | Pages |
|----------|-------|
| **Auth** | Login, Register, ForgotPassword, ResetPassword, VerifyEmail |
| **Dashboard** | Dashboard (role-specific), Profile, Settings |
| **Courses** | Courses, CourseDetails, CourseContent, CreateCourse, ManageLessons, MyCourses |
| **Enrollment** | StudentEnrolled, StudentEvaluations, AttemptEvaluation |
| **Instructor** | InstructorEvaluations, EvaluationSubmissions, ViewSubmission, CreateEvaluation |
| **Wallet** | Wallet, BuyPoints, SellPoints, TransactionHistory |
| **Community** | Posts, QA, Search, Notifications |
| **Achievements** | Achievements, Certificate |
| **Admin** | AdminReports, MyReports |
| **Live** | LiveSession |

### 3.2 API Interfaces

**RESTful JSON API with 18 Route Groups:**

```
/api/v1/auth         - Authentication (register, login, logout, verify, reset)
/api/v1/users        - User profile management
/api/v1/courses      - Course CRUD and enrollment
/api/v1/evaluations  - Assessments and grading
/api/v1/wallet       - Points transactions
/api/v1/admin/wallet - Admin wallet management
/api/v1/certificates - Certificate generation
/api/v1/reviews      - Course reviews
/api/v1/reports      - Content reporting
/api/v1/posts        - Community posts
/api/v1/qa           - Q&A forum
/api/v1/search       - Global search
/api/v1/dashboard    - Dashboard data
/api/v1/notifications- User notifications
/api/v1/file-share   - File sharing
/api/v1/skill-swap   - Skill exchange requests
/api/v1/admin        - Admin management
/api/v1/temp-image   - Temporary image uploads
```

### 3.3 Communication Interfaces

**Socket.io Namespaces:**
- Real-time notifications
- Live session coordination
- Typing indicators
- Connection status

### 3.4 Storage Interfaces

**Cloudinary:**
- Avatar uploads
- Course thumbnails
- Lesson media

**MongoDB GridFS Alternative:**
- File sharing (binary storage in FileShare model)

---

## 4. System Features

### 4.1 User Authentication System
**Requirement ID:** FR-1  
**Priority:** CRITICAL  
**Status:** ✅ COMPLETED

**Description:** JWT-based authentication with email verification and secure session management.

**Implementation Details:**
- JWT access tokens (7-day expiry, configurable via `JWT_ACCESS_LIFETIME`)
- HTTP-only signed cookies for token storage
- Bearer token support in Authorization header
- bcrypt password hashing (auto salt rounds)
- Email verification with 24-hour token expiry
- Rate limiting on login attempts

**Key Files:**
- Server: `auth.controller.js`, `authenticate.js` middleware, `jwt.js` utility
- Client: `SessionContext.jsx`, `Login/`, `Register/`

**Acceptance Criteria:**
- [x] User registration with email, password, name
- [x] Email verification required before login
- [x] Secure password hashing with bcrypt
- [x] JWT tokens in HTTP-only cookies
- [x] Session restoration on page refresh
- [x] Auto-logout on token expiry

---

### 4.2 Password Recovery
**Requirement ID:** FR-2  
**Priority:** HIGH  
**Status:** ✅ COMPLETED

**Description:** Secure password reset via email with time-limited tokens.

**Implementation Details:**
- 40-character random reset token
- Token hashed before database storage (SHA-256)
- 10-minute token expiry
- Plain token sent via email
- Token invalidated after use

**Key Files:**
- Server: `auth.controller.js` (forgotPassword, resetPassword)
- Client: `ForgotPassword/`, `ResetPassword/`
- Utilities: `sendResetPasswordEmail.js`, `createHash.js`

---

### 4.3 Course Management
**Requirement ID:** FR-3  
**Priority:** HIGH  
**Status:** ✅ COMPLETED

**Description:** Full course lifecycle management with lessons, enrollment, and admin approval.

**Implementation Details:**
- Course creation with title, description, category, level, price
- Lesson types: Video, Text, Live (Jitsi integration)
- Admin approval workflow (draft → pending → approved/rejected)
- Skill tags for categorization
- Skill swap eligibility flag

**Course Model Fields:**
```javascript
{
  title, description, category, level,
  pricePoints, skillTags, instructor,
  enrollCount, averageRating, reviewCount,
  status: ['draft', 'pending', 'approved', 'rejected'],
  isPublished, approvedBy, publishedAt, rejectionReason,
  lessons: [{ title, type, contentUrl, textContent, live: {...} }],
  skillSwapEnabled
}
```

**Key Files:**
- Server: `course.controller.js`, `Course.js` model
- Client: `CreateCourse/`, `CourseDetails/`, `ManageLessons/`, `CourseContent/`

---

### 4.4 Course Enrollment
**Requirement ID:** FR-4  
**Priority:** HIGH  
**Status:** ✅ COMPLETED

**Description:** Enrollment with multiple payment methods and progress tracking.

**Implementation Details:**
- Payment methods: FREE, POINTS, SKILL_SWAP
- Points deducted atomically via wallet transactions
- Lesson completion tracking
- Withdrawal with refund support

**Enrollment Model Fields:**
```javascript
{
  user, course, status: ['enrolled', 'withdrawn', 'refunded'],
  enrolledAt, withdrawnAt,
  paymentMethod, pointsPaid,
  totalScore, completedLessonIds
}
```

---

### 4.5 Points-Based Wallet System
**Requirement ID:** FR-5  
**Priority:** CRITICAL  
**Status:** ✅ COMPLETED

**Description:** Virtual currency system for course purchases and instructor earnings.

**Implementation Details:**
- Immutable transaction ledger
- Atomic operations with MongoDB sessions
- Exchange rates per currency (USD, BDT, EUR, GBP)
- Mock payment processing (ready for real gateway integration)
- Payout requests with escrow system

**Transaction Types:**
- PURCHASE: Buy points with cash
- SALE: Sell points for cash (payout)
- ENROLLMENT: Spend points on course
- REFUND: Points returned
- ADMIN_CREDIT/DEBIT: Admin adjustments
- BONUS: Promotional rewards
- REVERSAL: Undo failed transactions

**Transaction Statuses:**
- PENDING → COMPLETED / FAILED / REVERSED

**Key Files:**
- Server: `wallet.controller.js`, `adminWallet.controller.js`
- Models: `Wallet.js`, `Transaction.js`, `ExchangeRate.js`, `PayoutRequest.js`
- Client: `WalletContext.jsx`, `Wallet/`, `BuyPoints/`, `SellPoints/`

---

### 4.6 Assessment System (Evaluations)
**Requirement ID:** FR-6  
**Priority:** HIGH  
**Status:** ✅ COMPLETED

**Description:** Assignments and quizzes with written answers and manual grading.

**Implementation Details:**
- Evaluation types: Assignment, Quiz
- Written-answer questions (not multiple choice)
- Manual instructor grading
- Pass/fail determination based on passingGrade threshold
- Retake support with configurable limits
- Immutable grades after grading

**Evaluation Workflow:**
1. Instructor creates evaluation (draft)
2. Adds questions with max marks
3. Publishes evaluation
4. Students submit answers
5. Instructor grades submissions
6. Auto-pass/fail calculation

**Key Files:**
- Server: `evaluation.controller.js`
- Models: `Evaluation.js`, `EvaluationQuestion.js`, `EvaluationSubmission.js`
- Client: `CreateEvaluation/`, `AttemptEvaluation/`, `ViewSubmission/`

---

### 4.7 Certificate Generation
**Requirement ID:** FR-7  
**Priority:** MEDIUM  
**Status:** ✅ COMPLETED

**Description:** Auto-generated certificates upon course completion.

**Implementation Details:**
- Unique certificate number: `LRN-YYYY-XXXXXXXX`
- PDF generation via Puppeteer
- One certificate per user per course
- Revocation support
- Verification endpoint

**Key Files:**
- Server: `certificate.controller.js`, `completion.service.js`
- Model: `Certificate.js`
- Client: `Certificate/`, `Achievements/`, `CertificateProgress.jsx`

---

### 4.8 Advanced Search
**Requirement ID:** FR-8  
**Priority:** HIGH  
**Status:** ✅ COMPLETED

**Description:** Multi-entity search with filters and pagination.

**Searchable Entities:**
- Courses (title, description, category, skill tags)
- Q&A Questions (title, body)
- Posts (text content)
- Users (name, email, bio, interests)
- Skill Swap Requests

**Filters:**
- Courses: skills, priceMin, priceMax, level, instructor
- Questions: tags, minVotes, hasAcceptedAnswer
- Users: role, country
- Skill Swaps: status

**Sort Options:**
- Relevance, Newest, Popular, Votes, Price

**Key Files:**
- Server: `search.controller.js`, `search.service.js`
- Client: `Search/`, `SearchBar.jsx`, `search.js` API

---

### 4.9 Q&A Forum
**Requirement ID:** FR-9  
**Priority:** MEDIUM  
**Status:** ✅ COMPLETED

**Description:** Stack Overflow-style Q&A system with voting and accepted answers.

**Features:**
- Questions with title, body, tags
- Answers with voting (upvote/downvote)
- Accepted answer marking
- View count tracking
- Tag-based categorization

**Key Files:**
- Server: `qa.controller.js`
- Models: `Question.js`, `Answer.js`, `Vote.js`, `Tag.js`
- Client: `QA/`

---

### 4.10 Community Posts
**Requirement ID:** FR-10  
**Priority:** MEDIUM  
**Status:** ✅ COMPLETED

**Description:** Social feed with posts, likes, and comments.

**Features:**
- Text posts
- Like/unlike functionality
- Nested comments
- User attribution

**Key Files:**
- Server: `post.controller.js`
- Model: `Post.js`
- Client: `Posts/`

---

### 4.11 Review & Rating System
**Requirement ID:** FR-11  
**Priority:** HIGH  
**Status:** ✅ COMPLETED

**Description:** Course and instructor ratings with helpful votes.

**Features:**
- 5-star rating with half-star increments
- Separate course and instructor ratings
- Review text (max 2000 chars)
- Helpful/Not Helpful voting
- One review per user per course
- Edit tracking

**Key Files:**
- Server: `review.controller.js`
- Model: `Review.js`
- Client: `ReviewForm.jsx`, `ReviewList.jsx`, `ReviewCard.jsx`

---

### 4.12 Reporting System
**Requirement ID:** FR-12  
**Priority:** MEDIUM  
**Status:** ✅ COMPLETED

**Description:** Content and user reporting with admin moderation.

**Report Types:**
- Course, Post, User, Live Session, Review

**Categories:**
- Inappropriate Content, Spam, Harassment, Scam, Copyright, Other

**Statuses:**
- Pending → Reviewed / Dismissed / Action Taken

**Admin Actions:**
- None, Dismissed, Content Deleted, User Banned

**Key Files:**
- Server: `report.controller.js`
- Model: `Report.js`
- Client: `ReportButton.jsx`, `ReportModal.jsx`, `AdminReports/`, `MyReports/`

---

### 4.13 Notification System
**Requirement ID:** FR-13  
**Priority:** HIGH  
**Status:** ✅ COMPLETED

**Description:** Real-time notifications via Socket.io.

**Features:**
- Push notifications via WebSocket
- Read/unread status tracking
- Notification types with custom data
- Persistent storage in database

**Key Files:**
- Server: `notification.controller.js`, `socket/`
- Model: `Notification.js`
- Client: `Notifications/`, `socketService.js`

---

### 4.14 Live Video Sessions
**Requirement ID:** FR-14  
**Priority:** HIGH  
**Status:** ✅ COMPLETED

**Description:** Jitsi Meet integration for live course sessions.

**Features:**
- Room creation with unique names
- Join codes for enrolled students
- Scheduled start times
- Keepalive process support

**Key Files:**
- Model: `Course.js` (lesson.live subdocument)
- Client: `LiveSession/`

---

### 4.15 File Sharing
**Requirement ID:** FR-15  
**Priority:** MEDIUM  
**Status:** ✅ COMPLETED

**Description:** Course-specific file sharing with visibility controls.

**Features:**
- Binary file storage in MongoDB
- Visibility levels: Private, Course, Public
- Download tracking
- Optional expiration dates
- Shared with specific users

**Key Files:**
- Server: `fileShare.controller.js`
- Model: `FileShare.js`
- Client: `FileShare.jsx`

---

### 4.16 Skill Swap System
**Requirement ID:** FR-16  
**Priority:** MEDIUM  
**Status:** ✅ COMPLETED

**Description:** Exchange course access between instructors.

**Features:**
- Request to swap courses
- Accept/reject workflow
- Mutual enrollment on acceptance

**Key Files:**
- Server: `skillSwap.controller.js`
- Model: `SkillSwapRequest.js`

---

### 4.17 Admin Management
**Requirement ID:** FR-17  
**Priority:** HIGH  
**Status:** ✅ COMPLETED

**Description:** Admin tools for user and content management.

**Features:**
- User listing with filters (role, verified, active)
- Course approval/rejection
- Report moderation
- Wallet adjustments
- Exchange rate management
- Payout processing

**Key Files:**
- Server: `admin.controller.js`, `adminWallet.controller.js`
- Client: `AdminReports/`

---

### 4.18 Profile Management
**Requirement ID:** FR-18  
**Priority:** HIGH  
**Status:** ✅ COMPLETED

**Description:** Comprehensive user profiles with demographics and social links.

**User Profile Fields:**
- Basic: name, email, avatar, role
- Demographics: dateOfBirth, gender, phone, country, city, address
- Education: educationLevel, institution, fieldOfStudy
- Learning: interests, bio
- Social: linkedin, website, github

**Key Files:**
- Server: `user.controller.js`
- Model: `User.js`
- Client: `Profile/`, `Settings/`

---

## 5. Quality Requirements (Non-Functional)

### 5.1 Performance Requirements

| Requirement | Target | Status |
|-------------|--------|--------|
| API Response Time (p95) | < 500ms | Planned |
| Search Results | < 1 second | ✅ Implemented |
| Dashboard Load | < 2 seconds | Planned |
| Concurrent Users | 10,000+ | Planned |

### 5.2 Security Requirements

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| JWT Authentication | Access tokens in HTTP-only cookies | ✅ Completed |
| Password Hashing | bcrypt with auto-salt | ✅ Completed |
| RBAC | Middleware-based role checks | ✅ Completed |
| Rate Limiting | express-rate-limit | ✅ Completed |
| Input Validation | Zod schemas | ✅ Completed |
| Security Headers | Helmet.js | ✅ Completed |
| CORS | Configured for frontend origin | ✅ Completed |

### 5.3 Scalability Requirements

| Requirement | Approach | Status |
|-------------|----------|--------|
| Stateless API | JWT-based, no server sessions | ✅ Completed |
| Database Indexing | Compound indexes on frequent queries | ✅ Completed |
| Connection Pooling | Mongoose default pooling | ✅ Completed |

### 5.4 Reliability Requirements

| Requirement | Target | Status |
|-------------|--------|--------|
| Uptime | 99.9% | Planned |
| Backup Frequency | Daily | Planned |
| Recovery Time (RTO) | < 4 hours | Planned |

### 5.5 Usability Requirements

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| Responsive Design | Tailwind CSS 4, mobile-first | ✅ Completed |
| Loading States | LoadingSpinner component | ✅ Completed |
| Error Handling | Centralized error middleware | ✅ Completed |

---

## 6. User Roles & Permissions

### Role Permission Matrix

| Permission | Student | Instructor | Moderator | Admin |
|------------|---------|------------|-----------|-------|
| View courses | ✅ | ✅ | ✅ | ✅ |
| Enroll in courses | ✅ | ✅ | ✅ | ✅ |
| Create courses | ❌ | ✅ | ❌ | ✅ |
| Grade submissions | ❌ | ✅ (own courses) | ❌ | ✅ |
| Post in Q&A | ✅ | ✅ | ✅ | ✅ |
| Write reviews | ✅ (enrolled only) | ✅ | ✅ | ✅ |
| Report content | ✅ | ✅ | ✅ | ✅ |
| Review reports | ❌ | ❌ | ✅ | ✅ |
| Approve courses | ❌ | ❌ | ❌ | ✅ |
| Manage users | ❌ | ❌ | ❌ | ✅ |
| Adjust wallets | ❌ | ❌ | ❌ | ✅ |
| Set exchange rates | ❌ | ❌ | ❌ | ✅ |

---

## 7. Architecture & Design

### 7.1 Technology Stack

**Frontend:**
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.1.1 | UI Framework |
| Vite | 7.1.7 | Build Tool |
| Tailwind CSS | 4.1.16 | Styling |
| React Router | 7.9.5 | Routing |
| Axios | 1.13.2 | HTTP Client |
| Socket.io Client | 4.8.1 | Real-time |
| Lucide React | 0.553.0 | Icons |
| date-fns | 4.1.0 | Date utilities |

**Backend:**
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express | 5.1.0 | Web Framework |
| Mongoose | 8.19.4 | MongoDB ODM |
| Socket.io | 4.8.1 | WebSockets |
| bcryptjs | 3.0.3 | Password Hashing |
| jsonwebtoken | 9.0.2 | JWT Tokens |
| Nodemailer | 7.0.10 | Email |
| Cloudinary | 1.41.3 | Media Storage |
| Zod | 4.1.12 | Validation |
| Helmet | 8.1.0 | Security Headers |
| Puppeteer | 24.34.0 | PDF Generation |

### 7.2 Folder Structure

```
learnoverse/
├── client/                     # React Frontend
│   ├── src/
│   │   ├── api/               # 13 API modules
│   │   ├── components/        # Reusable components
│   │   │   ├── qa/           # Q&A components
│   │   │   └── wallet/       # Wallet components
│   │   ├── contexts/         # SessionContext, WalletContext
│   │   ├── pages/            # 35 page directories
│   │   ├── router/           # Route definitions
│   │   ├── services/         # socketService.js
│   │   ├── styles/           # Custom CSS
│   │   └── utils/            # Helpers
│   └── public/
│
└── server/                    # Node.js Backend
    ├── src/
    │   ├── config/           # Cloudinary, Nodemailer
    │   ├── controllers/      # 19 controllers
    │   ├── db/               # MongoDB connection
    │   ├── errors/           # Custom error classes
    │   ├── middleware/       # Auth, validation, error handling
    │   ├── models/           # 24 Mongoose models
    │   ├── routers/          # 18 route files
    │   ├── services/         # Business logic
    │   ├── socket/           # Socket.io handlers
    │   ├── utils/            # JWT, email, hashing
    │   ├── validations/      # Zod schemas
    │   └── server.js         # Entry point
    └── uploads/              # Local file storage
```

---

## 8. Data Model

### 8.1 Core Entities (24 Models)

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER DOMAIN                              │
├─────────────────────────────────────────────────────────────────┤
│  User              │ RefreshToken                                │
│  - name, email     │ - userId, token, expiresAt                  │
│  - password, role  │                                             │
│  - demographics    │                                             │
│  - education       │                                             │
│  - social links    │                                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        COURSE DOMAIN                             │
├─────────────────────────────────────────────────────────────────┤
│  Course             │ Enrollment           │ Review              │
│  - title, desc      │ - user, course       │ - user, course      │
│  - lessons[]        │ - status, pointsPaid │ - courseRating      │
│  - pricePoints      │ - completedLessons   │ - instructorRating  │
│  - skillTags        │ - totalScore         │ - reviewText        │
│  - status, approval │                      │ - helpful votes     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                      ASSESSMENT DOMAIN                           │
├─────────────────────────────────────────────────────────────────┤
│  Evaluation          │ EvaluationQuestion   │ EvaluationSubmission│
│  - course, type      │ - evaluation, prompt │ - evaluation        │
│  - totalMarks        │ - maxMarks, order    │ - student, answers  │
│  - passingGrade      │                      │ - totalScore        │
│  - allowRetake       │                      │ - isPassed          │
│  - status            │                      │ - attemptNumber     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        WALLET DOMAIN                             │
├─────────────────────────────────────────────────────────────────┤
│  Wallet              │ Transaction          │ ExchangeRate        │
│  - userId            │ - userId, type       │ - currency, rate    │
│  - points_balance    │ - points_amount      │ - is_active         │
│  - reserved_points   │ - cash_amount        │ - effective_from    │
│  - total_earned      │ - status, payment    │                     │
│  - total_spent       │ - payment_reference  │ PayoutRequest       │
│                      │                      │ - points, cash      │
│                      │                      │ - payout_method     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                       COMMUNITY DOMAIN                           │
├─────────────────────────────────────────────────────────────────┤
│  Question            │ Answer               │ Vote                │
│  - title, body       │ - question, body     │ - user, targetType  │
│  - author, tags      │ - author, voteScore  │ - targetId, value   │
│  - voteScore, views  │ - isAccepted         │                     │
│                      │                      │                     │
│  Post                │ Tag                  │ Report              │
│  - user, text        │ - name, description  │ - reporter, type    │
│  - likes[], comments │ - usageCount         │ - category, status  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                        OTHER ENTITIES                            │
├─────────────────────────────────────────────────────────────────┤
│  Certificate         │ Notification         │ FileShare           │
│  - user, course      │ - user, type         │ - uploadedBy        │
│  - certificateNumber │ - title, message     │ - fileData, type    │
│  - issuedAt, status  │ - readAt             │ - courseId          │
│                      │                      │ - visibility        │
│  SkillSwapRequest    │ Payment              │                     │
│  - fromUser, toUser  │ - user, amount       │                     │
│  - offered, requested│ - status             │                     │
│  - status            │                      │                     │
└─────────────────────────────────────────────────────────────────┘
```

### 8.2 Key Relationships

| Relationship | Type | Description |
|--------------|------|-------------|
| User → Course | 1:N | Instructor creates courses |
| User → Enrollment | 1:N | Student enrolls in courses |
| Course → Enrollment | 1:N | Course has many enrollments |
| Course → Evaluation | 1:N | Course has assessments |
| Evaluation → Question | 1:N | Evaluation has questions |
| Evaluation → Submission | 1:N | Evaluation has student submissions |
| User → Wallet | 1:1 | Each user has one wallet |
| User → Transaction | 1:N | User has transaction history |
| User → Certificate | 1:N | User earns certificates |
| Question → Answer | 1:N | Q&A relationship |

---

## 9. API Endpoints

### 9.1 Authentication Routes (`/api/v1/auth`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /register | Register new user | Public |
| POST | /login | Login user | Public |
| POST | /logout | Logout user | Public |
| POST | /verify-email | Verify email token | Public |
| POST | /forgot-password | Request password reset | Public |
| POST | /reset-password | Reset password | Public |

### 9.2 User Routes (`/api/v1/users`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /showMe | Get current user | Required |
| PATCH | /updateUser | Update profile | Required |
| GET | /:id | Get user by ID | Required |

### 9.3 Course Routes (`/api/v1/courses`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | / | List courses | Public |
| POST | / | Create course | Instructor |
| GET | /:id | Get course details | Public |
| PATCH | /:id | Update course | Instructor |
| DELETE | /:id | Delete course | Instructor |
| POST | /:id/enroll-with-points | Enroll with points | Required |
| POST | /:id/evaluations | Create evaluation | Instructor |
| GET | /:id/evaluations | Get course evaluations | Required |

### 9.4 Wallet Routes (`/api/v1/wallet`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /balance | Get wallet balance | Required |
| GET | /transactions | Get transaction history | Required |
| GET | /exchange-rates | Get exchange rates | Required |
| POST | /buy-points | Purchase points | Required |
| POST | /sell-points | Request payout | Required |
| GET | /payouts | Get payout history | Required |

### 9.5 Evaluation Routes (`/api/v1/evaluations`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /:id | Get evaluation details | Required |
| PUT | /:id | Update evaluation | Instructor |
| POST | /:id/publish | Publish evaluation | Instructor |
| POST | /:id/close | Close evaluation | Instructor |
| POST | /:id/submit | Submit answers | Student |
| GET | /:id/submissions | Get all submissions | Instructor |
| GET | /:id/my-submission | Get own submission | Student |

### 9.6 Search Routes (`/api/v1/search`)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | / | Unified search | Public |
| GET | /suggestions | Autocomplete | Public |
| GET | /courses | Search courses | Public |
| GET | /questions | Search Q&A | Public |
| GET | /posts | Search posts | Public |
| GET | /users | Search users | Public |
| GET | /skill-swaps | Search skill swaps | Public |

---

## 10. Release Status

### Current Implementation Status (January 2026)

| Feature | Status | Notes |
|---------|--------|-------|
| Authentication | ✅ Complete | JWT, email verification, password reset |
| User Profiles | ✅ Complete | Full demographics, social links |
| Course Management | ✅ Complete | CRUD, lessons, admin approval |
| Enrollment | ✅ Complete | Points, free, skill swap |
| Wallet System | ✅ Complete | Buy/sell points, transactions |
| Assessments | ✅ Complete | Assignments, quizzes, grading |
| Certificates | ✅ Complete | Auto-generation, PDF, verification |
| Reviews | ✅ Complete | Ratings, helpful votes |
| Q&A Forum | ✅ Complete | Questions, answers, voting |
| Posts | ✅ Complete | Social feed, comments |
| Search | ✅ Complete | Multi-entity, filters |
| Reports | ✅ Complete | Content reporting, admin moderation |
| Notifications | ✅ Complete | Real-time via Socket.io |
| Live Sessions | ✅ Complete | Jitsi integration |
| File Sharing | ✅ Complete | Binary storage, visibility |
| Skill Swap | ✅ Complete | Request/accept workflow |
| Admin Tools | ✅ Complete | User management, wallet admin |

---

## 11. Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| User Adoption | 1,000+ users in 3 months | Registration count |
| Course Completion Rate | 70% | Completed / Enrolled |
| Monthly Active Users | 60% retention | Monthly login rate |
| Course Quality | 4.5+ average rating | Review scores |
| Platform Uptime | 99.9% | Monitoring |
| API Response Time | < 500ms p95 | APM metrics |
| Points Traded | 10,000+ monthly | Transaction volume |

---

## 12. Risk & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Email delivery failures | HIGH | MEDIUM | Queue-based retry, multiple SMTP providers |
| Database downtime | CRITICAL | LOW | MongoDB Atlas HA, backup strategy |
| Payment fraud | HIGH | MEDIUM | Mock payments currently; KYC for real payments |
| DDoS attacks | HIGH | LOW | Rate limiting, CDN protection |
| Data breach | CRITICAL | LOW | Encryption, secure token storage, audits |

---

## 13. Traceability Matrix

| Requirement | Client Components | Server Components |
|-------------|-------------------|-------------------|
| FR-1 Auth | `Login/`, `Register/`, `SessionContext.jsx` | `auth.controller.js`, `authenticate.js` |
| FR-2 Password Reset | `ForgotPassword/`, `ResetPassword/` | `auth.controller.js`, `sendResetPasswordEmail.js` |
| FR-3 Courses | `CreateCourse/`, `CourseDetails/`, `Courses/` | `course.controller.js`, `Course.js` |
| FR-4 Enrollment | `CourseDetails/`, `MyCourses/` | `course.controller.js`, `Enrollment.js` |
| FR-5 Wallet | `Wallet/`, `BuyPoints/`, `WalletContext.jsx` | `wallet.controller.js`, `Transaction.js` |
| FR-6 Assessments | `CreateEvaluation/`, `AttemptEvaluation/` | `evaluation.controller.js`, `Evaluation.js` |
| FR-7 Certificates | `Certificate/`, `Achievements/` | `certificate.controller.js`, `Certificate.js` |
| FR-8 Search | `Search/`, `SearchBar.jsx` | `search.controller.js`, `search.service.js` |
| FR-9 Q&A | `QA/`, `qa/` components | `qa.controller.js`, `Question.js`, `Answer.js` |
| FR-10 Posts | `Posts/` | `post.controller.js`, `Post.js` |
| FR-11 Reviews | `ReviewForm.jsx`, `ReviewList.jsx` | `review.controller.js`, `Review.js` |
| FR-12 Reports | `ReportButton.jsx`, `AdminReports/` | `report.controller.js`, `Report.js` |
| FR-13 Notifications | `Notifications/`, `socketService.js` | `notification.controller.js`, `socket/` |
| FR-14 Live Sessions | `LiveSession/` | `Course.js` (live subdoc) |
| FR-15 File Sharing | `FileShare.jsx` | `fileShare.controller.js`, `FileShare.js` |
| FR-16 Skill Swap | - | `skillSwap.controller.js`, `SkillSwapRequest.js` |
| FR-17 Admin | `AdminReports/` | `admin.controller.js`, `adminWallet.controller.js` |
| FR-18 Profiles | `Profile/`, `Settings/` | `user.controller.js`, `User.js` |

---

## 14. Document Control

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2026-01-13 | Dev Team | Complete rewrite based on codebase analysis; accurate feature status |
| 1.2 | 2026-01-07 | Dev Team | IEEE-style reorganization |
| 1.1 | 2025-12-03 | Dev Team | Sprint 1 status updates |
| 1.0 | 2025-12-02 | Dev Team | Initial SRS |

### Approval Sign-off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | | | |
| Engineering Lead | | | |
| QA Lead | | | |

---

## 15. Glossary

| Term | Definition |
|------|------------|
| **Course** | Educational content unit with lessons (video/text/live) |
| **Enrollment** | User's registration in a course |
| **Evaluation** | Assessment (assignment or quiz) within a course |
| **Points** | Virtual currency for course purchases |
| **Wallet** | User's points balance and transaction history |
| **Skill Swap** | Exchange of course access between instructors |
| **Certificate** | Digital proof of course completion |
| **Payout** | Converting points back to real currency |
| **Transaction** | Immutable record of points movement |
| **Exchange Rate** | Conversion ratio between currency and points |

---

*End of Software Requirements Specification*

