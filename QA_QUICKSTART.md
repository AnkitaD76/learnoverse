# Q&A System Quick Start Guide

## 🚀 Getting Started

The Community Q&A system is now fully integrated into Learnoverse. Here's how to use it:

---

## 📍 Navigation

Access the Q&A system through:

- **Header Menu**: Click "Q&A" in the navigation bar
- **Direct URL**: `/qa`

---

## 👤 User Roles & Permissions

### Public Users (Not Logged In):

- ✅ Browse questions
- ✅ Search and filter
- ✅ View answers
- ❌ Ask questions
- ❌ Answer questions
- ❌ Vote

### Authenticated & Verified Users:

- ✅ All public permissions
- ✅ Ask questions
- ✅ Answer questions
- ✅ Vote on questions and answers
- ✅ Edit own content
- ✅ Delete own content

### Question Authors:

- ✅ Accept/unaccept answers on their questions
- ✅ Edit question details
- ✅ Delete questions

### Admins:

- ✅ Delete any content
- ✅ Moderate the Q&A system

---

## 📝 Asking a Question

1. Click **"Ask Question"** button on Q&A page
2. Fill in the form:
   - **Title**: Clear, specific question (min 10 chars)
   - **Body**: Detailed description with code examples (min 20 chars)
   - **Tags**: Comma-separated topics (e.g., "javascript, react, hooks")
3. Click **"Post Question"**

### Tips for Good Questions:

✅ Be specific and clear
✅ Include what you've tried
✅ Add relevant code snippets
✅ Use appropriate tags
✅ Search first to avoid duplicates

---

## 💬 Answering Questions

1. Navigate to a question detail page
2. Scroll to "Your Answer" section
3. Write your answer using Markdown
4. Preview before posting
5. Click **"Post Your Answer"**

### Tips for Good Answers:

✅ Be thorough and accurate
✅ Include code examples
✅ Explain your reasoning
✅ Format with Markdown for readability

---

## 🗳️ Voting System

### How to Vote:

- Click **▲** to upvote (helpful content)
- Click **▼** to downvote (unhelpful/incorrect content)
- Click again to remove your vote

### Rules:

- ❌ Cannot vote on your own content
- ✅ Can change your vote
- ✅ Votes are anonymous

### Reputation Impact:

- **Upvote received**: +5 reputation
- **Downvote received**: -2 reputation
- **Answer accepted**: +10 reputation (one-time)

---

## ✅ Accepting Answers

**Only question authors can accept answers.**

1. Navigate to your question
2. Find the best answer
3. Click **"Accept Answer"**
4. The answer gets a green badge and moves to the top

**Benefits:**

- Helps future users find the solution
- Rewards the answerer with +10 reputation
- Marks your question as solved

---

## 🔍 Searching & Filtering

### Search:

- Type keywords in the search box
- Searches both titles and question bodies

### Sort Options:

- **Newest**: Recently asked questions
- **Most Votes**: Highest-rated questions
- **Active**: Recently updated
- **Unanswered**: Questions without answers

### Filter by Tag:

- Click any tag badge
- Or use `?tag=javascript` in URL

---

## 🏷️ Using Tags

### Creating Tags:

- Tags are created automatically when you ask a question
- Use lowercase, letters, numbers, hyphens only
- Max 5 tags per question

### Finding Tags:

- Browse all tags at `/qa/tags`
- Sort by popularity or alphabetically
- Click to see all questions with that tag

### Popular Tags:

- Tags show usage count
- Help categorize content

---

## ✏️ Editing Content

### Edit Questions:

1. Go to your question
2. Click **"Edit"**
3. Make changes
4. Click **"Save Changes"**

### Edit Answers:

1. Go to your answer
2. Click **"Edit"**
3. Make changes
4. Click **"Save Changes"**

**Note:** Edit history is tracked on answers.

---

## 🗑️ Deleting Content

### Delete Your Question:

1. Go to your question
2. Click **"Delete"**
3. Confirm deletion

**Warning:** This also affects:

- All answers will be orphaned (soft delete)
- Tags will be decremented

### Delete Your Answer:

1. Go to your answer
2. Click **"Delete"**
3. Confirm deletion

---

## 📊 Reputation System

### How to Earn Reputation:

| Action             | Reputation |
| ------------------ | ---------- |
| Answer upvoted     | +5         |
| Question upvoted   | +5         |
| Answer accepted    | +10        |
| Answer downvoted   | -2         |
| Question downvoted | -2         |
| Answer unaccepted  | -10        |

### Viewing Reputation:

- Your reputation is visible in your profile
- Other users' reputation shown next to their name
- Check Q&A stats: `/qa/users/:userId/stats`

---

## 🎨 Markdown Guide

The Q&A system supports Markdown formatting:

````markdown
# Headers

## Subheaders

**Bold text**
_Italic text_

`inline code`

`code block`

[Link text](https://example.com)
````

**Preview Mode:**

- Click "Preview" tab while writing
- See formatted output before posting

---

## 📱 Frontend Features

### Question List Page (`/qa`):

- Grid of question cards
- Stats display (votes, answers, views)
- Search and filter controls
- Pagination

### Question Detail Page (`/qa/:id`):

- Full question with voting
- All answers sorted by votes
- Accepted answer highlighted
- Answer submission form
- Edit/delete controls (if authorized)

### Ask Question Page (`/qa/ask`):

- Clean form with validation
- Markdown editor with preview
- Tag input
- Helpful tips sidebar

---

## 🔧 Developer Info

### Backend Routes:

```
GET    /api/v1/qa/questions
POST   /api/v1/qa/questions
GET    /api/v1/qa/questions/:id
PATCH  /api/v1/qa/questions/:id
DELETE /api/v1/qa/questions/:id
POST   /api/v1/qa/vote
GET    /api/v1/qa/tags
```

### Testing:

- Use `server/qa-api-tests.http` for API testing
- Requires REST Client extension in VS Code

### Database Collections:

- `questions`
- `answers`
- `votes`
- `tags`

---

## 🆘 Troubleshooting

### "Authentication required" error:

- Ensure you're logged in
- Check that your email is verified
- Refresh your session

### Can't vote:

- You cannot vote on your own content
- Ensure you're authenticated

### Can't accept answer:

- Only the question author can accept answers
- You must own the question

### Tags not working:

- Use lowercase letters, numbers, and hyphens only
- Separate multiple tags with commas

---

## 📈 Best Practices

### For Question Askers:

1. Search before asking
2. Be specific in your title
3. Provide context in the body
4. Include relevant code
5. Tag appropriately
6. Accept helpful answers

### For Answerers:

1. Read the question carefully
2. Provide complete solutions
3. Explain your reasoning
4. Format code properly
5. Be respectful and helpful

### For Voters:

1. Upvote helpful content
2. Downvote incorrect/unhelpful content
3. Don't vote based on personal preference
4. Consider editing instead of downvoting

---

## 🎯 Next Steps

1. **Browse Questions**: Explore existing Q&A
2. **Ask a Question**: Share your challenge
3. **Answer Questions**: Help the community
4. **Build Reputation**: Contribute quality content
5. **Use Tags**: Organize knowledge

---

## 📚 Additional Resources

- [Architecture Documentation](../QA_SYSTEM_ARCHITECTURE.md)
- [API Testing Guide](../server/qa-api-tests.http)
- [Backend Controllers](../server/src/controllers/qa.controller.js)
- [Frontend Components](../client/src/components/qa/)

---

**Happy Learning & Sharing!** 🎓
