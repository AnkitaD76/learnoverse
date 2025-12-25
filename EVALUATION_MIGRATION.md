# Database Migration Notes

## Overview

The Evaluation System adds new collections and modifies existing ones. Here's what you need to know about data migration.

---

## New Collections

The following collections will be automatically created when the system is first used:

1. **evaluations**

   - Stores all assignments and quizzes
   - Indexes: course, instructor, status

2. **evaluationquestions**

   - Stores questions for each evaluation
   - Indexes: evaluation, order

3. **evaluationsubmissions**
   - Stores student submissions
   - Indexes: student + evaluation (unique), evaluation + status

---

## Modified Collections

### enrollments

**Added Field:**

```javascript
{
  totalScore: { type: Number, default: 0, min: 0 }
}
```

**Impact:**

- ✅ Backward compatible
- ✅ Existing enrollments get `totalScore: 0` by default
- ✅ No migration script needed
- ✅ Scores calculated on first grading

---

## Migration Steps

### For Fresh Installation

**No action required!** All collections and fields will be created automatically.

### For Existing Database

#### Option 1: Automatic (Recommended)

1. The server will automatically handle the schema changes
2. Existing enrollments will have `totalScore: 0`
3. As evaluations are graded, scores will be calculated

#### Option 2: Manual Initialization

If you want to initialize `totalScore` explicitly:

```javascript
// Run in MongoDB shell or Compass
use learnoverse

// Add totalScore to all enrollments that don't have it
db.enrollments.updateMany(
  { totalScore: { $exists: false } },
  { $set: { totalScore: 0 } }
)
```

---

## Data Integrity Checks

### Verify Collections

```javascript
// Check if new collections exist
show collections

// Should include:
// - evaluations
// - evaluationquestions
// - evaluationsubmissions
```

### Verify Indexes

```javascript
// Check evaluation indexes
db.evaluations.getIndexes();

// Should show:
// - course + createdAt
// - instructor + createdAt
// - course + status

// Check submission indexes
db.evaluationsubmissions.getIndexes();

// Should show:
// - student + evaluation (unique)
// - evaluation + status
```

### Verify Enrollment Field

```javascript
// Check if totalScore exists in enrollments
db.enrollments.findOne({}, { totalScore: 1 });

// Should return:
// { _id: ..., totalScore: 0 }
```

---

## Rollback Instructions

If you need to remove the evaluation system:

### 1. Drop New Collections

```javascript
db.evaluations.drop();
db.evaluationquestions.drop();
db.evaluationsubmissions.drop();
```

### 2. Remove Added Field (Optional)

```javascript
db.enrollments.updateMany({}, { $unset: { totalScore: "" } });
```

### 3. Revert Code Changes

Remove or comment out the evaluation routes in `server.js`:

```javascript
// import evaluationRoutes from './routers/evaluation.routes.js';
// app.use('/api/v1', evaluationRoutes);
```

---

## Testing Migration

### 1. Check Existing Enrollments

```javascript
// Before
db.enrollments.find().limit(5);

// After migration
// Should include totalScore: 0
```

### 2. Create Test Evaluation

```http
POST /api/v1/courses/:courseId/evaluations
{
  "type": "quiz",
  "title": "Test Migration",
  "totalMarks": 10,
  "weight": 10,
  "questions": [{ "prompt": "Test?", "maxMarks": 10 }]
}
```

### 3. Verify Collections

```javascript
db.evaluations.find();
db.evaluationquestions.find();
```

---

## Common Issues

### Issue: "totalScore is not defined"

**Solution:** The field is added automatically. If you see this error:

```javascript
db.enrollments.updateMany({}, { $set: { totalScore: 0 } });
```

### Issue: "Duplicate key error on submission"

**Cause:** Student trying to submit twice

**Expected:** This is the correct behavior (one submission only)

### Issue: "Cannot find module 'Evaluation'"

**Solution:** Restart the server to reload models:

```bash
cd server
npm run dev
```

---

## Performance Considerations

### Index Creation

Indexes are created automatically on first access. For large databases:

1. **Create indexes manually** during off-peak hours:

```javascript
// Evaluations
db.evaluations.createIndex({ course: 1, createdAt: -1 });
db.evaluations.createIndex({ instructor: 1, createdAt: -1 });
db.evaluations.createIndex({ course: 1, status: 1 });

// Questions
db.evaluationquestions.createIndex({ evaluation: 1, order: 1 });

// Submissions
db.evaluationsubmissions.createIndex(
  { student: 1, evaluation: 1 },
  { unique: true }
);
db.evaluationsubmissions.createIndex({ evaluation: 1, status: 1 });
```

2. **Monitor index creation:**

```javascript
db.currentOp({ op: "createIndex" });
```

---

## Data Backup

Before enabling the evaluation system in production:

### 1. Backup Current Database

```bash
mongodump --db learnoverse --out ./backup/$(date +%Y%m%d)
```

### 2. Test Restoration

```bash
mongorestore --db learnoverse_test ./backup/20241225/learnoverse
```

### 3. Verify Backup

```javascript
use learnoverse_test
db.enrollments.count()
db.courses.count()
```

---

## Monitoring

### Watch for Issues

```javascript
// Check for enrollments without totalScore
db.enrollments.find({ totalScore: { $exists: false } }).count();

// Should return 0

// Check submission integrity
db.evaluationsubmissions.aggregate([
  {
    $group: {
      _id: { student: "$student", evaluation: "$evaluation" },
      count: { $sum: 1 },
    },
  },
  { $match: { count: { $gt: 1 } } },
]);

// Should return empty array (no duplicates)
```

---

## Summary

✅ **No complex migration needed**
✅ **Backward compatible**
✅ **Automatic field initialization**
✅ **Safe to deploy**

The evaluation system is designed to coexist peacefully with your existing data structure.
