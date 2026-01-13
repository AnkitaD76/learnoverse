# 3. System Requirements

This section lists the **Functional Requirements (FR)** and **Non-Functional Requirements (NFR)** for the **Learnoverse** system, written in a structured “shall” format.

---

## 3.1 Functional Requirements

### 3.1.1 Authentication & Authorization

**Account Registration & Email Verification**
- **FR-1:** The system shall allow users to register using name, email, and password.
- **FR-2:** The system shall generate a time-bound email verification token and send a verification email during registration.
- **FR-3:** The system shall prevent login until the user’s email is verified.
- **FR-4:** The system shall invalidate email verification tokens after a configurable expiration period.

**Login / Logout / Session Handling**
- **FR-5:** The system shall authenticate users using email and password.
- **FR-6:** The system shall issue a signed JWT access token for authenticated sessions.
- **FR-7:** The system shall store the session token in an HTTP-only cookie and support Authorization header tokens for API calls.
- **FR-8:** The system shall support logout by invalidating/clearing authentication cookies.
- **FR-9:** The system shall block access to protected endpoints when the token is missing, invalid, or expired.

**Password Recovery**
- **FR-10:** The system shall allow users to request password reset using their email.
- **FR-11:** The system shall generate a time-bound password reset token and send it to the user via email.
- **FR-12:** The system shall store only a hashed version of the password reset token in the database.
- **FR-13:** The system shall allow a user to reset their password only if the reset token is valid and unexpired.

**Role-Based Access Control (RBAC)**
- **FR-14:** The system shall support role-based access control for at least the roles: student, instructor, moderator, and admin.
- **FR-15:** The system shall restrict access to administrative operations (e.g., user management, wallet administration) to authorized roles only.
- **FR-16:** The system shall provide role-appropriate navigation and dashboards in the client application.

---

### 3.1.2 Course Lifecycle & Learning Experience

**Course Browsing & Discovery**
- **FR-17:** The system shall allow users to browse published courses.
- **FR-18:** The system shall allow users to search courses using keyword search.
- **FR-19:** The system shall allow users to filter courses by skill tags, price range, level, and instructor.

**Course Creation & Publishing**
- **FR-20:** The system shall allow instructors to create new courses with title, description, category, level, price in points, and skill tags.
- **FR-21:** The system shall support a course approval workflow in which a course can be pending, approved, or rejected.
- **FR-22:** The system shall allow only approved courses to be published for enrollment.

**Lesson Delivery**
- **FR-23:** The system shall support course lessons of type video, text, and live session.
- **FR-24:** The system shall track learner progress by recording completed lesson identifiers per enrollment.

---

### 3.1.3 Enrollment & Access Control

**Enrollment Options**
- **FR-25:** The system shall allow a student to enroll in a course.
- **FR-26:** The system shall support enrollment payment methods including FREE, POINTS, and SKILL_SWAP.
- **FR-27:** The system shall prevent access to restricted course content unless the user is enrolled.

**Withdrawals & Refunds**
- **FR-28:** The system shall allow a student to withdraw from a course.
- **FR-29:** The system shall record withdrawal/refund state transitions for enrollments.

---

### 3.1.4 Wallet, Points, and Transactions

**Wallet Balance & History**
- **FR-30:** The system shall maintain a wallet for each user with points balance, reserved points, and available balance.
- **FR-31:** The system shall provide transaction history with pagination and filters.
- **FR-32:** The system shall treat the transaction ledger as the source of truth for balance changes.

**Buy Points (Mock Payment Processing)**
- **FR-33:** The system shall allow users to purchase points using supported payment methods: CARD, BKASH, PAYPAL, BANK_TRANSFER.
- **FR-34:** The system shall create a PENDING purchase transaction prior to payment processing.
- **FR-35:** The system shall mark transactions COMPLETED on successful payment simulation and FAILED on unsuccessful simulation.
- **FR-36:** The system shall credit purchased points to the user wallet only for COMPLETED purchase transactions.

**Sell Points (Mock Payout Requests)**
- **FR-37:** The system shall allow users to request selling points for cash via payout methods: BANK_TRANSFER, BKASH, PAYPAL, CARD.
- **FR-38:** The system shall enforce a minimum points threshold for payout requests.
- **FR-39:** The system shall escrow/debit points immediately when a payout request is created.
- **FR-40:** The system shall create a compensating reversal transaction if a payout fails.

**Exchange Rates**
- **FR-41:** The system shall support exchange rates per currency (USD, BDT, EUR, GBP) for converting cash to points and vice versa.
- **FR-42:** The system shall preserve historical exchange rates for auditability.

---

### 3.1.5 Assessments (Evaluations) & Grading

**Evaluation Management**
- **FR-43:** The system shall allow instructors to create evaluations of type assignment or quiz for a course.
- **FR-44:** The system shall allow evaluations to have multiple written-answer questions with per-question max marks.
- **FR-45:** The system shall enforce that the sum of question marks equals the evaluation total marks.
- **FR-46:** The system shall support evaluation lifecycle states: draft, published, closed.

