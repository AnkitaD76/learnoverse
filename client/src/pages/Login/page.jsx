import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSession } from '../../contexts/SessionContext';
import { Card } from '../../components/Card';
import { LoginForm } from './_components/LoginForm';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useSession();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        const result = await login(email, password);

        if (result.success) {
            navigate('/dashboard');
        } else {
            setErrors({ general: result.error });
        }

        setIsLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <h1 className="mb-6 text-center text-2xl font-bold text-[#1A1A1A]">
                    Welcome Back
                </h1>

                {errors.general && (
                    <div className="mb-4 rounded-lg bg-red-100 p-3 text-sm text-red-700">
                        {errors.general}
                    </div>
                )}

                <LoginForm
                    email={email}
                    password={password}
                    errors={errors}
                    isLoading={isLoading}
                    onEmailChange={e => setEmail(e.target.value)}
                    onPasswordChange={e => setPassword(e.target.value)}
                    onSubmit={handleSubmit}
                />

                <p className="mt-4 text-center text-sm text-[#4A4A4A]">
                    Don't have an account?{' '}
                    <Link
                        to="/register"
                        className="text-[#043F7B] hover:underline"
                    >
                        Register
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default LoginPage;
