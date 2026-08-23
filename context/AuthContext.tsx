import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { initializeDatabase } from '@/database/schema';
import {
  clearSavedSession,
  createUser,
  getLastUsername,
  getSavedSession,
  getSessionMode,
  getUserById,
  getUsers,
  isValidUsername,
  loginUser,
  normalizeUsername,
  saveSession,
  setLastUsername,
  setSessionMode as saveSessionMode,
  SessionMode,
  updatePassword,
  updateUsername,
  User,
} from '@/database/users';

import { AppState } from 'react-native';

type AuthContextType = {
  user: User | null;
  users: User[];
  loading: boolean;
  selectedUsername: string;
  sessionMode: SessionMode;
  login: (username: string, password: string) => Promise<string | null>;
  register: (username: string, password: string) => Promise<string | null>;
  logout: () => Promise<void>;
  selectUsername: (username: string) => void;
  refreshUsers: () => Promise<void>;
  changeUsername: (username: string) => Promise<string | null>;
  changePassword: (password: string) => Promise<string | null>;
  changeSessionMode: (mode: SessionMode) => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUsername, setSelectedUsername] = useState('');
  const [sessionMode, setSessionModeState] = useState<SessionMode>('close');
  const [loading, setLoading] = useState(true);
  const expiryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = () => {
    if (expiryTimer.current !== null) {
      clearTimeout(expiryTimer.current);
      expiryTimer.current = null;
    }
  };

  const refreshUsers = async () => {
    const rows = await getUsers();
    setUsers(rows);
  };

  const setExpiryTimer = (expiresAt: string) => {
    clearTimer();

    const ms = new Date(expiresAt).getTime() - Date.now();

    if (ms <= 0) {
      void clearSavedSession();
      setUser(null);
      return;
    }

    expiryTimer.current = setTimeout(async () => {
      await clearSavedSession();
      setUser(null);
      setSessionModeState('close');
    }, ms);
  };

  const createExpiration = (mode: SessionMode) => {
    if (mode === '12h') {
      return new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString();
    }
    return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
  };

  const checkStoredSession = async () => {
    const savedSession = await getSavedSession();
    if (!savedSession) return;

    const expiresMs = new Date(savedSession.expires_at).getTime();

    if (!Number.isFinite(expiresMs) || expiresMs <= Date.now()) {
      await clearSavedSession();
      clearTimer();
      setUser(null);
      setSessionModeState('close');
      return;
    }

    const savedUser = await getUserById(savedSession.user_id);
    if (!savedUser) {
      await clearSavedSession();
      clearTimer();
      setUser(null);
      setSessionModeState('close');
      return;
    }

    const mode = await getSessionMode(savedUser.id);
    setUser(savedUser);
    setSelectedUsername(savedUser.username);
    setSessionModeState(mode);
    setExpiryTimer(savedSession.expires_at);
  };

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await initializeDatabase();

        const [savedUsers, lastUsername, savedSession] = await Promise.all([
          getUsers(),
          getLastUsername(),
          getSavedSession(),
        ]);

        if (!mounted) return;

        setUsers(savedUsers);
        setSelectedUsername(lastUsername);

        if (savedSession) {
          const expiresMs = new Date(savedSession.expires_at).getTime();

          if (expiresMs > Date.now()) {
            const savedUser = await getUserById(savedSession.user_id);
            if (savedUser && mounted) {
              const mode = await getSessionMode(savedUser.id);
              setUser(savedUser);
              setSelectedUsername(savedUser.username);
              setSessionModeState(mode);
              setExpiryTimer(savedSession.expires_at);
            }
          } else {
            await clearSavedSession();
          }
        }
      } catch (error) {
        console.error('Database initialization failed:', error);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void initialize();

    return () => {
      mounted = false;
      clearTimer();
    };
  }, []);

  const login = async (username: string, password: string) => {
    const cleanUsername = normalizeUsername(username);

    if (!isValidUsername(cleanUsername)) {
      return 'Username can contain lowercase letters only.';
    }

    if (!password) return 'Password is required.';

    try {
      const loggedInUser = await loginUser(cleanUsername, password);

      if (!loggedInUser) {
        return 'Incorrect username or password.';
      }

      const mode = await getSessionMode(loggedInUser.id);

      await clearSavedSession();

      if (mode !== 'close') {
        const expiresAt = createExpiration(mode);
        await saveSession(loggedInUser.id, expiresAt);
        setExpiryTimer(expiresAt);
      } else {
        clearTimer();
      }

      await setLastUsername(loggedInUser.username);

      setUser(loggedInUser);
      setSelectedUsername(loggedInUser.username);
      setSessionModeState(mode);
      return null;
    } catch (error) {
      console.error('Login failed:', error);
      return 'Unable to log in.';
    }
  };

  const register = async (username: string, password: string) => {
    try {
      const cleanUsername = normalizeUsername(username);

      if (!isValidUsername(cleanUsername)) {
        return 'Username can contain lowercase letters only.';
      }

      if (!password) return 'Password is required.';

      await createUser(cleanUsername, password);
      await refreshUsers();
      setSelectedUsername(cleanUsername);
      await setLastUsername(cleanUsername);

      return null;
    } catch (error) {
      console.error('Registration failed:', error);
      return error instanceof Error ? error.message : 'Could not create the account.';
    }
  };

  const logout = async () => {
    clearTimer();
    await clearSavedSession();

    if (user) {
      await setLastUsername(user.username);
      setSelectedUsername(user.username);
    }

    setUser(null);
  };

  const changeUsername = async (newUsername: string) => {
    if (!user) return 'You are not logged in.';

    try {
      await updateUsername(user.id, newUsername);

      const updated = {
        ...user,
        username: normalizeUsername(newUsername),
      };

      setUser(updated);
      setSelectedUsername(updated.username);
      await refreshUsers();

      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Could not change username.';
    }
  };

  const changePassword = async (password: string) => {
    if (!user) return 'You are not logged in.';

    try {
      await updatePassword(user.id, password);
      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Could not change password.';
    }
  };

  const changeSessionMode = async (mode: SessionMode) => {
    if (!user) return 'You are not logged in.';

    try {
      await saveSessionMode(user.id, mode);
      setSessionModeState(mode);
      clearTimer();
      await clearSavedSession();

      if (mode !== 'close') {
        const expiresAt = createExpiration(mode);
        await saveSession(user.id, expiresAt);
        setExpiryTimer(expiresAt);
      }

      return null;
    } catch (error) {
      return error instanceof Error ? error.message : 'Could not change session setting.';
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void checkStoredSession();
      }
    });

    return () => subscription.remove();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        users,
        loading,
        selectedUsername,
        sessionMode,
        login,
        register,
        logout,
        selectUsername: setSelectedUsername,
        refreshUsers,
        changeUsername,
        changePassword,
        changeSessionMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used inside AuthProvider');
  return value;
}
