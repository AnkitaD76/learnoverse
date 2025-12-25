# Rating & Review System - Complete Documentation

## 🎯 Overview

The Rating & Review System allows enrolled students to rate and review courses with separate ratings for the course and instructor. Features include half-star ratings (1-5 with 0.5 increments), optional written reviews, helpful/not helpful voting, sorting, pagination, and admin moderation.

---

## ✅ Features Implemented

### Core Features

- ✅ **Separate Ratings**: Students rate both course (1-5) and instructor (1-5) separately
- ✅ **Half-Star Support**: Ratings support 0.5 increments (1, 1.5, 2, 2.5, etc.)
- ✅ **Optional Review Text**: Written reviews are optional (max 2000 characters)
- ✅ **Enrollment Verification**: Only enrolled students can review
- ✅ **One Review Per Course**: Each student can submit one review per course
- ✅ **Edit & Delete**: Students can edit or delete their own reviews
- ✅ **Helpful Voting**: Other students can mark reviews as helpful or not helpful
- ✅ **Auto-publish**: Reviews publish immediately (admin can delete if needed)

### Display & Sorting

- ✅ **Average Ratings**: Display average course and instructor ratings
- ✅ **Review Count**: Show total number of reviews
- ✅ **Sort Options**: Newest, Oldest, Highest, Lowest, Most Helpful
- ✅ **Pagination**: Load reviews in batches of 10
- ✅ **Rating Distribution**: Visual breakdown of rating percentages

### Security & Validation

- ✅ **No Self-Review**: Instructors cannot review their own courses
- ✅ **No Self-Helpful**: Users cannot mark their own reviews as helpful
- ✅ **Enrollment Check**: Only enrolled students can submit reviews
- ✅ **Duplicate Prevention**: One review per user per course
- ✅ **Admin Moderation**: Admins can delete any review

---

## 📁 File Structure

### Backend Files

```
server/src/
├── models/
│   ├── Review.js                    # Review database schema
│   ├── Course.js                    # Updated with averageRating, reviewCount
│   ├── User.js                      # Updated with instructorAverageRating, instructorReviewCount
│   └── index.js                     # Exports Review model
├── controllers/
│   └── review.controller.js         # 9 controller functions
├── routers/
│   └── review.routes.js             # User + admin routes
├── validations/
│   └── review.validation.js         # Zod validation schemas
└── server.js                        # Added review routes

review-api-tests.http                # API testing file
```

### Frontend Files

```
client/src/
├── api/
│   └── reviews.js                   # 8 API client functions
├── components/
│   ├── StarRating.jsx               # Display & interactive star rating
│   ├── ReviewForm.jsx               # Create/edit review modal
│   ├── ReviewCard.jsx               # Single review display
│   └── ReviewList.jsx               # Paginated review list with sorting
└── pages/
    └── CourseDetails/
        └── page.jsx                 # Integrated review system
```

---

## 🔌 API Endpoints

### Public Routes

| Method | Endpoint                                        | Description                              |
| ------ | ----------------------------------------------- | ---------------------------------------- |
| `GET`  | `/api/v1/reviews/course/:courseId`              | Get all reviews for a course (paginated) |
| `GET`  | `/api/v1/reviews/course/:courseId/distribution` | Get rating distribution                  |

**Query Parameters** for `/course/:courseId`:

- `page` (default: 1)
- `limit` (default: 10, max: 50)
- `sortBy` (newest, oldest, highest, lowest, helpful)

### Authenticated Routes

| Method   | Endpoint                              | Description                              |
| -------- | ------------------------------------- | ---------------------------------------- |
| `POST`   | `/api/v1/reviews`                     | Create a review (enrolled students only) |
| `PATCH`  | `/api/v1/reviews/:id`                 | Update your review                       |
| `DELETE` | `/api/v1/reviews/:id`                 | Delete your review                       |
| `GET`    | `/api/v1/reviews/my-review/:courseId` | Get your review for a course             |
| `PATCH`  | `/api/v1/reviews/:id/helpful`         | Mark review as helpful/not helpful       |

