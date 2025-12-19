import { EyeClosed, Eye } from 'lucide-react';
import { useState } from 'react';

export const PasswordInput = ({ label, error, ...props }) => {
    const [showPassword, setShowPassword] = useState(false);
    return (
        <div className="relative w-full">
            {label && (
                <label className="mb-1 block text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                className={`w-full rounded-lg border px-4 py-2 transition outline-none focus:border-transparent focus:ring-2 focus:ring-blue-500 ${
                    error ? 'border-red-500' : 'border-gray-300'
                }`}
                type={showPassword ? 'text' : 'password'}
                {...props}
            />
            <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-9 right-3 opacity-90 hover:opacity-100 focus:outline-none"
            >
                {showPassword ? <EyeClosed /> : <Eye />}
            </button>
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};
