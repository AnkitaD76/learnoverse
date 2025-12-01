import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import { createCourse } from '../../api/courses';
import { useSession } from '../../contexts/SessionContext';

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
  });
  const [loading, setLoading] = useState(false);

  if (user?.role !== 'instructor' && user?.role !== 'admin') {
    return (
      <p className="text-sm text-red-500">
        Only instructors or admins can create courses.
      </p>
    );
  }

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        pricePoints: Number(form.pricePoints) || 0,
        skillTags: form.skillTags
          ? form.skillTags.split(',').map(s => s.trim())
          : [],
      };
      const res = await createCourse(payload);
      const course = res.course;
      alert('Course created successfully');
      if (course?._id) {
        navigate(`/courses/${course._id}`);
      } else {
        navigate('/courses');
      }
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
        <form className="space-y-4" onSubmit={handleSubmit}>
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

          <Button
            type="submit"
            isLoading={loading}
            className="bg-[#FF6A00] text-white hover:bg-[#e85f00]"
          >
            Create Course
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateCoursePage;
