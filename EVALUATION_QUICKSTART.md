# Evaluation System - Quick Start Guide

## Getting Started

The Evaluation System is now integrated into your Learnoverse platform. Follow these steps to start using it.

---

## For Instructors

### 1. Access Evaluations

Navigate to one of your courses and look for the "Evaluations" or "Assignments & Quizzes" section in the course management area.

### 2. Create Your First Evaluation

1. Click **"Create Evaluation"**
2. Choose type: **Assignment** or **Quiz**
3. Fill in basic information:

   - **Title**: e.g., "Final Project"
   - **Description**: Instructions for students
   - **Total Marks**: e.g., 100
   - **Weight**: e.g., 30 (means 30% of total course score)

4. Add questions:

   - Click **"Add Question"**
   - Enter question prompt
   - Set max marks for each question
   - Ensure total of all question marks = Total Marks

5. Choose option:
   - ✅ Save as draft (can edit later)
   - ⬜ Uncheck to publish immediately

### 3. Publish Evaluation

- Review your draft evaluation
- Click **"Publish"**
- ⚠️ **Warning**: Cannot edit after publishing!

### 4. Grade Submissions

1. Go to evaluation → **"View Submissions"**
2. Click on a student's submission
3. Read their answers
4. Enter total score (0 to max marks)
5. Add feedback (optional but recommended)
6. Click **"Submit Grade"**
7. ⚠️ **Warning**: Grades cannot be changed!

### 5. Close Evaluation

- Click **"Close"** on a published evaluation
- No more submissions will be accepted
- Existing submissions can still be graded

---

## For Students

### 1. View Available Evaluations

Navigate to your enrolled course and find the "Assignments & Quizzes" section.

### 2. Start an Evaluation

1. Click **"Start"** on an evaluation
2. Read the description and instructions
3. Answer all questions in the text boxes
4. Review your answers
5. Click **"Submit Evaluation"**
6. ⚠️ **Warning**: You can only submit once!

### 3. View Your Results

- After instructor grades your submission:
  - See your score
  - Read instructor feedback
  - Review your submitted answers

---

## Understanding Scores

### How Scores Work

Each evaluation has a **weight** that determines its contribution to your total course score.

**Example:**

- Assignment 1: You scored 85/100, weight is 30%
  - Your contribution: (85/100) × 30 = 25.5%
- Quiz 1: You scored 40/50, weight is 20%
  - Your contribution: (40/50) × 20 = 16%
- **Your Total**: 25.5% + 16% = 41.5%

### Course Completion

To complete a course and earn a certificate:

1. ✅ Complete all lessons
2. ✅ Achieve at least **50% total score** from evaluations

If both conditions are met, your certificate is automatically issued!

---

## Best Practices

### For Instructors

✅ **DO:**

- Set clear, specific questions
- Provide detailed descriptions
- Give meaningful feedback when grading
- Set reasonable weights (total should typically be 100%)
- Review drafts before publishing

❌ **DON'T:**

- Publish without reviewing questions
- Set weight to 0 (evaluation won't count)
- Make question marks sum differ from total marks
- Forget to grade submissions promptly

### For Students

✅ **DO:**

- Read questions carefully
- Answer all questions completely
- Review before submitting
- Check for spelling and grammar
- Be specific and detailed in answers

❌ **DON'T:**

- Submit without reviewing
- Leave questions blank
- Rush through the evaluation
- Submit partial answers

---

## Common Issues

### "Cannot publish evaluation"

- **Cause**: Weight not set or questions missing
- **Fix**: Ensure weight > 0 and at least one question exists

### "Cannot submit evaluation"

- **Cause**: Not all questions answered
- **Fix**: Check that every question has a response

### "You have already submitted"

- **Cause**: Only one submission allowed
- **Fix**: None - contact instructor if you need to resubmit

### "Cannot edit evaluation"

- **Cause**: Evaluation is already published
- **Fix**: None - published evaluations are locked

### "Certificate not issued"

- **Cause**: Either lessons incomplete or score < 50%
- **Fix**: Complete remaining lessons and/or improve scores

---

## Tips for Success

### For Instructors

1. **Plan your evaluations early** in the course design
2. **Distribute weight logically**:
   - Major assignments: 20-40% each
   - Quizzes: 10-20% each
   - Ensure total weight across all evaluations = 100%
3. **Be consistent** in grading across students
4. **Provide actionable feedback** to help students learn
5. **Grade promptly** so students know their progress

### For Students

1. **Start early** - don't wait until the deadline
2. **Read all questions first** before starting
3. **Manage your time** across questions
4. **Be thorough** - quality over speed
5. **Show your understanding** - explain concepts in your own words
6. **Proofread** before submitting

---

## Example: Creating a Good Evaluation

### Assignment: "Web Application Development"

**Type**: Assignment  
**Total Marks**: 100  
**Weight**: 40%  
**Description**:

```
Create a comprehensive web application that demonstrates your understanding
of full-stack development. Answer the following questions about your design
decisions and implementation.
```

**Questions**:

1. **Prompt**: "Describe your application's architecture. What technologies did you choose and why?"

   - **Max Marks**: 25

2. **Prompt**: "Explain your database schema design. How did you ensure data integrity?"

   - **Max Marks**: 25

3. **Prompt**: "What security measures did you implement? Describe at least three."

   - **Max Marks**: 25

4. **Prompt**: "Discuss the challenges you faced and how you overcame them."
   - **Max Marks**: 25

**Total**: 25 + 25 + 25 + 25 = 100 ✅

---

## Need Help?

- Check the full documentation: `EVALUATION_SYSTEM.md`
- Test API endpoints: `server/evaluation-api-tests.http`
- Contact system administrator for technical issues

---

## Summary

The Evaluation System provides:

- ✅ Written assignments and quizzes
- ✅ One-time submissions
- ✅ Instructor grading with feedback
- ✅ Weighted scoring for course completion
- ✅ Automatic certificate issuance

Start creating evaluations to assess your students' understanding and provide meaningful feedback!
