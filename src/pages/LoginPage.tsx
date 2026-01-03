import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, UserCircle, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { signIn, confirmNewPassword } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsPasswordChange, setNeedsPasswordChange] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(username, password);
      navigate('/app');
    } catch (err: any) {
      console.error('Login error:', err);
      if (err.code === 'UserNotFoundException') {
        setError('No account found with this email or username.');
      } else if (err.code === 'NotAuthorizedException') {
        setError('Incorrect email/username or password.');
      } else if (err.code === 'UserNotConfirmedException') {
        setError('Please verify your account before signing in.');
      } else if (err.code === 'NewPasswordRequired') {
        // Switch to password change form
        setNeedsPasswordChange(true);
        setError('');
      } else {
        setError(err.message || 'An error occurred during sign in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Validate password requirements
    if (newPassword.length < 12) {
      setError('Password must be at least 12 characters long.');
      return;
    }

    const hasUpper = /[A-Z]/.test(newPassword);
    const hasLower = /[a-z]/.test(newPassword);
    const hasNumber = /[0-9]/.test(newPassword);
    const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);

    if (!hasUpper || !hasLower || !hasNumber || !hasSymbol) {
      setError('Password must contain uppercase, lowercase, number, and special character.');
      return;
    }

    setLoading(true);

    try {
      await confirmNewPassword(newPassword);
      navigate('/app');
    } catch (err: any) {
      console.error('Password change error:', err);
      setError(err.message || 'Failed to set new password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-500 via-orange-600 to-primary-blue-500 flex items-center justify-center p-6">
      {/* Decorative glowing elements */}
      <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-primary-blue-600/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo/Brand */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <Activity size={48} className="text-white" />
          <h1 className="text-4xl font-bold text-white">Javelina</h1>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-neutral-900 mb-2 text-center">
            {needsPasswordChange ? 'Set New Password' : 'Welcome Back'}
          </h2>
          <p className="text-neutral-600 text-center mb-8">
            {needsPasswordChange
              ? 'Please set a permanent password for your account'
              : 'Sign in to access your ER notes'
            }
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {needsPasswordChange ? (
            <form onSubmit={handlePasswordChange} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Min 12 characters"
                    autoComplete="new-password"
                  />
                </div>
                <p className="mt-1 text-xs text-neutral-500">
                  Must include uppercase, lowercase, number, and special character
                </p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <Lock
                    size={20}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                  />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                {loading ? 'Setting Password...' : 'Set Password & Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-neutral-700 mb-2">
                  Email or Username
                </label>
              <div className="relative">
                <UserCircle
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter email or username"
                  autoComplete="username"
                />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-2">
                  Password
                </label>
              <div className="relative">
                <Lock
                  size={20}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400"
                />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-11 pr-4 py-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              {needsPasswordChange
                ? 'Setting password for first-time login'
                : 'Contact your administrator to create an account'
              }
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-white/80">
            HIPAA-compliant secure authentication
          </p>
        </div>
      </div>
    </div>
  );
}
