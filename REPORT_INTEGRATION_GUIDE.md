# Report Button Integration Examples

This file shows how to integrate the Report button and modal into various pages.

## 1. Course Details Page

Add to `client/src/pages/CourseDetails/page.jsx`:

```jsx
import { useState } from "react";
import ReportButton from "../../components/ReportButton";
import ReportModal from "../../components/ReportModal";

// Inside your component:
const [showReportModal, setShowReportModal] = useState(false);
const { user } = useSession(); // Make sure you have access to the current user

// Add this button near the course title or in the action buttons area:
{
  course && user && course.instructor?._id !== user.userId && (
    <ReportButton variant='text' onReport={() => setShowReportModal(true)} />
  );
}

// Add the modal at the end of your component's return statement:
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

## 2. Posts Page

Add to `client/src/pages/Posts/page.jsx`:

```jsx
import { useState } from "react";
import ReportButton from "../../components/ReportButton";
import ReportModal from "../../components/ReportModal";

// For each post card:
const [reportingPostId, setReportingPostId] = useState(null);
const { user } = useSession();

// Inside the post card rendering:
{
  post.user?._id !== user?.userId && (
    <ReportButton
      variant='icon'
      onReport={() => setReportingPostId(post._id)}
    />
  );
}

// Add the modal at the end:
{
  reportingPostId && (
    <ReportModal
      isOpen={!!reportingPostId}
      onClose={() => setReportingPostId(null)}
      reportType='post'
      reportedEntity={reportingPostId}
      reportedUser={posts.find((p) => p._id === reportingPostId)?.user?._id}
    />
  );
}
```

## 3. Profile Page (When viewing another user's profile)

Add to `client/src/pages/Profile/page.jsx`:

```jsx
import { useState } from "react";
import ReportButton from "../../components/ReportButton";
import ReportModal from "../../components/ReportModal";

const [showReportModal, setShowReportModal] = useState(false);
const { user: currentUser } = useSession();

// Add button near profile header (only if viewing someone else's profile):
{
  profileUser && currentUser && profileUser._id !== currentUser.userId && (
    <ReportButton variant='button' onReport={() => setShowReportModal(true)} />
  );
}

// Add modal:
{
  showReportModal && profileUser && (
    <ReportModal
      isOpen={showReportModal}
      onClose={() => setShowReportModal(false)}
      reportType='user'
      reportedEntity={profileUser._id}
      reportedUser={profileUser._id}
    />
  );
}
```

## 4. Q&A Question/Answer Page

Add to `client/src/pages/QA/QuestionDetailPage.jsx`:

```jsx
import { useState } from "react";
import ReportButton from "../../components/ReportButton";
import ReportModal from "../../components/ReportModal";

// For reporting questions (use 'post' type for questions/answers):
const [reportingQuestion, setReportingQuestion] = useState(false);
const [reportingAnswerId, setReportingAnswerId] = useState(null);

// Button next to question:
{
  question && user && question.user?._id !== user.userId && (
    <ReportButton variant='icon' onReport={() => setReportingQuestion(true)} />
  );
}

// Button next to each answer:
{
  answer.user?._id !== user?.userId && (
    <ReportButton
      variant='icon'
      onReport={() => setReportingAnswerId(answer._id)}
    />
  );
}

// Modals:
{
  reportingQuestion && question && (
    <ReportModal
      isOpen={reportingQuestion}
      onClose={() => setReportingQuestion(false)}
      reportType='post' // Using 'post' for questions
      reportedEntity={question._id}
      reportedUser={question.user?._id}
    />
  );
}

{
  reportingAnswerId && (
    <ReportModal
      isOpen={!!reportingAnswerId}
      onClose={() => setReportingAnswerId(null)}
      reportType='post' // Using 'post' for answers
      reportedEntity={reportingAnswerId}
      reportedUser={answers.find((a) => a._id === reportingAnswerId)?.user?._id}
    />
  );
}
```

## 5. Live Session Page

Add to `client/src/pages/LiveSession/page.jsx`:

```jsx
import { useState } from "react";
import ReportButton from "../../components/ReportButton";
import ReportModal from "../../components/ReportModal";

const [showReportModal, setShowReportModal] = useState(false);

// Add button in the live session controls:
<ReportButton
  variant='button'
  onReport={() => setShowReportModal(true)}
  className='ml-2'
/>;

// Add modal:
{
  showReportModal && lesson && (
    <ReportModal
      isOpen={showReportModal}
      onClose={() => setShowReportModal(false)}
      reportType='liveSession'
      reportedEntity={lesson._id}
      reportedUser={course?.instructor?._id}
    />
  );
}
```

## Important Notes:

1. **User Context**: Always check that the current user is not reporting their own content
2. **Entity IDs**: Make sure to pass the correct entity ID (course.\_id, post.\_id, user.\_id, etc.)
3. **Reported User**: For courses and live sessions, pass the instructor's ID. For posts/questions, pass the author's ID.
4. **Report Types**: Use 'course', 'post', 'user', or 'liveSession' as appropriate
5. **Button Variants**:
   - `icon`: Small flag icon (good for inline content)
   - `text`: Icon + "Report" text
   - `button`: Full button with border (good for prominent placement)

## Styling Tips:

You can customize the button appearance using the `className` prop:

```jsx
<ReportButton
  variant='icon'
  onReport={() => setShowReportModal(true)}
  className='opacity-50 hover:opacity-100'
/>
```
