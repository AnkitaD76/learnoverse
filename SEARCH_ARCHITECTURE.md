# Search System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER INTERFACE                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                        HEADER (All Pages)                             │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │  SearchBar Component                                           │  │  │
│  │  │  • Input with debounce (300ms)                                 │  │  │
│  │  │  • Minimum 2 characters                                        │  │  │
│  │  │  • AbortController for request cancellation                    │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  │                              │                                        │  │
│  │                              ▼                                        │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Instant Suggestions Dropdown                                  │  │  │
│  │  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐        │  │  │
│  │  │  │   Courses    │  │  Questions   │  │    Posts     │        │  │  │
│  │  │  │  (3 results) │  │  (3 results) │  │  (3 results) │        │  │  │
│  │  │  └──────────────┘  └──────────────┘  └──────────────┘        │  │  │
│  │  │  ┌──────────────────────────────────────────────────────────┐  │  │  │
│  │  │  │         [View all 42 results]                            │  │  │  │
│  │  │  └──────────────────────────────────────────────────────────┘  │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │                    SEARCH RESULTS PAGE (/search)                      │  │
│  │  ┌────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Category Tabs                                                 │  │  │
│  │  │  [ All ] [ Courses ] [ Q&A ] [ Posts ] [ Users ]             │  │  │
│  │  └────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                        │  │
│  │  ┌─────────────┐  ┌──────────────────────────────────────────────┐  │  │
│  │  │  Filters    │  │           Search Results                      │  │  │
│  │  │  (Courses)  │  │  ┌─────────────────────────────────────────┐ │  │  │
│  │  │             │  │  │  SearchResultCard (Course)              │ │  │  │
│  │  │  • Sort     │  │  │  Title | Description | Price | Skills  │ │  │  │
│  │  │  • Level    │  │  └─────────────────────────────────────────┘ │  │  │
│  │  │  • Price    │  │  ┌─────────────────────────────────────────┐ │  │  │
│  │  │  • Skills   │  │  │  SearchResultCard (Question)            │ │  │  │
│  │  │             │  │  │  Title | Body | Votes | Answers         │ │  │  │
│  │  │  [Reset]    │  │  └─────────────────────────────────────────┘ │  │  │
│  │  └─────────────┘  │                                              │  │  │
│  │                    │  [1] [2] [3] ... [10]  (Pagination)        │  │  │
│  │                    └──────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP Requests
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                               FRONTEND API LAYER                             │
├─────────────────────────────────────────────────────────────────────────────┤
│  client/src/api/search.js                                                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  • unifiedSearch(query, options)                                    │   │
│  │  • getSearchSuggestions(query)                                      │   │
│  │  • searchCourses(query, filters, options)                           │   │
│  │  • searchQuestions(query, filters, options)                         │   │
│  │  • searchPosts(query, options)                                      │   │
│  │  • searchUsers(query, filters, options)                             │   │
│  │  • searchSkillSwaps(query, filters, options)                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                    Axios HTTP Client (client.js)
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             BACKEND API ROUTES                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  server/src/routers/search.routes.js                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  GET /api/v1/search                 → unifiedSearch                 │   │
│  │  GET /api/v1/search/suggestions     → getSearchSuggestions          │   │
│  │  GET /api/v1/search/courses         → searchCourses                 │   │
│  │  GET /api/v1/search/questions       → searchQuestions               │   │
│  │  GET /api/v1/search/posts           → searchPosts                   │   │
│  │  GET /api/v1/search/users           → searchUsers                   │   │
│  │  GET /api/v1/search/skill-swaps     → searchSkillSwaps              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                     Request Validation (Zod)
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            CONTROLLER LAYER                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  server/src/controllers/search.controller.js                               │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  1. Parse & validate query parameters (Zod schemas)                │   │
│  │  2. Call search service methods                                     │   │
│  │  3. Format & return response                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             SERVICE LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  server/src/services/search.service.js                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Search Logic:                                                      │   │
│  │  1. Build MongoDB query with $and, $or operators                    │   │
│  │  2. Apply filters (skills, price, level, etc.)                      │   │
│  │  3. Execute parallel searches for unified search                    │   │
│  │  4. Sort results (relevance, newest, popular, etc.)                 │   │
│  │  5. Paginate (skip, limit)                                          │   │
│  │  6. Populate referenced documents (instructor, tags)                │   │
│  │                                                                      │   │
│  │  Search Strategy:                                                   │   │
│  │  • Text index for exact word matching                               │   │
│  │  • Regex for partial matching (case-insensitive)                    │   │
│  │  • Compound queries for multiple filters                            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                     Mongoose ODM Queries
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  MongoDB Database: learnoverse                                              │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Collection: courses                                                │   │
│  │  Indexes:                                                           │   │
│  │  • { title: "text", description: "text", category: "text" }        │   │
│  │  • { skillTags: 1 }                                                 │   │
│  │  • { pricePoints: 1 }                                               │   │
│  │  • { level: 1 }                                                     │   │
│  │  • { instructor: 1 }                                                │   │
│  │  • { status: 1, isPublished: 1 }                                    │   │
│  │  • { enrollCount: -1 }                                              │   │
│  │  • { createdAt: -1 }                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Collection: questions                                              │   │
│  │  Indexes:                                                           │   │
│  │  • { title: "text", body: "text" }                                  │   │
│  │  • { createdAt: -1 }                                                │   │
│  │  • { voteScore: -1 }                                                │   │
│  │  • { lastActivityAt: -1 }                                           │   │
│  │  • { tags: 1, createdAt: -1 }                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Collection: posts                                                  │   │
│  │  Indexes:                                                           │   │
│  │  • { text: "text" }                                                 │   │
│  │  • { createdAt: -1 }                                                │   │
│  │  • { user: 1 }                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Collection: users                                                  │   │
│  │  Indexes:                                                           │   │
│  │  • { name: "text", email: "text", bio: "text", ... }               │   │
│  │  • { role: 1 }                                                      │   │
│  │  • { country: 1 }                                                   │   │
│  │  • { interests: 1 }                                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Collection: skillswaprequests                                      │   │
│  │  Indexes:                                                           │   │
│  │  • { status: 1 }                                                    │   │
│  │  • { fromUser: 1, toUser: 1 }                                       │   │
│  │  • { createdAt: -1 }                                                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATA FLOW EXAMPLE                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  User types "react" in header search bar                                    │
│      │                                                                       │
│      ▼                                                                       │
│  Debounce waits 300ms (user stops typing)                                   │
│      │                                                                       │
│      ▼                                                                       │
│  SearchBar calls getSearchSuggestions("react")                              │
│      │                                                                       │
│      ▼                                                                       │
│  API: GET /api/v1/search/suggestions?query=react                            │
│      │                                                                       │
│      ▼                                                                       │
│  Controller validates query (min 2 chars)                                   │
│      │                                                                       │
│      ▼                                                                       │
│  Service executes 4 parallel searches:                                      │
│      │ ┌─────────────────────────────────────────────────────────┐         │
│      ├─┤ searchCourses("react", {}, { limit: 3 })                │         │
│      │ └─────────────────────────────────────────────────────────┘         │
│      │      ▼ MongoDB: db.courses.find({ $text: { $search: "react" } })    │
│      │      ▼ Returns: [React Masterclass, React Hooks, ...]               │
│      │                                                                       │
│      │ ┌─────────────────────────────────────────────────────────┐         │
│      ├─┤ searchQuestions("react", {}, { limit: 3 })              │         │
│      │ └─────────────────────────────────────────────────────────┘         │
│      │      ▼ MongoDB: db.questions.find({ title: /react/i })              │
│      │      ▼ Returns: [How to use React hooks?, ...]                      │
│      │                                                                       │
│      │ ┌─────────────────────────────────────────────────────────┐         │
│      ├─┤ searchPosts("react", {}, { limit: 3 })                  │         │
│      │ └─────────────────────────────────────────────────────────┘         │
│      │      ▼ MongoDB: db.posts.find({ text: /react/i })                   │
│      │                                                                       │
│      │ ┌─────────────────────────────────────────────────────────┐         │
│      └─┤ searchUsers("react", {}, { limit: 3 })                  │         │
│        └─────────────────────────────────────────────────────────┘         │
│             ▼ MongoDB: db.users.find({ interests: /react/i })              │
│                                                                              │
│      ▼ All searches complete (~150ms)                                       │
│  Service combines results into unified response                             │
│      │                                                                       │
│      ▼                                                                       │
│  Controller sends JSON response                                             │
│      │                                                                       │
│      ▼                                                                       │
│  SearchBar displays dropdown with 4 entity groups                           │
│      │                                                                       │
│      ▼                                                                       │
│  User clicks "React Masterclass" → Navigate to /courses/:id                 │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

Legend:
  ┌───┐
  │   │  Component/Layer
  └───┘
    │    Data flow
    ▼
```
