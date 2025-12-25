# Search System - Quick Start Guide

## 🚀 Getting Started (5 minutes)

### Prerequisites

- Node.js installed
- MongoDB running
- Learnoverse project cloned

### Step 1: Install Dependencies (if not already done)

```bash
# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### Step 2: Start the Backend

```bash
cd server
npm run dev
```

Expected output:

```
Server listening on port 3000
MongoDB connected successfully
```

### Step 3: Rebuild Database Indexes

**Important:** The search system requires text indexes. After starting the server for the first time, rebuild indexes:

```bash
# Connect to MongoDB
mongosh

# Switch to your database (adjust name if different)
use learnoverse

# Rebuild indexes for all collections
db.courses.reIndex()
db.questions.reIndex()
db.posts.reIndex()
db.users.reIndex()
db.skillswaprequests.reIndex()

# Verify indexes were created
db.courses.getIndexes()
# You should see a text index on title, description, category
```

### Step 4: Start the Frontend

```bash
cd client
npm run dev
```

Expected output:

```
VITE v5.x.x ready in xxx ms
➜ Local: http://localhost:5173/
```

### Step 5: Test the Search System

#### A. Test Backend API

Open `server/search-api-tests.http` in VS Code and click "Send Request" on any endpoint, or use curl:

```bash
# Test unified search
curl "http://localhost:3000/api/v1/search?query=javascript&limit=5"

# Test instant suggestions
curl "http://localhost:3000/api/v1/search/suggestions?query=web"

# Test course search with filters
curl "http://localhost:3000/api/v1/search/courses?query=&skills=React&level=beginner&sortBy=popular"
```

Expected response:

```json
{
  "success": true,
  "query": "javascript",
  "totalResults": 10,
  "results": [...]
}
```

#### B. Test Frontend

1. **Open browser:** http://localhost:5173
2. **Login** to your account
3. **Type in header search bar:**

   - Enter "javascript" (or any keyword)
   - Wait 300ms - dropdown should appear with instant results
   - Click "View all results" to go to full search page

4. **Test full search page:** http://localhost:5173/search?q=javascript
   - Switch between tabs (All, Courses, Q&A, Posts, Users)
   - On "Courses" tab, use filters (skills, price, level, sort)
   - Test pagination if you have many results

---

## 🧪 Populate Sample Data (Optional)

If your database is empty, create some test data:

```javascript
// In MongoDB shell (mongosh)
use learnoverse

// Create a test user (instructor)
db.users.insertOne({
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$...", // Hashed password
  role: "instructor",
  bio: "Experienced web developer",
  interests: ["JavaScript", "React", "Node.js"],
  institution: "Tech University"
})

// Get the user ID
const instructorId = db.users.findOne({ email: "john@example.com" })._id

// Create test courses
db.courses.insertMany([
  {
    title: "JavaScript Fundamentals",
    description: "Learn the basics of modern JavaScript programming",
    category: "Web Development",
    level: "beginner",
    pricePoints: 500,
    skillTags: ["JavaScript", "Programming", "Web Development"],
    instructor: instructorId,
    status: "approved",
    isPublished: true,
    enrollCount: 150,
    createdAt: new Date()
  },
  {
    title: "React Masterclass",
    description: "Build modern web applications with React",
    category: "Frontend",
    level: "intermediate",
    pricePoints: 800,
    skillTags: ["React", "JavaScript", "Web Development"],
    instructor: instructorId,
    status: "approved",
    isPublished: true,
    enrollCount: 89,
    createdAt: new Date()
  },
  {
    title: "Python for Data Science",
    description: "Data analysis and visualization with Python",
    category: "Data Science",
    level: "intermediate",
    pricePoints: 1200,
    skillTags: ["Python", "Data Science", "Machine Learning"],
    instructor: instructorId,
    status: "approved",
    isPublished: true,
    enrollCount: 200,
    createdAt: new Date()
  }
])