**Student Submission & Retakes**
- **FR-47:** The system shall allow enrolled students to submit answers to published evaluations only.
- **FR-48:** The system shall prevent multiple concurrent submissions when a prior submission is not yet graded.
- **FR-49:** The system shall support retake attempts when allowed, with optional maximum retake limits.

**Grading & Pass/Fail**
- **FR-50:** The system shall allow authorized instructors to grade submissions by assigning total score and feedback.
- **FR-51:** The system shall compute pass/fail based on evaluation passing grade percentage.
- **FR-52:** The system shall prevent modification of a submission once it has been graded.

---

### 3.1.6 Certificates & Completion

- **FR-53:** The system shall issue a certificate for a user upon meeting course completion criteria.
- **FR-54:** The system shall generate a unique certificate number per issued certificate.
- **FR-55:** The system shall support certificate verification by certificate number.
- **FR-56:** The system shall support certificate revocation.

---

### 3.1.7 Community, Social, and Moderation

**Q&A (Questions and Answers)**
- **FR-57:** The system shall allow authenticated users to post questions with title, body, and tags.
- **FR-58:** The system shall allow users to post answers to questions.
- **FR-59:** The system shall support voting for Q&A content and track vote score.
- **FR-60:** The system shall support marking one answer as accepted for a question.

**Community Posts**
- **FR-61:** The system shall allow users to create posts and view a feed.
- **FR-62:** The system shall support liking/unliking posts.
- **FR-63:** The system shall support comments on posts.

**Reviews & Ratings**
- **FR-64:** The system shall allow enrolled students to rate a course and instructor using half-star increments.
- **FR-65:** The system shall enforce one review per user per course.
- **FR-66:** The system shall allow users to mark reviews as helpful or not helpful.

**Reporting & Admin Moderation**
- **FR-67:** The system shall allow users to report content of types course, post, user, live session, or review.
- **FR-68:** The system shall allow moderators/admins to review reports and mark outcomes (reviewed, dismissed, action taken).

---

### 3.1.8 Notifications, Live Sessions, and File Sharing

**Notifications**
- **FR-69:** The system shall create and store notifications for users.
- **FR-70:** The system shall allow users to view notifications and mark them as read.

**Live Sessions (Jitsi)**
- **FR-71:** The system shall support live lessons through Jitsi integration using room names and join codes.

**File Sharing**
- **FR-72:** The system shall allow users to upload and share files associated with a course.
- **FR-73:** The system shall support file visibility levels: private, course, public.
- **FR-74:** The system shall track file downloads.

---

### 3.1.9 Skill Swap

- **FR-75:** The system shall allow users to create skill swap requests that exchange access between an offered course and a requested course.
- **FR-76:** The system shall allow recipients to accept or reject skill swap requests.

---

## 3.2 Non-Functional Requirements

### 3.2.1 Performance Requirements
- **NFR-1:** The system shall support paginated API responses for list endpoints to prevent performance degradation on large datasets.
- **NFR-2:** Search endpoints shall return results within a defined time budget (e.g., ≤ 1 second under normal load).
- **NFR-3:** The system shall support multiple concurrent Socket.io connections for real-time features without significant degradation.

---

### 3.2.2 Security Requirements
- **NFR-4:** All communication between client and server shall occur over HTTPS (TLS) in production deployments.
- **NFR-5:** The system shall store passwords only as cryptographic hashes (bcrypt).
- **NFR-6:** The system shall store authentication tokens in HTTP-only cookies to reduce XSS token theft risk.
- **NFR-7:** The system shall validate all externally supplied inputs at the API boundary using schema validation.
- **NFR-8:** The system shall implement rate limiting on sensitive endpoints (e.g., login, password reset).
- **NFR-9:** The system shall enforce RBAC checks on protected endpoints.

---

### 3.2.3 Reliability & Availability
- **NFR-10:** The system shall maintain graceful error handling via centralized error middleware.
- **NFR-11:** The system shall provide daily database backups in production environments.
- **NFR-12:** The system shall maintain availability targets (e.g., 99.9% uptime) excluding scheduled maintenance.

---

### 3.2.4 Maintainability
- **NFR-13:** The codebase shall follow consistent naming conventions and module organization.
- **NFR-14:** The system shall keep API route definitions, controllers, and models separated for maintainability.
- **NFR-15:** Documentation of APIs, data models, and architecture shall be kept current.

---

### 3.2.5 Scalability
- **NFR-16:** The server shall be stateless with respect to user sessions to enable horizontal scaling.
- **NFR-17:** The database schema shall include indexes on frequently queried fields to support scaling.
- **NFR-18:** The system architecture shall accommodate horizontal scaling of the Node.js application and MongoDB cluster with minimal reconfiguration.
