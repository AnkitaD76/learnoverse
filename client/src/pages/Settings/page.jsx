import { Link } from 'react-router-dom';
import { Card } from '../../components/Card';

const SettingsPage = () => {
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="mx-auto max-w-4xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        Settings
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Manage your application settings and preferences
                    </p>
                </div>

                <Card className="p-6">
                    <div className="space-y-6">
                        <div>
                            <h3 className="mb-2 text-lg font-semibold text-gray-800">
                                Quick Links
                            </h3>
                            <div className="space-y-2">
                                <Link
                                    to="/profile"
                                    className="block text-blue-600 hover:underline"
                                >
                                    → Go to Profile Settings
                                </Link>
                                <Link
                                    to="/dashboard"
                                    className="block text-blue-600 hover:underline"
                                >
                                    → Go to Dashboard
                                </Link>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 pt-6">
                            <h3 className="mb-4 text-lg font-semibold text-gray-800">
                                Preferences
                            </h3>
                            <p className="text-gray-600">
                                Additional settings coming soon...
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;
