import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card } from '../../components/Card';
import { RegisterForm } from './_components/RegisterForm';
import apiClient from '../../api/client';

const RegisterPage = () => {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        age: '',
        gender: '',
        occupation: '',
        location: {
            country: '',
            state: '',
            city: '',
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
        // Clear error for this field
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});
        setMessage('');

        try {
            // Build request payload
            const payload = {
                email: formData.email,
                name: formData.name,
                password: formData.password,
            };

            // Add optional fields if provided
            if (formData.age) payload.age = parseInt(formData.age);
            if (formData.gender) payload.gender = formData.gender;
            if (formData.occupation) payload.occupation = formData.occupation;

            // Add location if any field is filled
            if (
                formData.location.country ||
                formData.location.state ||
                formData.location.city
            ) {
                payload.location = formData.location;
            }

            const response = await apiClient.post('/auth/register', payload);

            setMessage(response.data.message);

            // Redirect to verify email page after 2 seconds
            setTimeout(() => {
                navigate('/verify-email', { state: { email: formData.email } });
            }, 2000);
        } catch (error) {
            const message =
                error.response?.data?.message || 'Registration failed';
            setErrors({ general: message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <h1 className="mb-6 text-center text-2xl font-bold text-[#1A1A1A]">
                    Create Account
                </h1>

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

                <RegisterForm
                    formData={formData}
                    errors={errors}
                    isLoading={isLoading}
                    onChange={handleChange}
                    onSubmit={handleSubmit}
                />

                <p className="mt-4 text-center text-sm text-[#4A4A4A]">
                    Already have an account?{' '}
                    <Link
                        to="/login"
                        className="text-[#043F7B] hover:underline"
                    >
                        Login
                    </Link>
                </p>
            </Card>
        </div>
    );
};

export default RegisterPage;