### Admin Routes

| Method   | Endpoint                    | Description       |
| -------- | --------------------------- | ----------------- |
| `DELETE` | `/api/v1/reviews/admin/:id` | Delete any review |

---

## 📊 Database Schema

### Review Model

```javascript
{
  user: ObjectId (ref: User),              // Reviewer
  course: ObjectId (ref: Course),          // Course being reviewed
  courseRating: Number (1-5, 0.5 step),    // Course rating
  instructorRating: Number (1-5, 0.5 step),// Instructor rating
  reviewText: String (max: 2000),          // Optional review text
  helpfulCount: Number,                    // Number of helpful votes
  notHelpfulCount: Number,                 // Number of not helpful votes
  helpfulBy: [ObjectId],                   // Users who marked helpful
  notHelpfulBy: [ObjectId],                // Users who marked not helpful
  isEdited: Boolean,                       // Whether review was edited
  editedAt: Date,                          // Last edit timestamp
  createdAt: Date,                         // Created timestamp
  updatedAt: Date                          // Updated timestamp
}
```

**Indexes:**

- `{ user: 1, course: 1 }` (unique) - One review per user per course
- `{ helpfulCount: -1 }` - Sort by helpful
- `{ createdAt: -1 }` - Sort by date

### Updated Course Model

```javascript
{
  // ... existing fields
  averageRating: Number (0-5),    // Average course rating
  reviewCount: Number             // Total number of reviews
}
```

### Updated User Model (Instructors)

```javascript
{
  // ... existing fields
  instructorAverageRating: Number (0-5),  // Average instructor rating
  instructorReviewCount: Number           // Total reviews across all courses
}
```

---

## 🎨 Frontend Components

### 1. StarRating Component

**Props:**

- `rating` (number): Current rating value
- `onRatingChange` (function): Callback for rating changes
- `interactive` (boolean): Enable/disable clicking
- `size` ('sm' | 'md' | 'lg'): Star size
- `showValue` (boolean): Display numeric value

**Usage:**

```jsx
// Display only
<StarRating rating={4.5} size="md" showValue={true} />

// Interactive input
<StarRating
  rating={courseRating}
  onRatingChange={setCourseRating}
  interactive={true}
  size="lg"
/>
```

### 2. ReviewForm Component

**Props:**

- `isOpen` (boolean): Modal visibility
- `onClose` (function): Close callback
- `onSubmit` (function): Submit callback
- `initialData` (object): For editing existing review
- `isEditing` (boolean): Edit mode flag
- `courseName` (string): Display name
- `instructorName` (string): Display name

**Usage:**

```jsx
<ReviewForm
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  onSubmit={handleSubmitReview}
  courseName={course.title}
  instructorName={course.instructor.name}
/>
```

### 3. ReviewCard Component

**Props:**

- `review` (object): Review data
- `onEdit` (function): Edit callback
- `onDelete` (function): Delete callback
- `onMarkHelpful` (function): Helpful/not helpful callback
- `currentUserId` (string): Current user ID
- `isAdmin` (boolean): Admin flag

### 4. ReviewList Component

**Props:**

- `courseId` (string): Course ID
- `onEditReview` (function): Edit callback
- `onReviewDeleted` (function): Delete callback

---

## 🔄 Rating Calculation Logic

### Course Average Rating

1. Fetch all reviews for the course
2. Sum all `courseRating` values
3. Divide by number of reviews
4. Round to 1 decimal place
5. Update `course.averageRating` and `course.reviewCount`

### Instructor Average Rating

1. Fetch all courses by the instructor
2. Fetch all reviews for those courses
3. Sum all `instructorRating` values
4. Divide by total number of reviews
5. Round to 1 decimal place
6. Update `user.instructorAverageRating` and `user.instructorReviewCount`

**Triggered on:**

- Review created
- Review updated
- Review deleted

---

## 🧪 Testing Guide

