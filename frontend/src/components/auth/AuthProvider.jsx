import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../hooks/useAuth.js';
import api, { configureApiAuth } from '../../services/api.js';

const initialSession = { user: null, token: null, error: '', expiresAt: null };
const sessionKey = 'sage-auth-session';
const expiredSession = { ...initialSession, error: 'Seu acesso expirou. Entre novamente.' };

function readSession() {
  try {
    const saved = JSON.parse(window.sessionStorage.getItem(sessionKey));
    if (typeof saved?.token === 'string' && saved.token && Number.isFinite(Date.parse(saved.expiresAt))) {
      return { ...initialSession, token: saved.token, expiresAt: saved.expiresAt };
    }
  } catch {
    return initialSession;
  }
  return initialSession;
}

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const [restoreError, setRestoreError] = useState('');
  const sessionRef = useRef(session);
  const location = useLocation();
  const navigate = useNavigate();

  const updateSession = useCallback((nextSession) => {
    sessionRef.current = nextSession;
    setSession(nextSession);
    try {
      if (nextSession.token) {
        window.sessionStorage.setItem(sessionKey, JSON.stringify({
          token: nextSession.token,
          expiresAt: nextSession.expiresAt,
        }));
      } else {
        window.sessionStorage.removeItem(sessionKey);
      }
    } catch {
      return;
    }
  }, []);

  const expireSession = useCallback(() => {
    updateSession(expiredSession);
    if (location.pathname === '/sage/redefinir-senha') return;
    navigate('/sage/login', {
      replace: true,
      state: { from: location.pathname + location.search },
    });
  }, [location.pathname, location.search, navigate, updateSession]);

  useEffect(() => configureApiAuth({
    getToken: () => sessionRef.current.token,
    onUnauthorized: expireSession,
  }), [expireSession]);

  useEffect(() => {
    const saved = sessionRef.current;
    if (!saved.token || saved.user) return;
    if (Date.parse(saved.expiresAt) <= Date.now()) {
      updateSession(expiredSession);
      return;
    }

    const controller = new AbortController();
    api.get('/auth/me', { signal: controller.signal, notifyUnauthorized: false })
      .then(({ data }) => {
        if (!controller.signal.aborted) updateSession({ ...saved, user: data.data });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if (error.status === 401) updateSession(expiredSession);
        else setRestoreError('Não foi possível verificar sua sessão. Tente novamente.');
      });
    return () => controller.abort();
  }, [updateSession]);

  const clearResetAccountSession = useCallback((email) => {
    if (sessionRef.current.user?.email?.toLowerCase() === email.trim().toLowerCase()) {
      updateSession(initialSession);
    }
  }, [updateSession]);

  useEffect(() => {
    if (!session.user || !session.expiresAt) return;
    const remaining = Date.parse(session.expiresAt) - Date.now();
    const timeout = window.setTimeout(expireSession, Math.max(0, remaining));
    return () => window.clearTimeout(timeout);
  }, [expireSession, session.expiresAt, session.user]);

  const login = useCallback(async (identifier, password) => {
    const { data: result } = await api.post('/auth/login', { identifier, password }, {
      skipAuth: true,
      notifyUnauthorized: false,
    });
    const user = result.data;
    updateSession({ user, token: result.token, error: '', expiresAt: result.expires_at });
    return user;
  }, [updateSession]);

  const logout = useCallback(async () => {
    const token = sessionRef.current.token;
    try {
      await api.post('/auth/logout', null, { notifyUnauthorized: false });
    } catch (error) {
      if (error.status !== 401) throw error;
    }
    if (sessionRef.current.token === token) updateSession(initialSession);
  }, [updateSession]);

  const hasRole = useCallback((...roles) => roles.includes(session.user?.role), [session.user?.role]);
  const value = useMemo(() => ({
    ...session,
    role: session.user?.role || null,
    isAuthenticated: Boolean(session.user && session.token),
    hasRole,
    login,
    logout,
    clearResetAccountSession,
  }), [session, hasRole, login, logout, clearResetAccountSession]);

  if (session.token && !session.user) {
    return (
      <main className="container py-5 text-center">
        <p role="status">{restoreError || 'Verificando sessão…'}</p>
        {restoreError && (
          <button type="button" className="btn btn-success" onClick={() => window.location.reload()}>
            Tentar novamente
          </button>
        )}
      </main>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
