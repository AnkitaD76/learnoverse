# 3. System Requirements

This section lists the **Functional Requirements (FR)** and **Non-Functional Requirements (NFR)** for the **Learnoverse** system, written in a structured "shall" format.

---

## 3.1 Functional Requirements

### 3.1.1 Authentication & Authorization
- **FR_1 - User Registration:** The system shall allow users to register with email/password validation, generate time-bound email verification tokens, and prevent login until verified.
- **FR_2 - User Authentication & Session:** The system shall authenticate users via email/password, issue JWT access tokens, store tokens in HTTP-only cookies, and support logout with cookie invalidation.
- **FR_3 - Password Recovery:** The system shall allow password recovery via time-bound email reset tokens and secure password reset functionality.
- **FR_4 - Role-Based Access Control:** The system shall support role-based access control (Student, Instructor, Moderator, Admin) with role-specific dashboards and restrict admin operations to authorized roles only.

### 3.1.2 Course Management
- **FR_5 - Course Creation & Approval:** The system shall allow instructors to create courses with title, description, category, level, price in points, and skill tags, subject to approval workflow (pending/approved/published).
- **FR_6 - Course Discovery & Search:** The system shall allow users to browse and search courses using keyword search, filtering by skill tags, price range, level, and instructor.
- **FR_7 - Lesson Delivery & Progress:** The system shall support course lessons of type video, text, and live session, and track learner progress per enrollment.

### 3.1.3 Enrollment & Access Control
- **FR_8 - Course Enrollment:** The system shall allow students to enroll in courses using FREE, POINTS, or SKILL_SWAP payment methods and prevent access to restricted content unless enrolled.
- **FR_9 - Course Withdrawal:** The system shall allow students to withdraw from courses and record withdrawal/refund state transitions.

### 3.1.4 Wallet & Point-Based Economy
- **FR_10 - Wallet Management:** The system shall maintain a wallet for each user with point balances, reserved points, and available balance; treat the transaction ledger as the source of truth.
- **FR_11 - Buy Points:** The system shall allow users to buy points using CARD, BKASH, PAYPAL, or BANK_TRANSFER with PENDING/COMPLETED/FAILED transaction states.
- **FR_12 - Sell Points & Payout:** The system shall allow users to sell points for cash via payout requests (with minimum thresholds), escrow points, handle reversals, and maintain historical exchange rates (USD, BDT, EUR, GBP).
- **FR_13 - Transaction History:** The system shall provide transaction history with pagination and filtering.

### 3.1.5 Assessments & Grading
- **FR_14 - Evaluation Creation:** The system shall allow instructors to create evaluations (assignment/quiz) with multiple written-answer questions and lifecycle states (draft/published/closed).
- **FR_15 - Student Submission & Retakes:** The system shall allow enrolled students to submit answers to published evaluations, support retakes with optional limits, and prevent concurrent submissions while grading.
- **FR_16 - Instructor Grading:** The system shall allow instructors to grade submissions with scores/feedback, compute pass/fail based on passing grade percentage, and prevent modification after grading.

### 3.1.6 Certificates & Completion
- **FR_17 - Certificate Issuance & Verification:** The system shall issue certificates upon course completion criteria being met, generate unique certificate numbers, support certificate verification and revocation.

### 3.1.7 Community & Social Features
- **FR_18 - Q&A & Community Posts:** The system shall support Q&A functionality (post questions/answers, vote, mark accepted answers) and community posts (create, like, comment).
- **FR_19 - Course Reviews & Ratings:** The system shall allow enrolled students to rate courses/instructors (half-star increments) with one review per user per course and mark reviews as helpful/unhelpful.

### 3.1.8 Reporting & Moderation
- **FR_20 - Content Reporting & Moderation:** The system shall allow users to report content (course, post, user, live session, review) and allow moderators/admins to review reports and mark outcomes.

### 3.1.9 Notifications, Live Sessions & File Sharing
- **FR_21 - Notifications & Live Sessions:** The system shall create/store notifications, allow users to view and mark them as read, and support Jitsi-based live lessons with room names and join codes.
- **FR_22 - File Upload & Sharing:** The system shall allow users to upload and share files (private/course/public visibility levels) and track file downloads.

---

## 3.2 Non-Functional Requirements

### 3.2.1 Performance & Optimization
- **NFR_1 - Performance & Indexing:** The system shall support paginated API responses and database indexing on frequently queried fields to ensure search results return within ≤ 1 second under normal load and maintain responsiveness with large datasets.
- **NFR_2 - Real-time Concurrency:** The system shall support multiple concurrent Socket.io connections for real-time features (messaging, live sessions, notifications) without significant performance degradation.

### 3.2.2 Security
- **NFR_3 - Data Protection & Encryption:** All communication between client and server shall occur over HTTPS (TLS) in production; passwords shall be stored as bcrypt hashes; authentication tokens shall be stored in HTTP-only cookies.
- **NFR_4 - Input Validation & Access Control:** The system shall validate all externally supplied inputs at the API boundary using schema validation, implement rate limiting on sensitive endpoints (login, password reset), and enforce RBAC checks on protected endpoints.

### 3.2.3 Reliability & Availability
- **NFR_5 - Error Handling & Backup:** The system shall maintain graceful error handling via centralized error middleware, provide daily database backups in production, and maintain 99.9% availability targets excluding scheduled maintenance.

### 3.2.4 Scalability & Architecture
- **NFR_6 - Horizontal Scalability:** The server shall be stateless with respect to user sessions to enable horizontal scaling of the Node.js application and MongoDB cluster with minimal reconfiguration.

### 3.2.5 Maintainability & Documentation
- **NFR_7 - Code Quality & Documentation:** The codebase shall follow consistent naming conventions, separate API routes/controllers/models for maintainability, and maintain current documentation of APIs, data models, and architecture.
