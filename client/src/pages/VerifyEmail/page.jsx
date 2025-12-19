import { useState, useEffect } from 'react';
import {
  Link,
  useNavigate,
  useLocation,
  useSearchParams,
} from 'react-router-dom';
import { Card } from '../../components/Card';
import { Input } from '../../components/Input';
import { TokenInput } from './_components/TokenInput';
import { VerifyButton } from './_components/VerifyButton';
import apiClient from '../../api/client';

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(location.state?.email || '');
  const [token, setToken] = useState(searchParams.get('token') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Auto-verify if token is in URL
  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlEmail = searchParams.get('email');

    if (urlToken && urlEmail) {
      setEmail(urlEmail);
      setToken(urlToken);
      handleVerify(urlEmail, urlToken);
    }
  }, [searchParams]);

  const handleVerify = async (emailParam, tokenParam) => {
    const emailToUse = emailParam || email;
    const tokenToUse = tokenParam || token;

    if (!emailToUse || !tokenToUse) {
      setError('Please provide both email and verification token'); 
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await apiClient.post('/auth/verify-email', {
        email: emailToUse,
        verificationToken: tokenToUse,
      });

      setMessage(response.data.message);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Verification failed';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = e => {
    e.preventDefault();
    handleVerify();
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <h1 className="mb-2 text-center text-2xl font-bold text-[#1A1A1A]">
          Verify Your Email
        </h1>
        <p className="mb-6 text-center text-sm text-[#4A4A4A]">
          Check your inbox for the verification token
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
          <Input
            type="email"
            label="Email"
            placeholder="Enter your email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <TokenInput
            value={token}
            onChange={e => setToken(e.target.value)}
            error=""
          />

          <VerifyButton isLoading={isLoading} />
        </form>

        <p className="mt-4 text-center text-sm text-[#4A4A4A]">
          Already verified?{' '}
          <Link to="/login" className="text-[#043F7B] hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default VerifyEmailPage;
