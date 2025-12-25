# Evaluation System (Assignments & Quizzes)

## Overview

A comprehensive evaluation system for instructors to create assignments and quizzes, and for students to submit written responses and receive grades. The system includes:

- **Written-only evaluations** (no MCQ, no file uploads)
- **One submission per student** per evaluation
- **Immutable submissions** after submission
- **Immutable grades** after grading
- **Score-based course completion** with weighted evaluations
- **Automatic certificate issuance** when requirements are met

---

## System Architecture

### Backend (Express + MongoDB)

#### Models

1. **Evaluation** (`server/src/models/Evaluation.js`)

   - Represents an assignment or quiz
   - Fields: course, instructor, type, title, description, totalMarks, weight, status
   - Status: `draft` → `published` → `closed`
   - Immutable after publishing (except status changes)

2. **EvaluationQuestion** (`server/src/models/EvaluationQuestion.js`)

   - Written questions for evaluations
   - Fields: evaluation, prompt, maxMarks, order
   - Each question has a prompt and max marks

3. **EvaluationSubmission** (`server/src/models/EvaluationSubmission.js`)

   - Student's submission
   - Fields: evaluation, student, answers[], totalScore, feedback, status
   - One submission per student per evaluation (unique constraint)
   - Immutable after submission (only grading fields can be updated)
   - Grades immutable after grading

4. **Enrollment** (Enhanced)
   - Added `totalScore` field to track weighted evaluation scores

#### Controllers

**Evaluation Controller** (`server/src/controllers/evaluation.controller.js`)

**Instructor Endpoints:**

- `POST /api/v1/courses/:courseId/evaluations` - Create evaluation
- `PUT /api/v1/evaluations/:id` - Update draft evaluation
- `POST /api/v1/evaluations/:id/publish` - Publish evaluation
- `POST /api/v1/evaluations/:id/close` - Close evaluation
- `GET /api/v1/courses/:courseId/evaluations/instructor` - List evaluations with stats
- `GET /api/v1/evaluations/:id/submissions` - Get all submissions
- `POST /api/v1/submissions/:id/grade` - Grade a submission

**Student Endpoints:**

- `GET /api/v1/courses/:courseId/evaluations` - List available evaluations
- `GET /api/v1/evaluations/:id` - Get evaluation details
- `POST /api/v1/evaluations/:id/submit` - Submit answers
- `GET /api/v1/evaluations/:id/my-submission` - View own submission

#### Services

**Completion Service** (`server/src/services/completion.service.js`)

- `checkCourseCompletion()` - Checks if all requirements are met:
  - All lessons completed
  - Total evaluation score >= 50%
- `issueCertificateIfComplete()` - Issues certificate when eligible

---

## Frontend (React + Vite)

### API Client

**Evaluations API** (`client/src/api/evaluations.js`)

- All API functions for instructor and student flows
- Uses the existing `apiClient` with authentication

### Instructor Pages

1. **InstructorEvaluationsPage** (`client/src/pages/InstructorEvaluations/page.jsx`)

   - Lists all evaluations for a course
   - Shows submission counts and grading status
   - Actions: Edit draft, Publish, View submissions, Close

2. **CreateEvaluationPage** (`client/src/pages/CreateEvaluation/page.jsx`)

   - Form to create assignment or quiz
   - Dynamic question builder
   - Validates that question marks sum to total marks
   - Option to save as draft or publish immediately

3. **EvaluationSubmissionsPage** (`client/src/pages/EvaluationSubmissions/page.jsx`)
   - Two-column layout: submissions list + grading panel
   - View all submissions with status
   - Grade submissions with score and feedback
   - Irreversible grading confirmation

### Student Pages

1. **StudentEvaluationsPage** (`client/src/pages/StudentEvaluations/page.jsx`)

   - Lists evaluations with status indicators
   - Shows score if graded
   - Actions based on status: Start, View submission, or Closed

2. **AttemptEvaluationPage** (`client/src/pages/AttemptEvaluation/page.jsx`)

   - Display evaluation questions
   - Text area for each answer
   - Warning about one-time submission
   - Validates all questions answered

3. **ViewSubmissionPage** (`client/src/pages/ViewSubmission/page.jsx`)
   - Read-only view of submitted answers
   - Shows grade and feedback if graded
   - Status indicator (pending/graded)

### Routes

Added to `client/src/router/index.jsx`:

```javascript
// Instructor routes
/courses/:courseId/evaluations
/courses/:courseId/evaluations/create
/evaluations/:evaluationId/submissions

// Student routes
/courses/:courseId/student/evaluations
/evaluations/:evaluationId/attempt
/evaluations/:evaluationId/view
```

---

## Workflow

### Instructor Workflow

1. **Create Evaluation**

   - Navigate to course → Evaluations
   - Click "Create Evaluation"
   - Fill form: type, title, description, weight, total marks
   - Add questions with prompts and max marks
   - Save as draft or publish immediately

2. **Publish Evaluation**

   - Review draft evaluation
   - Ensure weight is set and questions are correct
   - Click "Publish" (irreversible)
   - Students can now see and submit

3. **Grade Submissions**

   - View submissions for an evaluation
   - Select a submission to review
   - Read student's answers
   - Assign total score and optional feedback
   - Submit grade (irreversible)

4. **Close Evaluation**
   - Prevent further submissions
   - Useful after deadline

