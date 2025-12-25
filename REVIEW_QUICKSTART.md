# Rating & Review System - Quick Start Guide

## 🚀 Quick Setup (System Already Integrated)

The Rating & Review System is **fully integrated** and ready to use! No additional setup required.

---

## 📖 How to Use

### For Students

#### 1. **View Course Ratings**

- Navigate to any course detail page
- See the average rating and review count at the top
- View the rating distribution breakdown

#### 2. **Write a Review**

After enrolling in a course:

1. Scroll to the "Share Your Experience" section
2. Click **"Write a Review"** button
3. Rate the course (1-5 stars, half-stars supported)
4. Rate the instructor separately (1-5 stars)
5. Optionally add written feedback (max 2000 characters)
6. Click **"Submit Review"**

#### 3. **Edit Your Review**

1. Find your review on the course page
2. Click **"Edit Review"** button
3. Update ratings or text
4. Click **"Update Review"**

#### 4. **Delete Your Review**

1. Click the trash icon (🗑️) on your review
2. Confirm deletion

#### 5. **Mark Reviews as Helpful**

- Click 👍 (thumbs up) if a review was helpful
- Click 👎 (thumbs down) if not helpful
- You cannot mark your own reviews

#### 6. **Browse Reviews**

- Sort by: Newest, Oldest, Highest, Lowest, Most Helpful
- Load more reviews with "Load More" button
- Read full reviews by clicking "Read more"

---

### For Instructors

#### **View Your Ratings**

- Your instructor rating is calculated from all reviews across all your courses
- Available in your profile (to be displayed)
- Each course shows its own average rating

#### **Note**

- You cannot review your own courses
- You can see all reviews students leave for your courses

---

### For Admins

#### **Moderate Reviews**

1. Navigate to any course page
2. View all reviews
3. Click the trash icon (🗑️) on any inappropriate review
4. Confirm deletion
5. Course and instructor ratings automatically recalculate

---

## 🎯 Feature Highlights

### ⭐ Half-Star Ratings

- **Interactive**: Click between stars for half-ratings (1, 1.5, 2, 2.5, etc.)
- **Display**: Shows precise ratings with half-filled stars

### 📝 Optional Review Text

- Reviews can be submitted with just ratings
- Text is helpful but not required
- Max 2000 characters

### 🔒 Security

- Only enrolled students can review
- One review per student per course
- Cannot review own courses
- Cannot mark own reviews as helpful

### 📊 Rating Calculation

- **Course Rating**: Average of all course ratings for that course
- **Instructor Rating**: Average of all instructor ratings across ALL their courses
- Updates automatically when reviews are created, edited, or deleted

---

## 🧪 Testing the System

### Test Scenario 1: Create a Review

```
1. Enroll in a course
2. Go to course detail page
3. Click "Write a Review"
4. Set course rating: 4.5 stars
5. Set instructor rating: 5 stars
6. Add text: "Great course! Very informative."
7. Submit
8. Verify review appears in list
9. Check course rating updated
```

### Test Scenario 2: Edit Review

```
1. Find your review on course page
2. Click "Edit Review"
3. Change course rating to 5 stars
4. Update text
5. Click "Update Review"
6. Verify changes appear
7. Notice "(edited)" label
```

### Test Scenario 3: Helpful Voting

```
1. Log in as different user
2. Find a review (not yours)
3. Click thumbs up 👍
4. Verify count increases
5. Click thumbs down 👎
6. Verify it switches
```

### Test Scenario 4: Sorting

```
1. Go to course with multiple reviews
2. Sort by "Most Helpful"
3. Verify order changes
4. Try other sort options
```

---

## 📡 API Endpoints Reference

### Create Review

```http
POST /api/v1/reviews
{
  "courseId": "course123",
  "courseRating": 4.5,
  "instructorRating": 5,
  "reviewText": "Optional feedback"
}
```

### Get Course Reviews

```http
GET /api/v1/reviews/course/:courseId?page=1&limit=10&sortBy=newest
```

### Update Review

```http
PATCH /api/v1/reviews/:reviewId
{
  "courseRating": 5,
  "reviewText": "Updated feedback"
}
```

### Mark Helpful

```http
PATCH /api/v1/reviews/:reviewId/helpful
{
  "helpful": true
}
```

### Delete Review

```http
DELETE /api/v1/reviews/:reviewId
```

---

## 🎨 UI Components Available

### StarRating

```jsx
import StarRating from './components/StarRating';

// Display only
<StarRating rating={4.5} size="md" showValue={true} />

// Interactive
<StarRating
  rating={rating}
  onRatingChange={setRating}
  interactive={true}
  size="lg"
/>
```

### ReviewForm

```jsx
import ReviewForm from "./components/ReviewForm";

<ReviewForm
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  onSubmit={handleSubmit}
  courseName='Introduction to React'
  instructorName='John Doe'
/>;
```

### ReviewList

```jsx
import ReviewList from "./components/ReviewList";

<ReviewList
  courseId={courseId}
  onEditReview={handleEdit}
  onReviewDeleted={handleDeleted}
/>;
```

---

## ❓ FAQ

### Q: Can I review a course before enrolling?

**A:** No, you must be enrolled to leave a review.

### Q: Can I leave multiple reviews for the same course?

**A:** No, only one review per student per course. You can edit your existing review.

### Q: How are instructor ratings calculated?

**A:** Instructor rating = average of all instructor ratings across ALL courses they teach.

### Q: Can I delete a review after submitting?

**A:** Yes, you can delete your own review anytime. Admins can also delete reviews.

### Q: Do reviews require approval?

**A:** No, reviews are published immediately. Admins can delete inappropriate content.

### Q: Can instructors reply to reviews?

**A:** Not currently implemented (potential future feature).

### Q: What happens to ratings when a review is deleted?

**A:** Course and instructor average ratings automatically recalculate.

### Q: Can I mark my own review as helpful?

**A:** No, only other users can vote on your review's helpfulness.

---

## 🎉 You're All Set!

The Rating & Review System is ready to use. Students can share feedback, instructors receive valuable insights, and future students can make informed decisions.

**Need help?** Check the full documentation: `REVIEW_SYSTEM_DOCS.md`
