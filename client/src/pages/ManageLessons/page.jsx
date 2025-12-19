import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import {
  fetchCourseById,
  addCourseLesson,
  updateCourseLesson,
  deleteCourseLesson,
  createLessonLiveSession,
  createLessonLiveSession,
} from '../../api/courses';
import { Input } from '../../components/Input';

const ManageLessonsPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(null); // lessonId or 'new'
  const [form, setForm] = useState({
    title: '',
    type: 'video',
    contentUrl: '',
    textContent: '',
    live: { startTime: '', roomName: '' },
  });

  const load = async () => {
    try {
      setLoading(true);
      const res = await fetchCourseById(courseId);
      setCourse(res.course);
      setError('');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to load course');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [courseId]);

  const startNew = () => {
    setEditing('new');
    setForm({
      title: '',
      type: 'video',
      contentUrl: '',
      textContent: '',
      live: { startTime: '', roomName: '' },
    });
  };

  const startEdit = lesson => {
    setEditing(lesson._id);
    setForm({
      title: lesson.title || '',
      type: lesson.type || 'video',
      contentUrl: lesson.contentUrl || '',
      textContent: lesson.textContent || '',
      live: lesson.live || { startTime: '', roomName: '' },
    });
  };

  const handleSave = async () => {
    try {
      if (!form.title || !form.title.trim()) {
        alert('Please provide a lesson title');
        return;
      }

      if (editing === 'new') {
        await addCourseLesson(courseId, {
          title: form.title,
          type: form.type,
          contentUrl: form.type === 'video' ? form.contentUrl : undefined,
          textContent: form.type === 'text' ? form.textContent : undefined,
          live: form.type === 'live' ? form.live : undefined,
        });
        alert('Lesson added');
      } else {
        await updateCourseLesson(courseId, editing, {
          title: form.title,
          type: form.type,
          contentUrl: form.type === 'video' ? form.contentUrl : undefined,
          textContent: form.type === 'text' ? form.textContent : undefined,
          live: form.type === 'live' ? form.live : undefined,
        });
        alert('Lesson updated');
      }

      setEditing(null);
      await load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to save lesson');
    }
  };

  const handleDelete = async lessonId => {
    if (!confirm('Delete this lesson?')) return;
    try {
      await deleteCourseLesson(courseId, lessonId);
      alert('Lesson deleted');
      await load();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete lesson');
    }
  };

  if (loading) return <p className="text-sm text-[#4A4A4A]">Loading...</p>;
  if (!course) return <p className="text-sm text-red-600">Course not found.</p>;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Manage Lessons — {course.title}
          </h1>
          <p className="text-sm text-[#4A4A4A]">
            Add, edit or remove lessons for this course.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => navigate(-1)} variant="secondary">
            Back
          </Button>
          <Button onClick={startNew} className="bg-[#FF6A00] text-white">
            + New Lesson
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h2 className="text-lg font-semibold">Lessons</h2>
          {!course.lessons || course.lessons.length === 0 ? (
            <Card>
              <p className="text-sm text-[#4A4A4A]">No lessons yet.</p>
            </Card>
          ) : (
            course.lessons.map(lesson => (
              <Card key={lesson._id} className="mb-2 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">
                      {lesson.order + 1}. {lesson.title}
                    </p>
                    <p className="text-xs text-[#4A4A4A]">{lesson.type}</p>
                    {lesson.type === 'live' && (
                      <p className="text-xs text-[#4A4A4A]">Room: {lesson.live?.roomName || 'Not created'}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {lesson.type === 'live' ? (
                      lesson.live?.roomName ? (
                        <button
                          onClick={() => {
                            window.location.href = `https://meet.jit.si/${lesson.live.roomName}`;
                          }}
                          className="rounded bg-red-600 px-3 py-1 text-xs text-white hover:bg-red-700"
                        >
                          Open Session
                        </button>
                      ) : (
                        <button
                          onClick={async () => {
                            try {
                              await createLessonLiveSession(courseId, lesson._id);
                              alert('Live session created');
                              await load();
                            } catch (err) {
                              console.error(err);
                              alert(err.response?.data?.message || 'Failed to create live session');
                            }
                          }}
                          className="rounded bg-red-100 px-3 py-1 text-xs text-red-700"
                        >
                          Create Session
                        </button>
                      )
                    ) : null}

                    <button
                      onClick={() => startEdit(lesson)}
                      className="rounded bg-blue-100 px-3 py-1 text-xs text-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(lesson._id)}
                      className="rounded bg-red-100 px-3 py-1 text-xs text-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold">
            {editing
              ? editing === 'new'
                ? 'New Lesson'
                : 'Edit Lesson'
              : 'Select or create a lesson'}
          </h2>

          {editing ? (
            <Card className="mt-3 p-4">
              <div className="space-y-3">
                <Input
                  label="Title"
                  value={form.title}
                  onChange={e =>
                    setForm(prev => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />

                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A]">
                    Type
                  </label>
                  <select
                    value={form.type}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        type: e.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
                  >
                    <option value="video">Video</option>
                    <option value="text">Text</option>
                    <option value="live">Live</option>
                  </select>
                </div>

                {form.type === 'video' && (
                  <Input
                    label="Video URL"
                    value={form.contentUrl}
                    onChange={e =>
                      setForm(prev => ({
                        ...prev,
                        contentUrl: e.target.value,
                      }))
                    }
                  />
                )}

                {form.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A]">
                      Text Content
                    </label>
                    <textarea
                      value={form.textContent}
                      onChange={e =>
                        setForm(prev => ({
                          ...prev,
                          textContent: e.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
                      rows={8}
                    />
                  </div>
                )}

                {form.type === 'live' && (
                  <div className="grid gap-2">
                    <input
                      type="datetime-local"
                      value={form.live.startTime || ''}
                      onChange={e =>
                        setForm(prev => ({
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
                      value={form.live.roomName || ''}
                      onChange={e =>
                        setForm(prev => ({
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

                <div className="flex justify-end gap-3">
                  <Button onClick={() => setEditing(null)} variant="secondary">
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-[#FF6A00] text-white"
                  >
                    Save
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <Card className="mt-3 p-4">
              <p className="text-sm text-[#4A4A4A]">
                Choose a lesson on the left or create a new one.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageLessonsPage;