### Student Workflow

1. **View Evaluations**

   - Navigate to course → Evaluations
   - See list of published evaluations
   - Check status: Not started, Submitted, or Graded

2. **Attempt Evaluation**

   - Click "Start" on an evaluation
   - Read questions carefully
   - Type answers in text areas
   - Submit (one-time only, irreversible)

3. **View Results**
   - After grading, view score and feedback
   - Review submitted answers

---

## Scoring & Completion

### Score Calculation

Each evaluation has a **weight** (percentage contribution to total score).

**Formula:**

```
Weighted Score = (Student Score / Total Marks) × Weight
Total Course Score = Sum of all weighted scores
```

**Example:**

- Assignment 1: 80/100 marks, 30% weight → 24%
- Quiz 1: 45/50 marks, 20% weight → 18%
- Assignment 2: 90/100 marks, 30% weight → 27%
- Quiz 2: 40/50 marks, 20% weight → 16%
- **Total: 85%**

### Course Completion

A course is complete when:

1. ✅ All lessons are completed
2. ✅ Total evaluation score >= 50%

When both conditions are met, a certificate is automatically issued.

---

## Security & Validation

### Backend Validation

1. **Evaluation Creation**

   - Only course instructor or admin can create
   - Weight must be between 0-100
   - Total marks must be > 0
   - Questions required before publishing

2. **Submission**

   - Only enrolled students can submit
   - Only one submission per student per evaluation
   - Evaluation must be published (not draft or closed)
   - All questions must be answered

3. **Grading**

   - Only instructor or admin can grade
   - Score must be between 0 and totalMarks
   - Cannot modify grade after grading

4. **Immutability**
   - Published evaluations cannot be edited
   - Submitted answers cannot be edited
   - Grades cannot be modified after grading

### Frontend Validation

- Form validation for required fields
- Confirmation dialogs for irreversible actions
- Client-side checks before submission
- Character count for text areas

---

## Database Indexes

Optimized queries with indexes:

```javascript
// Evaluation
{ course: 1, createdAt: -1 }
{ instructor: 1, createdAt: -1 }
{ course: 1, status: 1 }

// EvaluationQuestion
{ evaluation: 1, order: 1 }

// EvaluationSubmission
{ student: 1, evaluation: 1 } // unique
{ evaluation: 1, status: 1 }
```

---

## Testing

### API Testing

Use `server/evaluation-api-tests.http` with REST Client extension:

1. Set variables: `instructorToken`, `studentToken`, `courseId`
2. Test instructor flow: Create → Publish → Grade
3. Test student flow: View → Submit → View results
4. Test error cases: Duplicate submission, edit after publish, etc.

### Manual Testing Checklist

- [ ] Instructor creates draft evaluation
- [ ] Instructor publishes evaluation
- [ ] Student sees published evaluation
- [ ] Student submits answers
- [ ] Second submission attempt fails
- [ ] Instructor grades submission
- [ ] Re-grading attempt fails
- [ ] Student sees score and feedback
- [ ] Total score updates in enrollment
- [ ] Certificate issues when score >= 50%

---

## Integration with Existing Features

### Certificate System

- Updated `certificate.controller.js` to use completion service
- Checks both lesson completion and evaluation scores
- Returns completion status with reason

### Enrollment

- Added `totalScore` field
- Recalculated after each grading
- Used for course completion check

---

## Future Enhancements

Possible improvements (not implemented):

- [ ] Question banks and reusable questions
- [ ] Per-question grading (instead of total score only)
- [ ] Rubrics for structured grading
- [ ] Peer review functionality
- [ ] Plagiarism detection
- [ ] Timed evaluations
- [ ] Auto-save drafts for students
- [ ] Export submissions to CSV
- [ ] Analytics dashboard for instructors
- [ ] Email notifications for grading

---

## Files Created/Modified

### Backend

**Created:**

- `server/src/models/Evaluation.js`
- `server/src/models/EvaluationQuestion.js`
- `server/src/models/EvaluationSubmission.js`
- `server/src/controllers/evaluation.controller.js`
- `server/src/routers/evaluation.routes.js`
- `server/src/services/completion.service.js`
- `server/evaluation-api-tests.http`

**Modified:**

- `server/src/models/index.js` - Exported new models
- `server/src/models/Enrollment.js` - Added totalScore field
- `server/src/server.js` - Registered evaluation routes
- `server/src/controllers/certificate.controller.js` - Integrated completion service

### Frontend

**Created:**

- `client/src/api/evaluations.js`
- `client/src/pages/InstructorEvaluations/page.jsx`
- `client/src/pages/CreateEvaluation/page.jsx`
- `client/src/pages/EvaluationSubmissions/page.jsx`
- `client/src/pages/StudentEvaluations/page.jsx`
- `client/src/pages/AttemptEvaluation/page.jsx`
- `client/src/pages/ViewSubmission/page.jsx`

**Modified:**

- `client/src/router/index.jsx` - Added evaluation routes

---

## Summary

The Evaluation System provides a complete solution for written assessments with:

✅ Instructor authoring and grading tools
✅ Student submission and feedback interface
✅ Score-based course completion
✅ Automatic certificate issuance
✅ Strong security and data integrity
✅ Clean separation of concerns
✅ Follows existing project patterns

The system is production-ready and fully integrated with the existing course, enrollment, and certificate features.
