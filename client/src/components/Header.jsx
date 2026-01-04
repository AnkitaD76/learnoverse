import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { useSession } from '../contexts/SessionContext';
import { SearchBar } from './SearchBar';

const navigationRoutes = [
  { name: 'Courses', path: '/courses' },
  { name: 'My Courses', path: '/my-courses' },
  { name: 'Q&A', path: '/qa' },
  { name: 'Posts', path: '/posts' },
];

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useSession();

  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  const getInitials = name => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#FF6A00]">
                <span className="text-xl font-bold text-white">L</span>
              </div>
              <span className="text-xl font-bold text-[#1A1A1A]">
                Learnoverse
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            {navigationRoutes.map(route => (
              <Link
                key={route.path}
                to={route.path}
                className="text-[#4A4A4A] transition-colors hover:text-[#FF6A00]"
              >
                {route.name}
              </Link>
            ))}
          </div>

          {/* Global Search Bar */}
          <div className="hidden md:mx-8 md:block md:max-w-md md:flex-1">
            <SearchBar />
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 rounded-full focus:ring-2 focus:ring-[#FF6A00] focus:ring-offset-2 focus:outline-none"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF6A00] font-semibold text-white">
                    {getInitials(user.name)}
                  </div>
                  <svg
                    className={`h-4 w-4 text-gray-600 transition-transform ${
                      isUserMenuOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="ring-opacity-5 absolute right-0 z-20 mt-2 w-52 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black">
                      <div className="border-b border-gray-100 px-4 py-2">
                        <p className="text-sm font-semibold text-gray-900">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-gray-600">
                          {user.email}
                        </p>
                      </div>

                      <Link
                        to="/dashboard"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>

                      {/* ✅ Notifications */}
                      <Link
                        to="/notifications"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        🔔 Notifications
                      </Link>

                      <Link
                        to="/my-courses"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Courses
                      </Link>

                      <Link
                        to="/achievements"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        🏆 Achievements
                      </Link>

                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile
                      </Link>

                      <Link
                        to="/wallet"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Wallet
                      </Link>

                      {user.role === 'admin' && (
                        <Link
                          to="/admin/reports"
                          className="block px-4 py-2 text-sm font-medium text-orange-600 hover:bg-orange-50"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          Admin Reports
                        </Link>
                      )}

                      <button
                        onClick={handleLogout}
                        className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" className="bg-[#FF6A00] hover:bg-[#E55F00]">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center rounded-md p-2 text-[#4A4A4A] hover:bg-gray-100 hover:text-[#1A1A1A] focus:ring-2 focus:ring-[#FF6A00] focus:outline-none focus:ring-inset"
            >
              {!isMobileMenuOpen ? (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
                  />
                </svg>
              ) : (
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="space-y-1 pt-2 pb-3">
              {navigationRoutes.map(route => (
                <Link
                  key={route.path}
                  to={route.path}
                  className="block px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-50 hover:text-[#FF6A00]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {route.name}
                </Link>
              ))}

              <div className="mt-4 space-y-2 px-3">
                {isAuthenticated && user ? (
                  <>
                    <div className="border-b border-gray-200 px-3 py-2">
                      <p className="text-sm font-semibold text-gray-900">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-gray-600">
                        {user.email}
                      </p>
                    </div>

                    <Link
                      to="/dashboard"
                      className="block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        Dashboard
                      </Button>
                    </Link>

                    {/* ✅ Notifications */}
                    <Link
                      to="/notifications"
                      className="block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        🔔 Notifications
                      </Button>
                    </Link>

                    <Link
                      to="/my-courses"
                      className="block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        My Courses
                      </Button>
                    </Link>

                    <Link
                      to="/achievements"
                      className="block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        🏆 Achievements
                      </Button>
                    </Link>

                    <Link
                      to="/profile"
                      className="block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        Profile
                      </Button>
                    </Link>

                    <Button
                      onClick={handleLogout}
                      variant="danger"
                      className="w-full"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button variant="outline" className="w-full">
                        Login
                      </Button>
                    </Link>
                    <Link
                      to="/register"
                      className="block"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Button className="w-full bg-[#FF6A00] hover:bg-[#E55F00]">
                        Get Started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
