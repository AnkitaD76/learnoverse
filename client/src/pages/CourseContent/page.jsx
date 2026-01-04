import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import {
  fetchCourseById,
  withdrawFromCourse,
  fetchCourseEnrollments,
  addCourseLesson,
  createLessonLiveSession,
  stopLessonKeepalive,
  fetchMyEnrollment,
  markLessonComplete,
} from '../../api/courses';
import { useSession } from '../../contexts/SessionContext';

const CourseContentPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrolledUsers, setEnrolledUsers] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [viewingLesson, setViewingLesson] = useState(null);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [newLesson, setNewLesson] = useState({
    title: '',
    type: 'video',
    contentUrl: '',
    textContent: '',
    live: { startTime: '', roomName: '' },
  });
  const { user } = useSession();

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await fetchCourseById(courseId);
        console.log('📚 Course loaded:', res.course);
        setCourse(res.course);

        // Check if user is enrolled (student) or owner
        const isOwner =
          user &&
          (user.role === 'admin' ||
            String(user._id) === String(res.course.instructor?._id));

        if (!isOwner) {
          // Fetch student's enrollment data
          try {
            const enrollRes = await fetchMyEnrollment(courseId);
            if (enrollRes.enrollment) {
              setEnrollment(enrollRes.enrollment);
              console.log('📊 Enrollment data:', enrollRes.enrollment);
            }
          } catch (enrollErr) {
            console.error('❌ Failed to load enrollment:', enrollErr);
          }
        } else {
          // Fetch enrolled students for instructor
          try {
            const enrollmentsRes = await fetchCourseEnrollments(courseId);
            console.log('👥 Enrollments loaded:', enrollmentsRes);
            setEnrolledUsers(enrollmentsRes.enrollments || []);
          } catch (enrollErr) {
            console.error('❌ Failed to load enrollments:', enrollErr);
            setEnrolledUsers([]);
          }
        }
      } catch (err) {
        console.error('❌ Error:', err);
        setError(
          err.response?.data?.message ||
            err.response?.data?.msg ||
            'Failed to load course'
        );
      } finally {
        setIsLoading(false);
        setEnrollmentsLoading(false);
      }
    };

    if (user) {
      load();
    }
  }, [courseId, user]);

  // Poll course data so students see live session link without manual refresh
  useEffect(() => {
    const shouldPoll = () => {
      if (!course) return false;
      if (!user) return false;
      const isOwner =
        user &&
        (user.role === 'admin' ||
          String(user._id) === String(course.instructor?._id));
      if (isOwner) return false;
      return (course.lessons || []).some(
        l => l.type === 'live' && !l.live?.roomName
      );
    };

    if (!shouldPoll()) return;

    let cancelled = false;
    const interval = setInterval(async () => {
      try {
        const res = await fetchCourseById(courseId);
        if (cancelled) return;
        if (res?.course) setCourse(res.course);
      } catch (err) {
        console.error('CourseContent polling error', err);
      }
    }, 5000);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [course, courseId, user]);

  const handleWithdraw = async () => {
    try {
      setActionLoading(true);
      setError(null);
      const res = await withdrawFromCourse(courseId);
      setInfo(res.message || 'Withdrawn successfully');
      setShowConfirm(false);
      setTimeout(() => {
        navigate('/courses');
      }, 1000);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          'Failed to withdraw'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkLessonComplete = async lessonId => {
    try {
      const res = await markLessonComplete(courseId, lessonId);
      setInfo(res.message || 'Lesson marked as complete!');

      // Update enrollment data
      const enrollRes = await fetchMyEnrollment(courseId);
      if (enrollRes.enrollment) {
        setEnrollment(enrollRes.enrollment);
      }

      // Check if certificate was issued
      if (res.certificate) {
        setCertificate(res.certificate);
        setInfo(
          `🎉 Congratulations! You've completed the course and earned a certificate!`
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.response?.data?.msg ||
          'Failed to mark lesson complete'
      );
    }
  };

  const isLessonCompleted = lessonId => {
    if (!enrollment || !enrollment.completedLessonIds) return false;
    return enrollment.completedLessonIds.some(
      id => String(id) === String(lessonId)
    );
  };

  if (isLoading) {
    return <p className="text-sm text-[#4A4A4A]">Loading course...</p>;
  }

  if (!course) {
    return <p className="text-sm text-red-600">Course not found.</p>;
  }

  const handleCreateLive = async lesson => {
    try {
      const res = await createLessonLiveSession(courseId, lesson._id);
      const updated = await fetchCourseById(courseId);
      setCourse(updated.course);
      setViewingLesson(
        updated.course.lessons.find(l => String(l._id) === String(lesson._id))
      );
      setInfo('Live session created');
      if (res.roomName) {
        navigate(`/courses/${courseId}/lessons/${lesson._id}/live`);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create live session');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Certificate Notification */}
        {certificate && (
          <Card className="border-l-4 border-l-green-500 bg-green-50 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="text-3xl">🎉</div>
                <div>
                  <h3 className="font-semibold text-green-900">
                    Congratulations!
                  </h3>
                  <p className="mt-1 text-sm text-green-800">
                    You've completed this course and earned a certificate!
                  </p>
                  <p className="mt-1 text-xs text-green-700">
                    Certificate #{certificate.certificateNumber}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate(`/certificates/${certificate.id}`)}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                View Certificate
              </Button>
            </div>
          </Card>
        )}

        {/* Progress Card for Students */}
        {enrollment && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-[#1A1A1A]">
                  Course Progress
                </h3>
                <p className="mt-1 text-sm text-[#4A4A4A]">
                  {enrollment.progress?.completedLessons || 0} of{' '}
                  {enrollment.progress?.totalLessons || 0} lessons completed
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-[#FF6A00]">
                  {enrollment.progress?.percent || 0}%
                </div>
                <p className="text-xs text-[#4A4A4A]">Complete</p>
              </div>
            </div>
            <div className="mt-3 h-2 w-full rounded-full bg-gray-200">
              <div
                className="h-2 rounded-full bg-[#FF6A00]"
                style={{ width: `${enrollment.progress?.percent || 0}%` }}
              />
            </div>
          </Card>
        )}

        {/* Course Header */}
        <Card className="border-l-4 border-l-[#FF6A00]">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-[#1A1A1A]">
                {course.title}
              </h1>
              <p className="mt-2 text-sm text-[#4A4A4A]">
                {course.description || 'No description provided.'}
              </p>
              <div className="mt-4 flex gap-4">
                <div>
                  <p className="text-xs text-[#4A4A4A]">Category</p>
                  <p className="font-semibold text-[#1A1A1A]">
                    {course.category}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#4A4A4A]">Level</p>
                  <p className="font-semibold text-[#1A1A1A]">{course.level}</p>
                </div>
                <div>
                  <p className="text-xs text-[#4A4A4A]">Points</p>
                  <p className="font-semibold text-[#FF6A00]">
                    {course.pricePoints}
                  </p>
                </div>
                {user &&
                  (user.role === 'admin' ||
                    String(user._id) === String(course.instructor?._id)) && (
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() =>
                          navigate(`/courses/${courseId}/manage-lessons`)
                        }
                        className="bg-[#06b6d4] text-white hover:bg-[#0891b2]"
                      >
                        Manage Lessons
                      </Button>
                    </div>
                  )}
              </div>
            </div>
          </div>
        </Card>

        {/* Instructor Info */}
        <Card>
          <h2 className="text-lg font-semibold text-[#1A1A1A]">Instructor</h2>
          <div className="mt-4">
            <p className="font-medium text-[#1A1A1A]">
              {course.instructor?.name || 'Unknown'}
            </p>
            <p className="text-sm text-[#4A4A4A]">
              {course.instructor?.email || 'No email available'}
            </p>
          </div>
        </Card>

        {/* Course Content */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">
              Course Content
            </h2>
            <Button
              onClick={() => {
                const isInstructor =
                  user &&
                  (user.role === 'admin' ||
                    String(user._id) === String(course.instructor?._id));
                const path = isInstructor
                  ? `/courses/${courseId}/evaluations`
                  : `/courses/${courseId}/student/evaluations`;
                navigate(path);
              }}
              variant="secondary"
              className="border border-[#FF6A00] text-[#FF6A00] hover:bg-[#FFF2E8]"
            >
              📝 Quizzes & Assignments
            </Button>
          </div>

          {!course.lessons || course.lessons.length === 0 ? (
            <p className="mt-4 text-sm text-[#4A4A4A]">No lessons added yet.</p>
          ) : (
            <div className="mt-6 space-y-3">
              {course.lessons.map((lesson, index) => {
                const isCompleted = isLessonCompleted(lesson._id);
                const isStudent = enrollment !== null;
                const isInstructor =
                  user &&
                  (user.role === 'admin' ||
                    String(user._id) === String(course.instructor?._id));

                return (
                  <div
                    key={lesson._id || index}
                    className={`rounded-lg border p-4 transition ${
                      isCompleted
                        ? 'border-green-300 bg-green-50'
                        : 'border-[#E5E5E5] bg-[#F9F9F9] hover:bg-white'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex flex-1 items-start gap-3">
                        {isStudent && (
                          <div className="mt-1">
                            {isCompleted ? (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-500 text-white">
                                ✓
                              </div>
                            ) : (
                              <div className="h-6 w-6 rounded-full border-2 border-gray-300" />
                            )}
                          </div>
                        )}

                        <div className="flex-1">
                          <p className="font-medium text-[#1A1A1A]">
                            {lesson.order + 1}. {lesson.title}
                          </p>
                          <p className="mt-1 text-xs text-[#4A4A4A] capitalize">
                            {lesson.type === 'video' && '▶ Video Lesson'}
                            {lesson.type === 'text' && '📄 Text Lesson'}
                            {lesson.type === 'live' && '🔴 Live Session'}
                            {lesson.type === 'quiz' && '❓ Quiz'}
                          </p>
                          {lesson.type === 'video' && lesson.contentUrl && (
                            <p className="mt-2 truncate text-xs text-[#FF6A00]">
                              {lesson.contentUrl}
                            </p>
                          )}
                          {lesson.type === 'live' && (
                            <p className="mt-2 text-xs text-[#4A4A4A]">
                              {lesson.live?.roomName
                                ? `Room: ${lesson.live.roomName}`
                                : 'Live session not created yet'}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* RIGHT SIDE ACTION BUTTONS */}
                      {lesson.type === 'live' ? (
                        lesson.live?.roomName ? (
                          <div className="flex gap-2">
                            <button
                              onClick={async () => {
                                // ✅ Clicking Join Live counts as completion for students
                                if (isStudent && !isCompleted) {
                                  try {
                                    await handleMarkLessonComplete(lesson._id);
                                  } catch (e) {
                                    console.error(
                                      'Failed to auto-complete live lesson',
                                      e
                                    );
                                  }
                                }
                                navigate(
                                  `/courses/${courseId}/lessons/${lesson._id}/live`
                                );
                              }}
                              className="flex-shrink-0 rounded bg-red-600 px-3 py-1 text-sm font-medium text-white hover:bg-red-700"
                            >
                              Join Live
                            </button>

                            {isInstructor && lesson.live?.keepalivePid && (
                              <button
                                onClick={async () => {
                                  if (
                                    !confirm(
                                      'Stop the keepalive process for this lesson?'
                                    )
                                  )
                                    return;
                                  try {
                                    await stopLessonKeepalive(
                                      courseId,
                                      lesson._id
                                    );
                                    setInfo('Keepalive stopped');
                                    const updated =
                                      await fetchCourseById(courseId);
                                    setCourse(updated.course);
                                  } catch (err) {
                                    console.error(err);
                                    setError(
                                      err.response?.data?.message ||
                                        'Failed to stop keepalive'
                                    );
                                  }
                                }}
                                className="flex-shrink-0 rounded bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700"
                              >
                                Stop Keepalive
                              </button>
                            )}
                          </div>
                        ) : isInstructor ? (
                          <button
                            onClick={() => handleCreateLive(lesson)}
                            className="flex-shrink-0 rounded bg-red-500 px-3 py-1 text-sm font-medium text-white hover:bg-red-600"
                          >
                            Create & Join
                          </button>
                        ) : (
                          <button
                            disabled
                            className="flex-shrink-0 rounded bg-gray-200 px-3 py-1 text-sm font-medium text-gray-400"
                          >
                            Live
                          </button>
                        )
                      ) : (
                        <div className="flex gap-2">
                          {/* ✅ Start counts as completion now */}
                          <button
                            onClick={async () => {
                              setViewingLesson(lesson);

                              // ✅ Clicking Start auto-completes for students
                              if (isStudent && !isCompleted) {
                                try {
                                  await handleMarkLessonComplete(lesson._id);
                                } catch (e) {
                                  console.error(
                                    'Failed to auto-complete on start',
                                    e
                                  );
                                }
                              }
                            }}
                            className="flex-shrink-0 rounded bg-[#FF6A00] px-3 py-1 text-sm font-medium text-white hover:bg-[#e85f00]"
                          >
                            {isCompleted ? 'Review' : 'Start'}
                          </button>

                          {/* ❌ Removed "Mark Complete" button as requested */}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Enrollments */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1A1A1A]">
              Students Enrolled ({course?.enrollCount || enrolledUsers.length})
            </h2>
            <div className="flex gap-2">
              <Button
                onClick={() =>
                  navigate(`/courses/${courseId}/enrolled-students`)
                }
                variant="secondary"
                className="border border-[#FF6A00] text-[#FF6A00] hover:bg-[#FFF2E8]"
              >
                View All Students
              </Button>
              <Button
                onClick={() => setShowConfirm(true)}
                variant="secondary"
                className="border border-red-600 text-red-600 hover:bg-red-50"
                isLoading={actionLoading}
              >
                Withdraw from Course
              </Button>
            </div>
          </div>

          {enrollmentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="medium" />
            </div>
          ) : enrolledUsers.length === 0 ? (
            <p className="text-sm text-[#4A4A4A]">No students enrolled yet.</p>
          ) : (
            <p className="text-sm text-[#4A4A4A]">
              {enrolledUsers.length} student
              {enrolledUsers.length !== 1 ? 's' : ''} enrolled. Click "View All
              Students" to see details.
            </p>
          )}
        </Card>

        {/* Messages */}
        {error && (
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
            {error}
          </div>
        )}
        {info && (
          <div className="rounded-lg bg-green-50 p-4 text-sm text-green-600">
            {info}
          </div>
        )}

        {/* Withdrawal Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-sm p-6">
              <h3 className="text-lg font-semibold text-[#1A1A1A]">
                Withdraw from Course?
              </h3>
              <p className="mt-3 text-sm text-[#4A4A4A]">
                Are you sure you want to withdraw from{' '}
                <strong>{course.title}</strong>? This action cannot be undone.
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  disabled={actionLoading}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <Button
                  onClick={handleWithdraw}
                  isLoading={actionLoading}
                  className="bg-red-600 text-white hover:bg-red-700"
                >
                  Confirm Withdraw
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Lesson Viewer Modal */}
        {viewingLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <Card className="max-h-[90vh] w-full max-w-2xl overflow-y-auto p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-[#1A1A1A]">
                  {viewingLesson.order + 1}. {viewingLesson.title}
                </h2>
                <button
                  onClick={() => setViewingLesson(null)}
                  className="text-2xl text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                {/* Video Lesson */}
                {viewingLesson.type === 'video' && (
                  <div>
                    <p className="mb-3 text-sm text-[#4A4A4A]">
                      ▶ Video Lesson
                    </p>
                    {viewingLesson.contentUrl ? (
                      <div className="space-y-3">
                        <div className="rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] p-4">
                          <p className="mb-2 text-sm font-medium text-[#1A1A1A]">
                            Video URL:
                          </p>
                          <a
                            href={viewingLesson.contentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm break-all text-[#FF6A00] hover:underline"
                          >
                            {viewingLesson.contentUrl}
                          </a>
                        </div>
                        <Button
                          onClick={() =>
                            window.open(viewingLesson.contentUrl, '_blank')
                          }
                          className="bg-[#FF6A00] text-white hover:bg-[#e85f00]"
                        >
                          Open Video
                        </Button>
                      </div>
                    ) : (
                      <p className="text-sm text-[#4A4A4A]">
                        No video URL provided.
                      </p>
                    )}

                    {/* Add Lesson Modal */}
                    {showAddLesson && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                        <Card className="w-full max-w-lg p-6">
                          <h3 className="text-lg font-semibold text-[#1A1A1A]">
                            Add Lesson
                          </h3>

                          <div className="mt-4 space-y-3">
                            <input
                              value={newLesson.title}
                              onChange={e =>
                                setNewLesson(prev => ({
                                  ...prev,
                                  title: e.target.value,
                                }))
                              }
                              placeholder="Lesson title"
                              className="w-full rounded border p-2"
                            />

                            <select
                              value={newLesson.type}
                              onChange={e =>
                                setNewLesson(prev => ({
                                  ...prev,
                                  type: e.target.value,
                                }))
                              }
                              className="w-full rounded border p-2"
                            >
                              <option value="video">Video</option>
                              <option value="text">Text</option>
                              <option value="live">Live</option>
                            </select>

                            {newLesson.type === 'video' && (
                              <input
                                value={newLesson.contentUrl}
                                onChange={e =>
                                  setNewLesson(prev => ({
                                    ...prev,
                                    contentUrl: e.target.value,
                                  }))
                                }
                                placeholder="Video URL"
                                className="w-full rounded border p-2"
                              />
                            )}

                            {newLesson.type === 'text' && (
                              <textarea
                                value={newLesson.textContent}
                                onChange={e =>
                                  setNewLesson(prev => ({
                                    ...prev,
                                    textContent: e.target.value,
                                  }))
                                }
                                placeholder="Text content"
                                className="w-full rounded border p-2"
                                rows={6}
                              />
                            )}

                            {newLesson.type === 'live' && (
                              <div className="grid gap-2">
                                <input
                                  type="datetime-local"
                                  value={newLesson.live.startTime}
                                  onChange={e =>
                                    setNewLesson(prev => ({
                                      ...prev,
                                      live: {
                                        ...(prev.live || {}),
                                        startTime: e.target.value,
                                      },
                                    }))
                                  }
                                  className="w-full rounded border p-2"
                                />
                                <input
                                  value={newLesson.live.roomName}
                                  onChange={e =>
                                    setNewLesson(prev => ({
                                      ...prev,
                                      live: {
                                        ...(prev.live || {}),
                                        roomName: e.target.value,
                                      },
                                    }))
                                  }
                                  placeholder="Room name"
                                  className="w-full rounded border p-2"
                                />
                              </div>
                            )}
                          </div>

                          <div className="mt-4 flex justify-end gap-3">
                            <button
                              onClick={() => setShowAddLesson(false)}
                              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <Button
                              onClick={async () => {
                                try {
                                  const payload = {
                                    title: newLesson.title,
                                    type: newLesson.type,
                                  };
                                  if (newLesson.type === 'video')
                                    payload.contentUrl = newLesson.contentUrl;
                                  if (newLesson.type === 'text')
                                    payload.textContent = newLesson.textContent;
                                  if (newLesson.type === 'live')
                                    payload.live = newLesson.live;

                                  await addCourseLesson(courseId, payload);
                                  const res = await fetchCourseById(courseId);
                                  setCourse(res.course);
                                  setShowAddLesson(false);
                                  setInfo('Lesson added');
                                } catch (err) {
                                  console.error(err);
                                  setError(
                                    err.response?.data?.message ||
                                      'Failed to add lesson'
                                  );
                                }
                              }}
                              className="bg-[#FF6A00] text-white hover:bg-[#e85f00]"
                            >
                              Add Lesson
                            </Button>
                          </div>
                        </Card>
                      </div>
                    )}
                  </div>
                )}

                {/* Text Lesson */}
                {viewingLesson.type === 'text' && (
                  <div>
                    <p className="mb-3 text-sm text-[#4A4A4A]">📄 Text Lesson</p>
                    {viewingLesson.textContent ? (
                      <div className="rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] p-4 text-sm whitespace-pre-wrap text-[#1A1A1A]">
                        {viewingLesson.textContent}
                      </div>
                    ) : (
                      <p className="text-sm text-[#4A4A4A]">
                        No text content provided.
                      </p>
                    )}
                  </div>
                )}

                {/* Live Session */}
                {viewingLesson.type === 'live' && (
                  <div>
                    <p className="mb-3 text-sm text-[#4A4A4A]">🔴 Live Session</p>
                    <div className="space-y-3 rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] p-4">
                      {viewingLesson.live?.roomName && (
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">
                            Room:
                          </p>
                          <p className="text-sm text-[#FF6A00]">
                            {viewingLesson.live.roomName}
                          </p>
                        </div>
                      )}
                      {viewingLesson.live?.startTime && (
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">
                            Start Time:
                          </p>
                          <p className="text-sm text-[#4A4A4A]">
                            {new Date(
                              viewingLesson.live.startTime
                            ).toLocaleString()}
                          </p>
                        </div>
                      )}

                      <Button
                        onClick={async () => {
                          // ✅ Also count as completion if someone enters from modal
                          const isStudent = enrollment !== null;
                          const done = isLessonCompleted(viewingLesson._id);
                          if (isStudent && !done) {
                            try {
                              await handleMarkLessonComplete(viewingLesson._id);
                            } catch (e) {
                              console.error(
                                'Failed to auto-complete live lesson from modal',
                                e
                              );
                            }
                          }
                          navigate(
                            `/courses/${courseId}/lessons/${viewingLesson._id}/live`
                          );
                        }}
                        className="w-full bg-[#FF6A00] text-white hover:bg-[#e85f00]"
                      >
                        Join Live Session
                      </Button>
                    </div>
                  </div>
                )}

                {/* Quiz Lesson */}
                {viewingLesson.type === 'quiz' && (
                  <div>
                    <p className="mb-3 text-sm text-[#4A4A4A]">❓ Quiz</p>
                    <div className="rounded-lg border border-[#E5E5E5] bg-[#F9F9F9] p-4">
                      <p className="text-sm text-[#4A4A4A]">
                        Quiz content coming soon...
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  onClick={() => setViewingLesson(null)}
                  variant="secondary"
                  className="border border-gray-300"
                >
                  Close
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseContentPage;
