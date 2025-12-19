import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { NewPasswordInput } from './_components/NewPasswordInput';
import { ConfirmPasswordInput } from './_components/ConfirmPasswordInput';
import { ResetButton } from './_components/ResetButton';
import apiClient from '../../api/client';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const token = searchParams.get('token') || '';
  const emailFromUrl = searchParams.get('email') || '';

  const [email, setEmail] = useState(emailFromUrl);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});
    setMessage('');

    // Validate token and email
    if (!token || !email) {
      setErrors({
        general: 'Invalid reset link. Please request a new password reset.',
      });
      setIsLoading(false);
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 6) {
      setErrors({ password: 'Password must be at least 6 characters' });
      setIsLoading(false);
      return;
    }

    try {
      const response = await apiClient.post('/auth/reset-password', {
        token,
        email,
        password,
      });

      setMessage(response.data.message);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        'Password reset failed. Please try again.';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-[#1A1A1A]">
          Reset Password
        </h1>
        <p className="mb-6 text-center text-sm text-[#4A4A4A]">
          Enter your new password below
        </p>

        {!token || !emailFromUrl ? (
          <div className="mb-4 rounded-lg bg-yellow-100 p-3 text-sm text-yellow-700">
            Invalid reset link. Please request a new password reset from the{' '}
            <Link to="/forgot-password" className="font-semibold underline">
              forgot password page
            </Link>
            .
          </div>
        ) : null}

        {message && (
          <div className="mb-4 rounded-lg bg-green-100 p-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {errors.general && (
          <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            disabled={!!emailFromUrl}
          />

          <NewPasswordInput
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
          />

          <ConfirmPasswordInput
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
          />

          <ResetButton isLoading={isLoading} />
        </form>

        <p className="mt-4 text-center text-sm text-[#4A4A4A]">
          Remember your password?{' '}
          <Link to="/login" className="text-[#043F7B] hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