// Create test questions
db.questions.insertMany([
  {
    title: "How to use React hooks?",
    body: "I'm trying to understand useState and useEffect. Can someone explain?",
    author: instructorId,
    tags: [],
    voteScore: 15,
    viewCount: 250,
    answerCount: 3,
    lastActivityAt: new Date(),
    isDeleted: false,
    createdAt: new Date()
  },
  {
    title: "What is the difference between var, let, and const?",
    body: "I'm confused about variable declarations in JavaScript.",
    author: instructorId,
    tags: [],
    voteScore: 8,
    viewCount: 180,
    answerCount: 5,
    acceptedAnswer: null,
    lastActivityAt: new Date(),
    isDeleted: false,
    createdAt: new Date()
  }
])

// Create test posts
db.posts.insertMany([
  {
    user: instructorId,
    text: "Just launched my new JavaScript course! Excited to share my knowledge.",
    likes: [],
    comments: [],
    createdAt: new Date()
  },
  {
    user: instructorId,
    text: "Looking for feedback on my React project. Any suggestions?",
    likes: [],
    comments: [],
    createdAt: new Date()
  }
])

// Verify data
db.courses.countDocuments({ status: "approved", isPublished: true })
db.questions.countDocuments({ isDeleted: false })
db.posts.countDocuments()
```

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Backend server running on port 3000
- [ ] Frontend server running on port 5173
- [ ] MongoDB indexes created (check with `db.courses.getIndexes()`)
- [ ] API endpoint responds: `curl http://localhost:3000/api/v1/search/suggestions?query=test`
- [ ] Header search bar visible on all pages
- [ ] Typing in search bar shows dropdown after 2+ characters
- [ ] Clicking "View all results" navigates to `/search` page
- [ ] Filters work on Courses tab
- [ ] Pagination works (if you have >10 results)

---

## 🐛 Troubleshooting

### Issue: "No results found" even with data

**Solution:**

```bash
# Rebuild indexes
mongosh
use learnoverse
db.courses.reIndex()
db.questions.reIndex()

# Verify courses are approved and published
db.courses.find({ status: "approved", isPublished: true }).count()
```

### Issue: Dropdown not showing

**Check:**

1. Query length ≥ 2 characters?
2. Browser console errors?
3. Network tab shows request to `/api/v1/search/suggestions`?
4. Response is valid JSON?

**Solution:**

```javascript
// Open browser DevTools Console
// Type this to debug:
fetch("http://localhost:3000/api/v1/search/suggestions?query=test")
  .then((r) => r.json())
  .then(console.log);
```

### Issue: CORS errors

**Solution:**
Check `server/src/server.js`:

```javascript
const allowedOrigins = [
  "http://localhost:5173", // ✅ Make sure this matches your frontend port
  "http://127.0.0.1:5173",
];
```

### Issue: Filters not working

**Check:**

1. URL updates when changing filters?
2. Backend receives filter params?

**Debug:**

```bash
# In server terminal, add logging to search.controller.js:
console.log('Filters received:', req.query);
```

---

## 📚 Next Steps

1. **Read the full guide:** `SEARCH_SYSTEM_GUIDE.md`
2. **Test all API endpoints:** Use `search-api-tests.http`
3. **Customize filters:** Edit `SearchFilters.jsx` to add/remove filter options
4. **Add more sample data:** Populate your database with realistic content
5. **Monitor performance:** Use MongoDB explain() to check query efficiency

---

## 🎯 Quick Reference

### Search from Header

1. Click search input in header
2. Type at least 2 characters
3. See instant preview dropdown
4. Click result to view details OR "View all" for full page

### Full Search Page

- **URL:** `/search?q=keyword`
- **Tabs:** All | Courses | Q&A | Posts | Users
- **Filters (Courses only):** Sort, Level, Price, Skills
- **Pagination:** Bottom of results

### API Endpoints

- Unified: `GET /api/v1/search`
- Suggestions: `GET /api/v1/search/suggestions`
- Courses: `GET /api/v1/search/courses`
- Questions: `GET /api/v1/search/questions`
- Posts: `GET /api/v1/search/posts`
- Users: `GET /api/v1/search/users`
- Skill Swaps: `GET /api/v1/search/skill-swaps`

---

**Ready to search!** 🔍

If you encounter any issues not covered here, check the main guide (`SEARCH_SYSTEM_GUIDE.md`) or inspect the browser DevTools Console/Network tab for error details.
