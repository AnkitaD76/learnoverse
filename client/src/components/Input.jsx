export const Input = ({ label, error, ...props }) => {
    return (
        <div className="w-full">
            {label && (
                <label className="mb-1 block text-sm font-medium text-[#4A4A4A]">
                    {label}
                </label>
            )}
            <input
                className={`w-full rounded-lg border px-4 py-2 transition outline-none focus:border-transparent focus:ring-2 focus:ring-[#FF6A00] ${
                    error ? 'border-red-500' : 'border-gray-300'
                }`}
                {...props}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};
