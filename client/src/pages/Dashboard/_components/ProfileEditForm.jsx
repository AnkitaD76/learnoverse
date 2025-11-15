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

  const [formData, setFormData] = useState({
    name: user.name || '',
    age: user.age || '',
    gender: user.gender || '',
    occupation: user.occupation || '',
    location: {
      country: user.location?.country || '',
      state: user.location?.state || '',
      city: user.location?.city || '',
    },
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

      if (formData.age) payload.age = parseInt(formData.age);
      if (formData.gender) payload.gender = formData.gender;
      if (formData.occupation) payload.occupation = formData.occupation;

      if (
        formData.location.country ||
        formData.location.state ||
        formData.location.city
      ) {
        payload.location = formData.location;
      }

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
      age: user.age || '',
      gender: user.gender || '',
      occupation: user.occupation || '',
      location: {
        country: user.location?.country || '',
        state: user.location?.state || '',
        city: user.location?.city || '',
      },
    });
    setIsEditing(false);
    setError('');
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
        <Input
          type="text"
          label="Full Name"
          placeholder="Your name"
          value={formData.name}
          onChange={e => handleChange('name', e.target.value)}
          required
        />

        <Input
          type="number"
          label="Age"
          placeholder="Your age"
          value={formData.age}
          onChange={e => handleChange('age', e.target.value)}
          min="13"
          max="120"
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
          type="text"
          label="Occupation"
          placeholder="Your occupation"
          value={formData.occupation}
          onChange={e => handleChange('occupation', e.target.value)}
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Location
          </label>
          <Input
            type="text"
            placeholder="Country"
            value={formData.location.country}
            onChange={e => handleChange('location.country', e.target.value)}
          />
          <Input
            type="text"
            placeholder="State"
            value={formData.location.state}
            onChange={e => handleChange('location.state', e.target.value)}
          />
          <Input
            type="text"
            placeholder="City"
            value={formData.location.city}
            onChange={e => handleChange('location.city', e.target.value)}
          />
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
