import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const ROLE_HOME = {
  'super-admin': '/admin/dashboard',
  'admin':       '/admin/dashboard',
  'hr-manager':  '/hr/dashboard',
  'pmo-lead':    '/pmo/dashboard',
  'employee':    '/employee/dashboard',
  'intern':      '/intern/dashboard',
};

// One demo account per dashboard
const ACCOUNTS = [
  { label: 'Admin',    name: 'Super Admin',    email: 'admin@owms.com', pass: 'Admin@123', id: 'EMP-2025-001', desc: 'Admin Dashboard',    color: 'bg-slate-100 text-slate-700 border-slate-200',       active: 'border-slate-400 bg-slate-50'      },
  { label: 'HR',       name: 'Sarah Johnson',  email: 'hr@owms.com',    pass: 'HR@123456', id: 'EMP-2025-002', desc: 'HR Dashboard',       color: 'bg-purple-100 text-purple-700 border-purple-200',    active: 'border-purple-400 bg-purple-50'    },
  { label: 'PMO',      name: 'Alex Wong',      email: 'pmo@owms.com',   pass: 'PMO@12345', id: 'EMP-2025-003', desc: 'PMO Dashboard',      color: 'bg-cyan-100 text-cyan-700 border-cyan-200',          active: 'border-cyan-400 bg-cyan-50'        },
  { label: 'Employee', name: 'John Employee',  email: 'john@owms.com',  pass: 'Emp@12345', id: 'EMP-2025-004', desc: 'Employee Dashboard', color: 'bg-blue-100 text-blue-700 border-blue-200',          active: 'border-blue-400 bg-blue-50'        },
  { label: 'Intern',   name: 'Rahul Intern',   email: 'rahul@owms.com', pass: 'Int@12345', id: 'INT-2025-001', desc: 'Intern Dashboard',   color: 'bg-emerald-100 text-emerald-700 border-emerald-200', active: 'border-emerald-400 bg-emerald-50'  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();

  const [identifier, setIdentifier]   = useState('');
  const [password, setPassword]       = useState('');
  const [showPwd, setShowPwd]         = useState(false);
  const [rememberMe, setRememberMe]   = useState(false);
  const [loading, setLoading]         = useState(false);
  const [errorShake, setErrorShake]   = useState(false);
  const [errorMsg, setErrorMsg]       = useState('');
  const [filledEmail, setFilledEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier || !password) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const user = await login(identifier, password);
      const slug = user.role?.slug || user.role || '';
      navigate(ROLE_HOME[slug] || '/unauthorized');
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Invalid credentials.');
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const fill = (email, pass) => {
    setIdentifier(email);
    setPassword(pass);
    setFilledEmail(email);
    setErrorMsg('');
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] flex flex-col justify-center items-center font-sans relative">

      {/* Background slab */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-[#1E293B] -skew-y-2 origin-top-left z-0 shadow-lg" />

      <div className="relative z-10 w-full max-w-[860px] px-4">
        <motion.div
          animate={errorShake ? { x: [-8, 8, -8, 8, 0] } : {}}
          transition={{ duration: 0.35 }}
          className="bg-white shadow-2xl border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col md:flex-row"
        >
          {/* ── LEFT: Login form ─────────────────────────────────────────── */}
          <div className="flex-1 p-8 sm:p-10">
            <div className="flex flex-col items-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#1E293B] text-white flex items-center justify-center font-bold text-2xl mb-3 shadow-sm">M</div>
              <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">OWMS Portal</h2>
              <p className="text-sm text-[#64748B] mt-1">Sign in to your workspace</p>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3 bg-[#FEF2F2] border border-[#DC2626] rounded-lg text-sm text-[#DC2626] font-medium text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#0F172A]">Employee ID or Email</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={e => { setIdentifier(e.target.value); setFilledEmail(''); }}
                    placeholder="EMP-2025-001 or email@owms.com"
                    required
                    className="w-full pl-9 pr-3 py-2.5 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                  />
                </div>
                <p className="text-[11px] text-[#64748B]">Employee ID or registered email both work</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#0F172A]">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
                  <input
                    type={showPwd ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2.5 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                  />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors">
                    {showPwd ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#2563EB] border-[#CBD5E1] rounded focus:ring-[#2563EB]" />
                  <span className="text-sm text-[#64748B]">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-[#2563EB] hover:text-blue-700 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button type="submit" disabled={loading}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center shadow-sm disabled:opacity-70">
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : 'Sign In'}
              </button>
            </form>
          </div>

          {/* ── RIGHT: Demo accounts ─────────────────────────────────────── */}
          <div className="w-full md:w-[300px] bg-[#F8FAFC] border-t md:border-t-0 md:border-l border-[#E2E8F0] flex flex-col justify-center p-6 gap-3">
            <div className="mb-1">
              <h3 className="text-[11px] font-bold text-[#0F172A] uppercase tracking-widest">Quick Access</h3>
              <p className="text-[11px] text-[#94A3B8] mt-0.5">Click a card to auto-fill credentials</p>
            </div>

            {ACCOUNTS.map(acc => {
              const isActive = filledEmail === acc.email;
              return (
                <div
                  key={acc.email}
                  onClick={() => fill(acc.email, acc.pass)}
                  className={`border rounded-xl px-4 py-3 cursor-pointer transition-all ${
                    isActive ? acc.active + ' shadow-sm' : 'border-[#E2E8F0] bg-white hover:bg-[#F1F5F9]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-wide ${acc.color}`}>
                      {acc.label}
                    </span>
                    <span className={`text-[10px] font-medium ${isActive ? 'text-[#2563EB]' : 'text-[#CBD5E1]'}`}>
                      {isActive ? '✓ filled' : acc.desc}
                    </span>
                  </div>
                  <p className="text-[12px] font-semibold text-[#0F172A] leading-none">{acc.name}</p>
                  <p className="text-[11px] text-[#64748B] font-mono mt-0.5 truncate">{acc.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-[#94A3B8] font-mono">{acc.id}</span>
                    <span className="text-[10px] text-[#CBD5E1]">·</span>
                    <span className="text-[10px] text-[#94A3B8] font-mono">{acc.pass}</span>
                  </div>
                </div>
              );
            })}
          </div>

        </motion.div>

        <p className="text-center text-xs text-slate-300 mt-5 drop-shadow-md">
          &copy; {new Date().getFullYear()} Movi Cloud Labs. All rights reserved.
        </p>
      </div>
    </div>
  );
}
