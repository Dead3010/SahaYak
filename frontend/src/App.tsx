import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tickets from './pages/Tickets';
import TicketDetail from './pages/TicketDetail';
import Users from './pages/Users';
import Teams from './pages/Teams';
import EmailSetup from './pages/EmailSetup';
import Forbidden from './pages/Forbidden';

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#f8fafc' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-[2.5px] border-t-transparent animate-spin" style={{ borderColor: '#1e3a8a', borderTopColor: 'transparent' }} />
          <p className="text-xs font-medium tracking-wide" style={{ color: '#94a3b8' }}>Loading…</p>
        </div>
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN') return <Forbidden />;
  return <>{children}</>;
}

export default function App() {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={auth}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <RequireAuth>
                <Layout />
              </RequireAuth>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
            <Route
              path="/users"
              element={
                <RequireAdmin>
                  <Users />
                </RequireAdmin>
              }
            />
            <Route
              path="/teams"
              element={
                <RequireAdmin>
                  <Teams />
                </RequireAdmin>
              }
            />
            <Route
              path="/email-setup"
              element={
                <RequireAdmin>
                  <EmailSetup />
                </RequireAdmin>
              }
            />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
