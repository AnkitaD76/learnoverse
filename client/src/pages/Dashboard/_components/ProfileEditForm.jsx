import { useState } from 'react';
import { Input } from '../../../components/Input';
import { Button } from '../../../components/Button';
import apiClient from '../../../api/client';
import { useSession } from '../../../contexts/SessionContext';

export const ProfileEditForm = ({ user }) => {
  const { refreshUser } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [interestInput, setInterestInput] = useState('');

  const [formData, setFormData] = useState({
    name: user.name || '',
    phone: user.phone || '',
    bio: user.bio || '',
    gender: user.gender || '',
    dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    city: user.city || '',
    country: user.country || '',
    educationLevel: user.educationLevel || '',
    institution: user.institution || '',
    fieldOfStudy: user.fieldOfStudy || '',
    interests: user.interests || [],
  });

  const handleChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        name: formData.name,
      };

      if (formData.phone) payload.phone = formData.phone;
      if (formData.bio) payload.bio = formData.bio;
      if (formData.gender) payload.gender = formData.gender;
      if (formData.dateOfBirth) payload.dateOfBirth = formData.dateOfBirth;
      if (formData.city) payload.city = formData.city;
      if (formData.country) payload.country = formData.country;
      if (formData.educationLevel)
        payload.educationLevel = formData.educationLevel;
      if (formData.institution) payload.institution = formData.institution;
      if (formData.fieldOfStudy) payload.fieldOfStudy = formData.fieldOfStudy;
      if (formData.interests.length > 0) payload.interests = formData.interests;

      await apiClient.patch('/users/updateUser', payload);
      await refreshUser();

      setMessage('Profile updated successfully!');
      setIsEditing(false);

      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user.name || '',
      phone: user.phone || '',
      bio: user.bio || '',
      gender: user.gender || '',
      dateOfBirth: user.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
      city: user.city || '',
      country: user.country || '',
      educationLevel: user.educationLevel || '',
      institution: user.institution || '',
      fieldOfStudy: user.fieldOfStudy || '',
      interests: user.interests || [],
    });
    setInterestInput('');
    setIsEditing(false);
    setError('');
  };

  const addInterest = () => {
    if (
      interestInput.trim() &&
      !formData.interests.includes(interestInput.trim())
    ) {
      setFormData(prev => ({
        ...prev,
        interests: [...prev.interests, interestInput.trim()],
      }));
      setInterestInput('');
    }
  };

  const removeInterest = interestToRemove => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.filter(
        interest => interest !== interestToRemove
      ),
    }));
  };

  if (!isEditing) {
    return (
      <div className="mt-4">
        <Button variant="secondary" onClick={() => setIsEditing(true)}>
          Edit Profile
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Edit Profile</h3>

      {message && (
        <div className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Basic Information */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Basic Information</h4>

          <Input
            type="text"
            label="Full Name"
            placeholder="Your name"
            value={formData.name}
            onChange={e => handleChange('name', e.target.value)}
            required
          />

          <Input
            type="email"
            label="Email"
            placeholder="Your email"
            value={user.email}
            disabled
          />

          <Input
            type="tel"
            label="Phone"
            placeholder="Your phone number"
            value={formData.phone}
            onChange={e => handleChange('phone', e.target.value)}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-4 py-2 transition outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
              value={formData.gender}
              onChange={e => handleChange('gender', e.target.value)}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
              <option value="prefer-not-to-say">Prefer not to say</option>
            </select>
          </div>

          <Input
            type="date"
            label="Date of Birth"
            value={formData.dateOfBirth}
            onChange={e => handleChange('dateOfBirth', e.target.value)}
            max={new Date().toISOString().split('T')[0]}
          />

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-300 px-4 py-2 transition outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
              placeholder="Tell us about yourself"
              value={formData.bio}
              onChange={e => handleChange('bio', e.target.value)}
              rows={3}
            />
          </div>
        </div>

        {/* Location */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Location</h4>

          <Input
            type="text"
            label="City"
            placeholder="Your city"
            value={formData.city}
            onChange={e => handleChange('city', e.target.value)}
          />

          <Input
            type="text"
            label="Country"
            placeholder="Your country"
            value={formData.country}
            onChange={e => handleChange('country', e.target.value)}
          />
        </div>

        {/* Education */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Education</h4>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Education Level
            </label>
            <select
              className="w-full rounded-lg border border-gray-300 px-4 py-2 transition outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500"
              value={formData.educationLevel}
              onChange={e => handleChange('educationLevel', e.target.value)}
            >
              <option value="">Select education level</option>
              <option value="high-school">High School</option>
              <option value="associate">Associate Degree</option>
              <option value="bachelor">Bachelor's Degree</option>
              <option value="master">Master's Degree</option>
              <option value="doctorate">Doctorate</option>
              <option value="other">Other</option>
            </select>
          </div>

          <Input
            type="text"
            label="Institution"
            placeholder="Your school/university"
            value={formData.institution}
            onChange={e => handleChange('institution', e.target.value)}
          />

          <Input
            type="text"
            label="Field of Study"
            placeholder="Your major/field"
            value={formData.fieldOfStudy}
            onChange={e => handleChange('fieldOfStudy', e.target.value)}
          />
        </div>

        {/* Interests */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Interests
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Add an interest"
              value={interestInput}
              onChange={e => setInterestInput(e.target.value)}
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addInterest();
                }
              }}
            />
            <Button type="button" variant="secondary" onClick={addInterest}>
              Add
            </Button>
          </div>
          {formData.interests.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.interests.map((interest, index) => (
                <span
                  key={index}
                  className="flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-700"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => removeInterest(interest)}
                    className="ml-1 hover:text-blue-900"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex space-x-3">
          <Button type="submit" isLoading={isLoading}>
            Save Changes
          </Button>
          <Button
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};
