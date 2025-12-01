import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    bio: '',
    location: '',
    phone: '',
    occupation: '',
    website: '',
    socialLinks: {
      twitter: '',
      linkedin: '',
      github: '',
    },
  });

  const [errors, setErrors] = useState({});

  // Fetch current profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/v1/profiles/me', {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await response.json();
        setFormData(data.profile);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith('socialLinks.')) {
      const key = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [key]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (formData.bio && formData.bio.length > 500) {
      newErrors.bio = 'Bio cannot exceed 500 characters';
    }
    if (formData.location && formData.location.length > 100) {
      newErrors.location = 'Location cannot exceed 100 characters';
    }
    if (formData.phone && formData.phone.length > 20) {
      newErrors.phone = 'Phone cannot exceed 20 characters';
    }
    if (formData.occupation && formData.occupation.length > 100) {
      newErrors.occupation = 'Occupation cannot exceed 100 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      const response = await fetch('/api/v1/profiles/me', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update profile');
      }

      setSuccess(true);
      setTimeout(() => {
        navigate('/profile');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Edit Profile</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800">✓ Profile updated successfully!</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                maxLength="500"
                rows="4"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <p className="text-xs text-gray-500">
                  {formData.bio.length}/500
                </p>
                {errors.bio && <p className="text-red-600 text-sm">{errors.bio}</p>}
              </div>
            </div>

            {/* Location */}
            <Input
              label="📍 Location"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., San Francisco, CA"
              maxLength="100"
              error={errors.location}
            />

            {/* Phone */}
            <Input
              label="📞 Phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+1 (555) 123-4567"
              maxLength="20"
              error={errors.phone}
            />

            {/* Occupation */}
            <Input
              label="💼 Occupation"
              name="occupation"
              value={formData.occupation}
              onChange={handleChange}
              placeholder="e.g., Software Engineer"
              maxLength="100"
              error={errors.occupation}
            />

            {/* Website */}
            <Input
              label="🌐 Website"
              name="website"
              type="url"
              value={formData.website}
              onChange={handleChange}
              placeholder="https://example.com"
            />

            {/* Social Links */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Social Links</h3>

              <Input
                label="Twitter"
                name="socialLinks.twitter"
                value={formData.socialLinks.twitter}
                onChange={handleChange}
                placeholder="https://twitter.com/username"
              />

              <Input
                label="LinkedIn"
                name="socialLinks.linkedin"
                value={formData.socialLinks.linkedin}
                onChange={handleChange}
                placeholder="https://linkedin.com/in/username"
                className="mt-4"
              />

              <Input
                label="GitHub"
                name="socialLinks.github"
                value={formData.socialLinks.github}
                onChange={handleChange}
                placeholder="https://github.com/username"
                className="mt-4"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                onClick={() => navigate('/profile')}
                variant="secondary"
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
