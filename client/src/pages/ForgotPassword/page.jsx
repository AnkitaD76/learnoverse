import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../../components/Card';
import { EmailInput } from './_components/EmailInput';
import { SendButton } from './_components/SendButton';
import apiClient from '../../api/client';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      setMessage(response.data.message);
      setEmail('');
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || 'Failed to send reset email';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-gray-800">
          Forgot Password
        </h1>
        <p className="mb-6 text-center text-sm text-gray-600">
          Enter your email to receive a password reset link
        </p>

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
          <EmailInput
            value={email}
            onChange={e => setEmail(e.target.value)}
            error=""
          />

          <SendButton isLoading={isLoading} />
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

export default ForgotPasswordPage;
