import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { createCourse } from '../../api/courses';
import { useSession } from '../../contexts/SessionContext';

const emptyLesson = () => ({
  title: '',
  type: 'video',
  contentUrl: '',
  textContent: '',
  live: { startTime: '', roomName: '' },
});

const CreateCoursePage = () => {
  const { user } = useSession();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    level: 'beginner',
    pricePoints: 0,
    skillTags: '',
    skillSwapEnabled: false,
    lessons: [emptyLesson()],
  });

  const [loading, setLoading] = useState(false);
  const [submitForApproval, setSubmitForApproval] = useState(true);

  if (user?.role !== 'instructor' && user?.role !== 'admin') {
    return (
      <p className="text-sm text-red-500">
        Only instructors or admins can create courses.
      </p>
    );
  }

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const updateLesson = (idx, patch) => {
    setForm(prev => {
      const next = [...prev.lessons];
      next[idx] = { ...next[idx], ...patch };
      return { ...prev, lessons: next };
    });
  };

  const updateLive = (idx, patch) => {
    setForm(prev => {
      const next = [...prev.lessons];
      next[idx] = { ...next[idx], live: { ...(next[idx].live || {}), ...patch } };
      return { ...prev, lessons: next };
    });
  };

  const addLesson = () => {
    setForm(prev => ({ ...prev, lessons: [...prev.lessons, emptyLesson()] }));
  };

  const removeLesson = idx => {
    setForm(prev => ({
      ...prev,
      lessons: prev.lessons.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: form.title,
        description: form.description,
        category: form.category,
        level: form.level,
        pricePoints: Number(form.pricePoints) || 0,
        skillSwapEnabled: Boolean(form.skillSwapEnabled),
        submitForApproval, // ✅ pending vs draft

        skillTags: form.skillTags
          ? form.skillTags.split(',').map(s => s.trim())
          : [],

        lessons: (form.lessons || [])
          .filter(l => l.title?.trim())
          .map((l, order) => {
            const lesson = {
              title: l.title,
              type: l.type,
              order,
            };
            
            if (l.type === 'video') {
              lesson.contentUrl = l.contentUrl || '';
            } else if (l.type === 'text') {
              lesson.textContent = l.textContent || '';
            } else if (l.type === 'live') {
              lesson.live = {
                startTime: l.live?.startTime || '',
                roomName: l.live?.roomName || '',
              };
            }
            
            return lesson;
          }),
      };

      // Validate at least one lesson
      if (!payload.lessons || payload.lessons.length === 0) {
        throw new Error('Please add at least one lesson');
      }

      const res = await createCourse(payload);
      const course = res.course;

      alert(res.message || 'Course saved');
      if (course?._id) navigate(`/courses/${course._id}`);
      else navigate('/courses');
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.msg ||
          err.response?.data?.message ||
          'Failed to create course'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-[#1A1A1A]">
        Create a New Course
      </h1>

      <Card>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <Input
            label="Title"
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <div>
            <label className="block text-sm font-medium text-[#4A4A4A]">
              Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-[#FF6A00] focus:ring-[#FF6A00]"
              rows={4}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Input
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. Programming"
            />

            <div>
              <label className="block text-sm font-medium text-[#4A4A4A]">
                Level
              </label>
              <select
                name="level"
                value={form.level}
                onChange={handleChange}
                className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm focus:border-[#FF6A00] focus:ring-[#FF6A00]"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <Input
              label="Price (points)"
              type="number"
              name="pricePoints"
              min="0"
              value={form.pricePoints}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Skill Tags (comma separated)"
            name="skillTags"
            value={form.skillTags}
            onChange={handleChange}
            placeholder="JavaScript, React, MERN"
          />

          {/* ✅ Skill swap toggle */}
          <div className="flex items-center gap-3">
            <input
              id="skillSwapEnabled"
              type="checkbox"
              name="skillSwapEnabled"
              checked={form.skillSwapEnabled}
              onChange={handleChange}
              className="h-4 w-4"
            />
            <label htmlFor="skillSwapEnabled" className="text-sm text-[#4A4A4A]">
              Enable Skill Swap for this course
            </label>
          </div>

          {/* ✅ Lessons */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#1A1A1A]">Lessons</h2>
              <Button
                type="button"
                onClick={addLesson}
                className="bg-[#FF6A00] text-white hover:bg-[#e85f00]"
              >
                + Add Lesson
              </Button>
            </div>

            {form.lessons.map((lesson, idx) => (
              <div
                key={idx}
                className="rounded-lg border border-gray-200 p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[#1A1A1A]">
                    Lesson #{idx + 1}
                  </p>
                  {form.lessons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeLesson(idx)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <Input
                  label="Lesson Title"
                  value={lesson.title}
                  onChange={e => updateLesson(idx, { title: e.target.value })}
                  required={idx === 0}
                />

                <div>
                  <label className="block text-sm font-medium text-[#4A4A4A]">
                    Lesson Type
                  </label>
                  <select
                    value={lesson.type}
                    onChange={e =>
                      updateLesson(idx, { type: e.target.value })
                    }
                    className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
                  >
                    <option value="video">Video</option>
                    <option value="text">Text</option>
                    <option value="live">Live (Jitsi)</option>
                  </select>
                </div>

                {lesson.type === 'video' && (
                  <Input
                    label="Video URL"
                    value={lesson.contentUrl}
                    onChange={e =>
                      updateLesson(idx, { contentUrl: e.target.value })
                    }
                    placeholder="https://..."
                  />
                )}

                {lesson.type === 'text' && (
                  <div>
                    <label className="block text-sm font-medium text-[#4A4A4A]">
                      Text Content
                    </label>
                    <textarea
                      value={lesson.textContent}
                      onChange={e =>
                        updateLesson(idx, { textContent: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-gray-300 p-2 text-sm"
                      rows={4}
                    />
                  </div>
                )}

                {lesson.type === 'live' && (
                  <div className="grid gap-3 md:grid-cols-2">
                    <Input
                      label="Start Time"
                      type="datetime-local"
                      value={lesson.live?.startTime || ''}
                      onChange={e =>
                        updateLive(idx, { startTime: e.target.value })
                      }
                    />
                    <Input
                      label="Jitsi Room Name"
                      value={lesson.live?.roomName || ''}
                      onChange={e =>
                        updateLive(idx, { roomName: e.target.value })
                      }
                      placeholder="learnoverse-course-xyz"
                    />
                    <p className="md:col-span-2 text-xs text-[#4A4A4A]">
                      Note: Only enrolled students should be allowed to join. (Backend will generate a joinCode later.)
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* ✅ Two actions */}
          <div className="flex gap-3">
            <Button
              type="submit"
              isLoading={loading}
              onClick={() => setSubmitForApproval(false)}
              className="border border-[#FF6A00] text-[#FF6A00] hover:bg-[#FFF2E8]"
            >
              Save Draft
            </Button>

            <Button
              type="submit"
              isLoading={loading}
              onClick={() => setSubmitForApproval(true)}
              className="bg-[#FF6A00] text-white hover:bg-[#e85f00]"
            >
              Submit for Admin Approval
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default CreateCoursePage;
