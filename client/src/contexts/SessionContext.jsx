import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import apiClient, { setAccessToken, clearAccessToken } from '../api/client';

const SessionContext = createContext(null);

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within SessionProvider');
    }
    return context;
};

export const SessionProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    // Initialize session on mount
    useEffect(() => {
        const initializeSession = async () => {
            try {
                const response = await apiClient.get('/users/showMe');
                const { user } = response.data;

                setUser(user);
                setIsAuthenticated(true);
            } catch (error) {
                // No valid access token cookie - user needs to log in
                clearAccessToken();
                setUser(null);
                setIsAuthenticated(false);
            } finally {
                setIsLoading(false);
            }
        };

        initializeSession();
    }, []); // Listen for session expiration events
    useEffect(() => {
        const handleSessionExpired = () => {
            // Don't redirect to login if user is on a public auth page
            const publicRoutes = [
                '/login',
                '/register',
                '/forgot-password',
                '/reset-password',
                '/verify-email',
                '/',
            ];
            const isPublicRoute = publicRoutes.some(route =>
                location.pathname.startsWith(route)
            );

            setUser(null);
            setIsAuthenticated(false);
            clearAccessToken();

            // Only redirect to login if not already on a public route
            if (!isPublicRoute) {
                navigate('/login', { replace: true });
            }
        };

        window.addEventListener('auth:session-expired', handleSessionExpired);

        return () => {
            window.removeEventListener(
                'auth:session-expired',
                handleSessionExpired
            );
        };
    }, [navigate, location.pathname]);

    const login = async (email, password) => {
        try {
            const response = await apiClient.post('/auth/login', {
                email,
                password,
            });
            const { accessToken, user } = response.data;

            setAccessToken(accessToken);
            setUser(user);
            setIsAuthenticated(true);

            return { success: true, user };
        } catch (error) {
            const message = error.response?.data?.message || 'Login failed';
            return { success: false, error: message };
        }
    };

    const logout = async () => {
        try {
            await apiClient.post('/auth/logout');
        } catch (error) {
            // Logout anyway even if request fails
            console.error('Logout error:', error);
        } finally {
            clearAccessToken();
            setUser(null);
            setIsAuthenticated(false);
            navigate('/login', { replace: true });
        }
    };

    const refreshUser = async () => {
        try {
            const response = await apiClient.get('/users/showMe');
            setUser(response.data.user);
            return { success: true, user: response.data.user };
        } catch (error) {
            const message =
                error.response?.data?.message || 'Failed to fetch user';
            return { success: false, error: message };
        }
    };

    const value = {
        user,
        isLoading,
        isAuthenticated,
        login,
        logout,
        refreshUser,
    };

    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};
