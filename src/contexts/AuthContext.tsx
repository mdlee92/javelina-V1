import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signIn as amplifySignIn, signOut as amplifySignOut, getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

interface User {
  username: string;
  email: string;
  userId: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  getToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthState();
  }, []);

  async function checkAuthState() {
    try {
      const currentUser = await getCurrentUser();
      const { tokens } = await fetchAuthSession();

      setUser({
        username: currentUser.username,
        email: tokens?.idToken?.payload.email as string || '',
        userId: currentUser.userId,
      });
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const { isSignedIn, nextStep } = await amplifySignIn({
        username: email,
        password,
      });

      if (isSignedIn) {
        await checkAuthState();
      } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
        throw new Error('NEW_PASSWORD_REQUIRED');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  async function signOut() {
    try {
      await amplifySignOut();
      setUser(null);
    } catch (error) {
      console.error('Sign out error:', error);
      throw error;
    }
  }

  async function getToken(): Promise<string> {
    try {
      const { tokens } = await fetchAuthSession();
      return tokens?.idToken?.toString() || '';
    } catch (error) {
      console.error('Get token error:', error);
      throw error;
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signOut,
    getToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
