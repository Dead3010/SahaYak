import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Headphones, Inbox, Users, Zap, BarChart2, ArrowRight, CheckCircle,
  Clock, MessageSquare, ShieldCheck, Sparkles, Globe, Layers,
  MessageCircle, ImageIcon, Mic, Languages, Bot, Filter,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../lib/api';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const features = [
  {
    icon: Inbox,
    title: 'Ticket Management',
    desc: 'Create, prioritize, and track every support request from a single organized workspace.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp Integration',
    desc: 'Receive WhatsApp messages as tickets. View full chat history and reply directly from the ticket — no switching apps.',
  },
  {
    icon: ImageIcon,
    title: 'AI Image Analysis',
    desc: 'Customer sends a screenshot of their issue? Our AI analyzes the image, identifies the problem, and suggests a fix instantly.',
  },
  {
    icon: Zap,
    title: 'AI-Powered Assistance',
    desc: 'Auto-resolve tickets from your Knowledge Base, classify, summarize, and suggest replies — all with one click.',
  },
  {
    icon: Mic,
    title: 'Voice-to-Text Replies',
    desc: 'Speak your reply instead of typing — perfect for agents on the go. Real-time voice transcription built right in.',
  },
  {
    icon: Languages,
    title: 'Auto Language Detection',
    desc: 'Tickets in Hindi, Arabic, or any language? Auto-detected and translated to English so your team never misses context.',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    desc: 'Assign tickets, leave internal notes, and keep your whole team aligned on every issue.',
  },
  {
    icon: BarChart2,
    title: 'Analytics & Reports',
    desc: 'Measure response times, track trends, and make data-driven decisions with ease.',
  },
];

const highlights = [
  'WhatsApp & Email integration',
  'AI image analysis',
  'Voice-to-text replies',
  'Auto language detection',
  'Role-based access control',
  'Smart ticket deduplication',
];

const advantages = [
  {
    icon: Clock,
    title: 'Faster Resolution Times',
    desc: 'Smart ticket routing and AI suggestions cut average resolution time by up to 40%, so customers get answers before frustration sets in.',
  },
  {
    icon: MessageCircle,
    title: 'WhatsApp-Native Support',
    desc: 'Full WhatsApp chat history visible inside every ticket. Group messages, images, and replies — all in one place, no app switching.',
  },
  {
    icon: Bot,
    title: 'Auto-Resolve with AI',
    desc: 'AI matches incoming tickets to your Knowledge Base and resolves them automatically — before an agent even opens the dashboard.',
  },
  {
    icon: ImageIcon,
    title: 'Visual Issue Understanding',
    desc: 'Customers who can\'t type their problem can send a photo. Gemini AI reads the image and creates a detailed ticket with probable cause and fix.',
  },
  {
    icon: Filter,
    title: 'Smart Deduplication',
    desc: 'No duplicate tickets from the same user. System tracks active tickets and prevents spam — clean queue, less noise for your team.',
  },
  {
    icon: ShieldCheck,
    title: 'Full Audit Trail',
    desc: 'Every action is logged. Know who changed what and when — invaluable for compliance, quality reviews, and accountability.',
  },
  {
    icon: Layers,
    title: 'Role-Based Access',
    desc: 'Agents see what they need, admins control everything. Granular permissions keep your data secure and your team focused.',
  },
  {
    icon: Globe,
    title: 'Multilingual Support',
    desc: 'Auto-detects ticket language and translates to English instantly. Support customers in Hindi, Arabic, or any language — effortlessly.',
  },
];

const navLinks = [
  { label: 'Home', id: 'home' },
  { label: 'About', id: 'about' },
  { label: 'Pricing', id: 'pricing' },
  { label: 'Free Demo', id: 'demo' },
  { label: 'Contact Us', id: 'contact' },
];

function scrollToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const offset = 72;
  const target = el.getBoundingClientRect().top + window.scrollY - offset;
  const start = window.scrollY;
  const distance = target - start;
  const duration = 700;
  let startTime: number | null = null;

  function easeInOutCubic(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, start + distance * easeInOutCubic(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

export default function Landing() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', contact: '', email: '', org: '', interest: '' });


  const handleDemoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.settings.demoInquiry(form);
    } catch {
      // fire-and-forget — show success regardless
    }
    setSubmitted(true);
  };

  const handleDemoClose = (open: boolean) => {
    setDemoOpen(open);
    if (!open) {
      setTimeout(() => {
        setSubmitted(false);
        setForm({ name: '', contact: '', email: '', org: '', interest: '' });
      }, 300);
    }
  };

  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>

      {/* Navbar */}
      <header
        className="fixed top-0 inset-x-0 z-40 flex items-center justify-between px-6 md:px-12 h-20"
        style={{
          backgroundColor: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)', boxShadow: '0 2px 8px rgba(30,58,138,0.30)' }}
          >
            <Headphones className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
            SahaYak AI
          </span>
        </div>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map(({ label, id }) => (
            <button
              key={label}
              onClick={() => scrollToSection(id)}
              className="px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150 cursor-pointer"
              style={{ color: '#475569', border: '1.5px solid #e2e8f0' }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#1e3a8a';
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eff6ff';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#1e3a8a';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = '#475569';
                (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#e2e8f0';
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* Right side: Login */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-sm font-medium" style={{ color: '#94a3b8' }}>
            Already a user?
          </span>
          <Link
            to="/login"
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
            style={{
              backgroundColor: '#1e3a8a',
              color: 'white',
              boxShadow: '0 2px 8px rgba(30,58,138,0.25)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1e40af';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.backgroundColor = '#1e3a8a';
            }}
          >
            Login
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero — split layout with image */}
      <section id="home" className="flex-1 px-6 md:px-12 pt-32 pb-20">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          {/* Text side */}
          <div className="flex-1 text-left">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6"
              style={{ backgroundColor: '#eff6ff', color: '#1e3a8a', border: '1px solid #bfdbfe' }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#1d4ed8' }} />
              Ticket Management System
            </div>

            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-5"
              style={{ color: '#0f172a', letterSpacing: '-0.03em' }}
            >
              Meet the Last CRM{' '}
              <span style={{ color: '#1d4ed8' }}>You Will Ever</span>{' '}
              Need
            </h1>

            <p className="text-base md:text-lg leading-relaxed mb-8 max-w-xl" style={{ color: '#475569' }}>
              SahaYak AI brings your entire support operation into one clean, professional platform —
              so your team can focus on people, not paperwork.
            </p>

            <div className="flex flex-wrap items-center gap-4 mb-8">
              <button
                onClick={() => setDemoOpen(true)}
                className="flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-semibold transition-all duration-150"
                style={{
                  backgroundColor: '#1e3a8a',
                  color: 'white',
                  boxShadow: '0 4px 12px rgba(30,58,138,0.30)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e40af';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e3a8a';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                Let's Talk Growth
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Highlights */}
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {highlights.map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-sm" style={{ color: '#64748b' }}>
                  <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#1d4ed8' }} />
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* Image side */}
          <div className="flex-shrink-0 lg:w-[420px] flex items-center justify-center">
            <img
              src="/images/support-agent-1.png"
              alt="Support agent illustration"
              className="w-full max-w-sm lg:max-w-full rounded-2xl"
              style={{ filter: 'drop-shadow(0 8px 32px rgba(30,58,138,0.15))' }}
            />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 md:px-12 py-20" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
              Everything your team needs
            </h2>
            <p className="text-base" style={{ color: '#64748b' }}>
              Purpose-built tools to keep support fast, organized, and professional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="flex flex-col gap-3.5 p-6 rounded-xl transition-all duration-200"
                style={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(30,58,138,0.10)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#bfdbfe';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0';
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(30,58,138,0.08)' }}
                >
                  <Icon className="w-5 h-5" style={{ color: '#1e3a8a' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1" style={{ color: '#0f172a' }}>{title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About — split layout with second image */}
      <section id="about" className="px-6 md:px-12 py-20" style={{ backgroundColor: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-14">

            {/* Image side */}
            <div className="flex-shrink-0 lg:w-[360px] flex items-center justify-center">
              <img
                src="/images/support-agent-2.png"
                alt="Customer support illustration"
                className="w-full max-w-xs lg:max-w-full rounded-2xl"
                style={{
                  filter: 'drop-shadow(0 8px 32px rgba(30,58,138,0.18))',
                  imageRendering: '-webkit-optimize-contrast',
                  transform: 'translateZ(0)',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              />
            </div>

            {/* Text + grid side */}
            <div className="flex-1">
              <div
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
                style={{ backgroundColor: '#eff6ff', color: '#1e3a8a', border: '1px solid #bfdbfe' }}
              >
                About SahaYak AI
              </div>
              <h2 className="text-3xl font-bold mb-3" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                Why SahaYak AI?
              </h2>
              <p className="text-base mb-8" style={{ color: '#64748b' }}>
                We built SahaYak AI because great support deserves great tools. Here's what sets us apart.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {advantages.map(({ icon: Icon, title, desc }) => (
                  <div
                    key={title}
                    className="flex gap-3 p-5 rounded-xl transition-all duration-200"
                    style={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 14px rgba(30,58,138,0.08)';
                      (e.currentTarget as HTMLDivElement).style.borderColor = '#bfdbfe';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                      (e.currentTarget as HTMLDivElement).style.borderColor = '#e2e8f0';
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                      style={{ backgroundColor: 'rgba(30,58,138,0.08)' }}
                    >
                      <Icon className="w-4 h-4" style={{ color: '#1e3a8a' }} />
                    </div>
                    <div>
                      <p className="font-semibold text-sm mb-1" style={{ color: '#0f172a' }}>{title}</p>
                      <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>{desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 md:px-12 py-20" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
              style={{ backgroundColor: '#eff6ff', color: '#1e3a8a', border: '1px solid #bfdbfe' }}
            >
              Pricing
            </div>
            <h2 className="text-3xl font-bold mb-3" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
              Simple, Transparent Pricing
            </h2>
            <p className="text-base" style={{ color: '#64748b' }}>
              No hidden fees. Pick the plan that fits your team.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {/* Monthly Plan */}
            <div
              className="flex flex-col rounded-xl p-8 transition-all duration-200"
              style={{
                backgroundColor: '#ffffff',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}
            >
              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#94a3b8' }}>Monthly Plan</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-bold" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>₹1,499</span>
                <span className="text-sm mb-1.5" style={{ color: '#64748b' }}>/mo per agent</span>
              </div>
              <p className="text-sm mb-7" style={{ color: '#64748b' }}>
                Full access to all features. Cancel anytime with no penalty.
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {['Unlimited tickets', 'AI routing & suggestions', 'Analytics dashboard', 'Email integration', 'Priority support'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: '#374151' }}>
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#1d4ed8' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { setForm((f) => ({ ...f, interest: 'Monthly Plan' })); setDemoOpen(true); }}
                className="w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: 'transparent',
                  border: '1.5px solid #1e3a8a',
                  color: '#1e3a8a',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e3a8a';
                  (e.currentTarget as HTMLButtonElement).style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLButtonElement).style.color = '#1e3a8a';
                }}
              >
                Get Monthly Plan
              </button>
            </div>

            {/* Yearly Plan */}
            <div
              className="flex flex-col rounded-xl p-8 relative transition-all duration-200"
              style={{
                background: 'linear-gradient(150deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
                boxShadow: '0 8px 32px rgba(30,58,138,0.30)',
              }}
            >
              {/* Badge */}
              <div
                className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold"
                style={{ backgroundColor: '#0ea5e9', color: 'white' }}
              >
                Save 20%
              </div>

              <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: 'rgba(255,255,255,0.60)' }}>Yearly Plan</p>
              <div className="flex items-end gap-1 mb-2">
                <span className="text-4xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>₹1,199</span>
                <span className="text-sm mb-1.5" style={{ color: 'rgba(255,255,255,0.65)' }}>/mo per agent</span>
              </div>
              <p className="text-sm mb-7" style={{ color: 'rgba(255,255,255,0.65)' }}>
                Billed annually. Best value for committed teams who want to scale.
              </p>
              <ul className="space-y-3 mb-8 flex-1">
                {['Everything in Monthly', 'Priority onboarding', 'Dedicated account manager', 'Advanced reports', 'SLA guarantees'].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white">
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: '#0ea5e9' }} />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { setForm((f) => ({ ...f, interest: 'Yearly Plan' })); setDemoOpen(true); }}
                className="w-full py-3 rounded-lg text-sm font-semibold transition-all duration-200"
                style={{
                  backgroundColor: 'white',
                  color: '#1e3a8a',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eff6ff';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'white';
                  (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
                }}
              >
                Get Yearly Plan
              </button>
            </div>
          </div>

          <p className="text-center text-base font-semibold mt-8" style={{ color: '#374151' }}>
            Your competitors are already using this CRM — don't get left behind.
          </p>
        </div>
      </section>

      {/* Demo CTA */}
      <section
        id="demo"
        className="px-6 md:px-12 py-20 text-center"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)',
        }}
      >
        <div className="relative max-w-2xl mx-auto">
          <div className="absolute -top-8 -left-12 w-40 h-40 rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(14,165,233,0.08)' }} />
          <div className="absolute -bottom-8 -right-12 w-32 h-32 rounded-full pointer-events-none" style={{ backgroundColor: 'rgba(255,255,255,0.04)' }} />

          <h2 className="relative text-3xl md:text-4xl font-bold text-white mb-3 leading-tight" style={{ letterSpacing: '-0.02em' }}>
            Book your FREE Demo Now
          </h2>
          <p className="relative text-base mb-8" style={{ color: 'rgba(255,255,255,0.70)' }}>
            Stop guessing. Start growing. See it live in action.
          </p>
          <button
            onClick={() => setDemoOpen(true)}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold transition-all duration-200"
            style={{
              backgroundColor: 'white',
              color: '#1e3a8a',
              boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#eff6ff';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = 'white';
              (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            }}
          >
            Book a Free Demo
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Footer */}
      {/* Contact Us */}
      <section id="contact" className="px-6 md:px-12 py-16" style={{ backgroundColor: '#ffffff', borderTop: '1px solid #e2e8f0' }}>
        <div className="max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-5"
            style={{ backgroundColor: '#eff6ff', color: '#1e3a8a', border: '1px solid #bfdbfe' }}
          >
            Contact Us
          </div>
          <h2 className="text-3xl font-bold mb-3" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
            Get in Touch
          </h2>
          <p className="text-base mb-10" style={{ color: '#64748b' }}>
            Have doubts or queries? Reach out directly — we're happy to help.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            {/* Name card */}
            <div
              className="flex flex-col items-center gap-2 px-10 py-7 rounded-xl w-full sm:w-auto"
              style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white mb-1"
                style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1d4ed8 100%)' }}
              >
                YM
              </div>
              <p className="font-bold text-base" style={{ color: '#0f172a' }}>Yash Mishra</p>
              <p className="text-xs" style={{ color: '#64748b' }}>Founder & Developer</p>
            </div>

            {/* Contact card */}
            <div
              className="flex flex-col gap-4 px-10 py-7 rounded-xl w-full sm:w-auto text-left"
              style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(30,58,138,0.08)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="#1e3a8a" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium mb-0.5" style={{ color: '#94a3b8' }}>Phone</p>
                  <a href="tel:+917575856512" className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                    +91 7575856512
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: 'rgba(30,58,138,0.08)' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="#1e3a8a" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs font-medium mb-0.5" style={{ color: '#94a3b8' }}>Email</p>
                  <a href="mailto:yashmishra3010@gmail.com" className="text-sm font-semibold" style={{ color: '#0f172a' }}>
                    yashmishra3010@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer
        className="py-5 text-center text-xs"
        style={{ borderTop: '1px solid #e2e8f0', color: '#94a3b8', backgroundColor: '#ffffff' }}
      >
        © {new Date().getFullYear()} SahaYak AI · Built for teams that care about great support.
      </footer>

      {/* Demo Inquiry Dialog */}
      <Dialog open={demoOpen} onOpenChange={handleDemoClose}>
        <DialogContent className="sm:max-w-md rounded-xl" style={{ fontFamily: "'Inter', sans-serif" }}>
          {submitted ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-4">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#eff6ff' }}
              >
                <CheckCircle className="w-7 h-7" style={{ color: '#1e3a8a' }} />
              </div>
              <h2 className="text-xl font-bold" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                Thanks, we'll contact you soon!
              </h2>
              <p className="text-sm" style={{ color: '#64748b' }}>
                Our team will reach out within 24 hours.
              </p>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold" style={{ color: '#0f172a', letterSpacing: '-0.02em' }}>
                  Book a Free Demo
                </DialogTitle>
                <DialogDescription style={{ color: '#64748b' }}>
                  Fill in your details and we'll get in touch to schedule your demo.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleDemoSubmit} className="space-y-4 mt-2">
                <div className="space-y-1.5">
                  <Label htmlFor="demo-name" className="text-sm font-medium" style={{ color: '#374151' }}>
                    Your Name
                  </Label>
                  <Input
                    id="demo-name"
                    required
                    placeholder="Rahul Sharma"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="h-10 rounded-lg"
                    style={{ borderColor: '#d1d5db' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="demo-contact" className="text-sm font-medium" style={{ color: '#374151' }}>
                    Contact Number
                  </Label>
                  <Input
                    id="demo-contact"
                    required
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.contact}
                    onChange={(e) => setForm({ ...form, contact: e.target.value })}
                    className="h-10 rounded-lg"
                    style={{ borderColor: '#d1d5db' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="demo-email" className="text-sm font-medium" style={{ color: '#374151' }}>
                    Email ID
                  </Label>
                  <Input
                    id="demo-email"
                    required
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="h-10 rounded-lg"
                    style={{ borderColor: '#d1d5db' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="demo-org" className="text-sm font-medium" style={{ color: '#374151' }}>
                    Organization Name
                  </Label>
                  <Input
                    id="demo-org"
                    required
                    placeholder="Acme Pvt. Ltd."
                    value={form.org}
                    onChange={(e) => setForm({ ...form, org: e.target.value })}
                    className="h-10 rounded-lg"
                    style={{ borderColor: '#d1d5db' }}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium" style={{ color: '#374151' }}>
                    I'm interested in
                  </Label>
                  <Select
                    required
                    value={form.interest}
                    onValueChange={(v) => setForm({ ...form, interest: v })}
                  >
                    <SelectTrigger className="h-10 rounded-lg" style={{ borderColor: '#d1d5db' }}>
                      <SelectValue placeholder="Select an option…" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="Free Demo">Free Demo</SelectItem>
                      <SelectItem value="Monthly Plan">Monthly Plan</SelectItem>
                      <SelectItem value="Yearly Plan">Yearly Plan</SelectItem>
                      <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <button
                  type="submit"
                  className="w-full h-10 rounded-lg text-sm font-semibold transition-all duration-200 mt-2"
                  style={{
                    backgroundColor: '#1e3a8a',
                    color: 'white',
                    boxShadow: '0 2px 8px rgba(30,58,138,0.25)',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e40af'; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1e3a8a'; }}
                >
                  Submit
                </button>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
