import { useState } from 'react';
import { useSession } from '../../contexts/SessionContext';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { Button } from '../../components/Button';
import apiClient from '../../api/client';
import { useRef } from 'react';
import ReportButton from '../../components/ReportButton';
import ReportModal from '../../components/ReportModal';

const ProfilePage = () => {
  const { user, refreshUser } = useSession();
  const [activeTab, setActiveTab] = useState('personal');
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef(null);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [interestInput, setInterestInput] = useState('');

  // Personal Info State
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    linkedin: user?.linkedin || '',
    website: user?.website || '',
    github: user?.github || '',
    gender: user?.gender || '',
    dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
    city: user?.city || '',
    country: user?.country || '',
    educationLevel: user?.educationLevel || '',
    institution: user?.institution || '',
    fieldOfStudy: user?.fieldOfStudy || '',
    interests: user?.interests || [],
  });

  // Password State
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmitPersonalInfo = async e => {
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
      if (formData.linkedin) payload.linkedin = formData.linkedin;
      if (formData.website) payload.website = formData.website;
      if (formData.github) payload.github = formData.github;

      await apiClient.patch('/users/updateUser', payload);
      await refreshUser();

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to update profile';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarChange = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarPreview(URL.createObjectURL(file));
  };

  const uploadAvatar = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const { data } = await apiClient.patch('/users/uploadAvatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await refreshUser();
      setAvatarPreview(data.avatar);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPassword = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      await apiClient.patch('/users/updateUserPassword', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      setMessage('Password updated successfully!');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to update password';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
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

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#1A1A1A]">
            Profile Settings
          </h1>
          <p className="mt-2 text-[#4A4A4A]">
            Manage your account information and preferences
          </p>
        </div>

        {/* Profile quick links */}
        <div className="mb-6 flex items-center gap-4">
          {user?.linkedin && (
            <a
              href={user.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700 hover:underline"
            >
              LinkedIn
            </a>
          )}

          {user?.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700 hover:underline"
            >
              Website
            </a>
          )}
          {user?.github && (
            <a
              href={user.github}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-black/5 px-3 py-2 text-sm text-gray-800 hover:underline"
            >
              GitHub
            </a>
          )}
        </div>

        {/* Avatar upload */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-[#4A4A4A]">
            Profile Image
          </label>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-full bg-gray-100">
              {avatarPreview ? (
                // If preview is a blob url or uploaded path
                <img
                  src={avatarPreview}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-sm text-gray-500">
                  No image
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
                id="avatarInput"
              />
              <label
                htmlFor="avatarInput"
                className="cursor-pointer rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-[#1A1A1A] hover:bg-gray-50"
              >
                Choose Image
              </label>
              <Button
                type="button"
                onClick={uploadAvatar}
                isLoading={isLoading}
              >
                Upload
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('personal')}
              className={`pb-4 text-sm font-medium transition-colors ${
                activeTab === 'personal'
                  ? 'border-b-2 border-[#FF6A00] text-[#FF6A00]'
                  : 'text-[#4A4A4A] hover:text-[#1A1A1A]'
              }`}
            >
              Personal Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`pb-4 text-sm font-medium transition-colors ${
                activeTab === 'password'
                  ? 'border-b-2 border-[#FF6A00] text-[#FF6A00]'
                  : 'text-[#4A4A4A] hover:text-[#1A1A1A]'
              }`}
            >
              Password & Security
            </button>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className="mb-6 rounded-lg bg-green-100 p-4 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="mb-6 rounded-lg bg-red-100 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Personal Information Tab */}
        {activeTab === 'personal' && (
          <Card className="p-6">
            <form onSubmit={handleSubmitPersonalInfo} className="space-y-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#1A1A1A]">
                  Basic Information
                </h3>

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
                  value={user?.email}
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
                  <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">
                    Gender
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 transition outline-none focus:border-transparent focus:ring-2 focus:ring-[#FF6A00]"
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
                  <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">
                    Bio
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 transition outline-none focus:border-transparent focus:ring-2 focus:ring-[#FF6A00]"
                    placeholder="Tell us about yourself"
                    value={formData.bio}
                    onChange={e => handleChange('bio', e.target.value)}
                    rows={3}
                  />
                </div>
                <div>
                  <h4 className="mb-2 text-sm font-medium text-[#4A4A4A]">
                    Social Links
                  </h4>
                  <Input
                    type="url"
                    label="LinkedIn Profile URL"
                    placeholder="https://www.linkedin.com/in/your-profile"
                    value={formData.linkedin}
                    onChange={e => handleChange('linkedin', e.target.value)}
                  />
                  <Input
                    type="url"
                    label="Website URL"
                    placeholder="https://your-website.example"
                    value={formData.website}
                    onChange={e => handleChange('website', e.target.value)}
                  />
                  <Input
                    type="url"
                    label="GitHub Profile URL"
                    placeholder="https://github.com/your-username"
                    value={formData.github}
                    onChange={e => handleChange('github', e.target.value)}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#1A1A1A]">
                  Location
                </h3>

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
                <h3 className="text-lg font-semibold text-[#1A1A1A]">
                  Education
                </h3>

                <div>
                  <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">
                    Education Level
                  </label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 transition outline-none focus:border-transparent focus:ring-2 focus:ring-[#FF6A00]"
                    value={formData.educationLevel}
                    onChange={e =>
                      handleChange('educationLevel', e.target.value)
                    }
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
                <h3 className="text-lg font-semibold text-[#1A1A1A]">
                  Interests
                </h3>
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
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={addInterest}
                  >
                    Add
                  </Button>
                </div>
                {formData.interests.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="flex items-center gap-1 rounded-full bg-orange-100 px-3 py-1 text-sm text-[#FF6A00]"
                      >
                        {interest}
                        <button
                          type="button"
                          onClick={() => removeInterest(interest)}
                          className="ml-1 hover:text-[#E55F00]"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button type="submit" isLoading={isLoading}>
                  Save Changes
                </Button>
              </div>
            </form>
          </Card>
        )}

        {/* Password Tab */}
        {activeTab === 'password' && (
          <Card className="p-6">
            <form onSubmit={handleSubmitPassword} className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#1A1A1A]">
                  Change Password
                </h3>
                <p className="text-sm text-[#4A4A4A]">
                  Ensure your account is using a strong password to stay secure.
                </p>

                <Input
                  type="password"
                  label="Current Password"
                  placeholder="Enter your current password"
                  value={passwordData.oldPassword}
                  onChange={e =>
                    handlePasswordChange('oldPassword', e.target.value)
                  }
                  required
                />

                <Input
                  type="password"
                  label="New Password"
                  placeholder="Enter new password (min. 6 characters)"
                  value={passwordData.newPassword}
                  onChange={e =>
                    handlePasswordChange('newPassword', e.target.value)
                  }
                  required
                />

                <Input
                  type="password"
                  label="Confirm New Password"
                  placeholder="Confirm your new password"
                  value={passwordData.confirmPassword}
                  onChange={e =>
                    handlePasswordChange('confirmPassword', e.target.value)
                  }
                  required
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" isLoading={isLoading}>
                  Update Password
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
