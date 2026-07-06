import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Headphones, BarChart2, ShieldCheck, Users, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';

const features = [
  { icon: BarChart2, title: 'Real-time Analytics', desc: 'Track ticket trends and team performance at a glance.' },
  { icon: ShieldCheck, title: 'Secure & Reliable', desc: 'Enterprise-grade security for your entire organization.' },
  { icon: Users, title: 'Team Collaboration', desc: 'Assign, escalate, and resolve tickets together seamlessly.' },
];

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [reportOpen, setReportOpen] = useState(false);
  const [reportForm, setReportForm] = useState({ name: '', email: '', message: '' });
  const [reportLoading, setReportLoading] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [reportError, setReportError] = useState('');

  const handleReport = async (e: FormEvent) => {
    e.preventDefault();
    if (!reportForm.name || !reportForm.email || !reportForm.message) return;
    setReportLoading(true);
    setReportError('');
    try {
      await api.settings.demoInquiry({
        name: reportForm.name,
        email: reportForm.email,
        contact: '',
        org: 'Login Issue',
        interest: reportForm.message,
      });
      setReportSuccess(true);
    } catch {
      setReportError('Failed to send. Please try again.');
    } finally {
      setReportLoading(false);
    }
  };

  const closeReport = () => {
    setReportOpen(false);
    setReportSuccess(false);
    setReportError('');
    setReportForm({ name: '', email: '', message: '' });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err instanceof Error ? err.message : '';
      if (msg === 'Network Error' || msg === 'Failed to fetch') {
        setError('Unable to connect to server. Please try again.');
      } else {
        setError(msg || 'Login failed. Please check your credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#f8fafc' }}>
      {/* Left panel — professional navy */}
      <div
        className="hidden lg:flex flex-col justify-between w-[460px] shrink-0 px-12 py-14 relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)' }}
      >
        {/* Subtle decorative shapes */}
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />
        <div className="absolute bottom-24 -left-12 w-48 h-48 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.03)' }} />
        <div className="absolute top-1/2 right-6 w-24 h-24 rounded-full" style={{ backgroundColor: 'rgba(14,165,233,0.12)' }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
            <Headphones className="w-5 h-5 text-white" />
          </div>
          <span className="text-white font-bold text-xl" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: '-0.02em' }}>SahaYak AI</span>
        </div>

        {/* Main copy */}
        <div className="relative z-10">
          <h2 className="text-white text-4xl font-bold leading-snug mb-4" style={{ letterSpacing: '-0.02em' }}>
            Streamline Your<br />Support Operations
          </h2>
          <p className="text-sm leading-relaxed mb-10" style={{ color: 'rgba(255,255,255,0.65)' }}>
            Manage tickets, collaborate with your team, and deliver faster resolutions — all from one centralized platform.
          </p>

          <div className="space-y-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: 'rgba(255,255,255,0.12)' }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white font-semibold text-sm">{title}</p>
                  <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="flex gap-1.5 relative z-10">
          <div className="w-8 h-1 rounded-full" style={{ backgroundColor: '#0ea5e9' }} />
          <div className="w-3 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.3)' }} />
          <div className="w-2 h-1 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }} />
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center px-8 py-16 relative" style={{ backgroundColor: '#f8fafc' }}>
        <Link to="/" className="absolute top-6 left-6 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors duration-150">
          <ArrowLeft className="w-4 h-4" /> Back
        </Link>
        <div className="w-full max-w-sm animate-fade-in">

          {/* Mobile logo */}
          <div className="flex items-center gap-2.5 mb-10 lg:hidden">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}>
              <Headphones className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
              SahaYak AI
            </span>
          </div>

          <div
            className="rounded-xl px-8 py-9"
            style={{
              backgroundColor: '#ffffff',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px rgba(0,0,0,0.04), 0 12px 40px rgba(0,0,0,0.07)',
            }}
          >
            <h1 className="text-2xl font-bold mb-1" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>Welcome back</h1>
            <p className="text-sm mb-8" style={{ color: '#64748b' }}>Sign in to continue to your workspace</p>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div
                  className="text-sm rounded-lg px-4 py-3 animate-fade-in"
                  style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626' }}
                >
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium" style={{ color: '#374151' }}>
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  className="h-10 rounded-lg"
                  style={{ borderColor: '#d1d5db', backgroundColor: '#ffffff' }}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-sm font-medium" style={{ color: '#374151' }}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  className="h-10 rounded-lg"
                  style={{ borderColor: '#d1d5db', backgroundColor: '#ffffff' }}
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-10 rounded-lg font-semibold text-sm transition-all duration-200"
                style={{
                  background: '#1e3a8a',
                  color: 'white',
                  boxShadow: '0 2px 8px rgba(30,58,138,0.25)',
                  border: 'none',
                }}
              >
                {loading ? 'Signing in…' : 'Sign in'}
              </Button>
            </form>

            <p className="text-xs text-center mt-7" style={{ color: '#94a3b8' }}>
              Need access?{' '}
              <span className="font-semibold cursor-default" style={{ color: '#1e3a8a' }}>
                Contact your admin.
              </span>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-4 rounded-xl px-6 py-4" style={{ backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
            <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: '#94a3b8' }}>Demo credentials</p>
            <div className="space-y-2">
              {[
                { role: 'Admin', email: 'Mishraji@helpdesk.com', password: 'yash3010' },
                { role: 'Agent', email: 'agent@helpdesk.com', password: 'Agent@123456' },
              ].map(({ role, email, password }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => { setEmail(email); setPassword(password); }}
                  className="w-full text-left rounded-lg px-3 py-2.5 transition-colors duration-150 hover:bg-white"
                  style={{ border: '1px solid #e2e8f0' }}
                >
                  <span className="text-xs font-semibold" style={{ color: '#1e3a8a' }}>{role}</span>
                  <div className="text-xs mt-0.5" style={{ color: '#64748b' }}>
                    {email} · <span style={{ color: '#94a3b8' }}>Pass: {password}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
      {/* Report an Issue — floating button */}
      <button
        onClick={() => setReportOpen(true)}
        className="fixed bottom-5 right-5 flex items-center gap-2 text-xs font-semibold px-3.5 py-2 rounded-full shadow-md transition-all duration-150 hover:shadow-lg hover:-translate-y-0.5"
        style={{ backgroundColor: '#ef4444', border: '1px solid #dc2626', color: '#ffffff' }}
      >
        <AlertCircle className="w-3.5 h-3.5 text-white" />
        Report an Issue
      </button>

      {/* Report an Issue — dialog */}
      <Dialog open={reportOpen} onOpenChange={(o) => { if (!o) closeReport(); }}>
        <DialogContent className="sm:max-w-sm rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-slate-900 font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              Report an Issue
            </DialogTitle>
          </DialogHeader>

          {reportSuccess ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              <p className="text-sm font-semibold text-slate-800">Report sent!</p>
              <p className="text-xs text-slate-500">We'll look into this and get back to you at the email you provided.</p>
              <Button onClick={closeReport} className="mt-2 rounded-full font-semibold px-6">Done</Button>
            </div>
          ) : (
            <form onSubmit={handleReport} className="space-y-4 py-1">
              <p className="text-xs text-slate-500">
                Having trouble signing in? Describe your issue and we'll follow up.
              </p>
              {reportError && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{reportError}</p>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="r-name" className="text-xs font-semibold text-slate-600">Your Name</Label>
                <Input id="r-name" placeholder="John Doe" value={reportForm.name}
                  onChange={(e) => setReportForm((f) => ({ ...f, name: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="r-email" className="text-xs font-semibold text-slate-600">Your Email</Label>
                <Input id="r-email" type="email" placeholder="you@company.com" value={reportForm.email}
                  onChange={(e) => setReportForm((f) => ({ ...f, email: e.target.value }))} className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="r-message" className="text-xs font-semibold text-slate-600">Describe your issue</Label>
                <Textarea id="r-message" rows={4} placeholder="e.g. I can't log in — getting 'Invalid credentials' even though my password is correct. Please describe your issue in as much detail as possible." value={reportForm.message}
                  onChange={(e) => setReportForm((f) => ({ ...f, message: e.target.value }))}
                  className="resize-none text-sm rounded-xl" />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeReport} className="rounded-full">Cancel</Button>
                <Button type="submit" disabled={reportLoading || !reportForm.name || !reportForm.email || !reportForm.message}
                  className="rounded-full font-semibold">
                  {reportLoading ? 'Sending…' : 'Send Report'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
