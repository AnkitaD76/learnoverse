import { useState, useEffect } from 'react';
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

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [token, setToken] = useState(searchParams.get('token') || '');
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

    // Validate passwords match
    if (password !== confirmPassword) {
      setErrors({ confirmPassword: 'Passwords do not match' });
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (password.length < 8) {
      setErrors({ password: 'Password must be at least 8 characters' });
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
        err.response?.data?.message || 'Failed to reset password';
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Reset Password
        </h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          Enter your new password below
        </p>

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
          />

          <Input
            type="text"
            label="Reset Token"
            placeholder="Enter reset token from email"
            value={token}
            onChange={e => setToken(e.target.value)}
            required
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

        <p className="mt-4 text-center text-sm text-gray-600">
          Remember your password?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;