### Test Workflow

1. **Setup**: Create a course and enroll a student
2. **Create Review**: Student submits rating + optional text
3. **View Reviews**: Verify review appears on course page
4. **Edit Review**: Student updates their review
5. **Helpful Voting**: Another user marks review as helpful
6. **Sort & Filter**: Test different sort options
7. **Rating Updates**: Verify course and instructor averages update
8. **Admin Delete**: Admin removes inappropriate review
9. **Student Delete**: Student removes their own review

### Test Cases

- ✅ Enrolled student can create review
- ✅ Non-enrolled user cannot create review
- ✅ Cannot create duplicate review
- ✅ Can edit own review
- ✅ Can delete own review
- ✅ Cannot mark own review as helpful
- ✅ Cannot review own course (instructor)
- ✅ Rating must be 1-5 with 0.5 increments
- ✅ Review text max 2000 characters
- ✅ Admin can delete any review
- ✅ Averages update correctly
- ✅ Pagination works
- ✅ Sorting works (all 5 options)

---

## 🚀 Usage Examples

### Creating a Review

```javascript
import { createReview } from "../api/reviews";

const handleSubmit = async () => {
  try {
    await createReview(
      courseId,
      4.5, // courseRating
      5.0, // instructorRating
      "Great course!" // reviewText (optional)
    );
  } catch (error) {
    console.error(error);
  }
};
```

### Fetching Reviews

```javascript
import { getCourseReviews } from "../api/reviews";

const loadReviews = async () => {
  const response = await getCourseReviews(courseId, {
    page: 1,
    limit: 10,
    sortBy: "helpful",
  });

  console.log(response.reviews);
  console.log(response.pagination);
};
```

### Marking Helpful

```javascript
import { markReviewHelpful } from "../api/reviews";

const handleHelpful = async (reviewId) => {
  await markReviewHelpful(reviewId, true); // true = helpful, false = not helpful
};
```

---

## 🎯 Key Features Summary

| Feature             | Status | Details                                 |
| ------------------- | ------ | --------------------------------------- |
| Separate Ratings    | ✅     | Course + Instructor rated separately    |
| Half-Stars          | ✅     | 0.5 increment support (1, 1.5, 2, etc.) |
| Optional Text       | ✅     | Review text not required                |
| Enrollment Check    | ✅     | Only enrolled students can review       |
| Edit/Delete         | ✅     | Users can manage their reviews          |
| Helpful Voting      | ✅     | Other users can vote on helpfulness     |
| Sorting             | ✅     | 5 sort options available                |
| Pagination          | ✅     | Load 10 reviews at a time               |
| Auto-publish        | ✅     | No approval needed                      |
| Admin Delete        | ✅     | Admins can remove any review            |
| Rating Distribution | ✅     | Visual breakdown of ratings             |

---

## 📝 Notes

- Reviews are **immutable by ID** - editing creates a new version with `isEdited: true`
- **Spam protection**: Consider rate limiting if needed
- **Notification**: Instructors could be notified of new reviews (future feature)
- **Instructor Responses**: Could add instructor reply feature (not currently implemented)
- **Verified Badge**: Could add "Verified Enrollment" badge (not currently implemented)

---

## 🐛 Common Issues

### Issue: "You have already reviewed this course"

**Solution**: Users can only submit one review per course. Use PATCH to update existing review.

### Issue: "You must be enrolled in this course"

**Solution**: Ensure user is enrolled before attempting to create review.

### Issue: Rating not in 0.5 increments

**Solution**: Ensure rating values are multiples of 0.5 (1, 1.5, 2, 2.5, etc.)

### Issue: Cannot mark review as helpful

**Solution**: Users cannot mark their own reviews as helpful. Log in with different account.

---

## 🎉 System Complete!

The Rating & Review System is fully functional and ready for production use. Students can share their experiences, instructors receive valuable feedback, and future students can make informed decisions based on peer reviews.

**Test the system at:** `http://localhost:5173/courses/:courseId`
