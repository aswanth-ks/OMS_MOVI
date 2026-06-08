import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

const ROLE_HOME = { 
  intern: '/intern/dashboard', 
  hr: '/hr/dashboard', 
  pmo: '/pmo/dashboard', 
  admin: '/admin/dashboard',
  dept: '/dept/dashboard' 
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [errorShake, setErrorShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setErrorMsg('');
    try {
      if (!password.includes('123')) {
        throw new Error('Invalid credentials. Please try again.');
      }
      
      const user = await login(email, password);
      navigate(ROLE_HOME[user.role] || '/unauthorized');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid credentials. Please try again.');
      setErrorShake(true);
      setTimeout(() => setErrorShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = (testEmail, testPass) => {
    setEmail(testEmail);
    setPassword(testPass);
  };

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#F8FAFC] flex flex-col justify-center items-center font-sans relative">
      
      {/* Subtle background decoration */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-[#1E293B] -skew-y-2 origin-top-left z-0 shadow-lg" />

      <div className="relative z-10 w-full max-w-[800px] px-6">
        <motion.div 
          animate={errorShake ? { x: [-10, 10, -10, 10, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="bg-white shadow-2xl border border-[#E2E8F0] rounded-2xl overflow-hidden flex flex-col md:flex-row"
        >
          {/* LOGIN FORM (Left Side) */}
          <div className="flex-1 p-8 sm:p-10">
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="w-12 h-12 rounded-xl bg-[#1E293B] text-white flex items-center justify-center font-bold text-2xl mb-3 shadow-sm">
                M
              </div>
              <h2 className="text-2xl font-bold text-[#0F172A] tracking-tight">OWMS Portal</h2>
              <p className="text-sm text-[#64748B] mt-1">Sign in to your workspace</p>
            </div>

            {errorMsg && (
              <div className="mb-5 p-3 bg-[#FEF2F2] border border-[#DC2626] rounded-lg text-sm text-[#DC2626] font-medium text-center">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#0F172A]">Employee ID or Email</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                    <Mail size={16} />
                  </div>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. INT-2024-001 or email@domain.com"
                    required
                    className="w-full pl-9 pr-3 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                  />
                </div>
                <p className="text-[11px] text-[#64748B]">Use your Employee ID or registered email</p>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-[#0F172A]">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#64748B]">
                    <Lock size={16} />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-10 py-2 text-sm border border-[#E2E8F0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-[#64748B] hover:text-[#0F172A] transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1 pb-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#2563EB] border-[#CBD5E1] rounded focus:ring-[#2563EB]"
                  />
                  <span className="text-sm text-[#64748B] group-hover:text-[#0F172A] transition-colors">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-medium text-[#2563EB] hover:text-blue-700 transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#2563EB] hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>
          </div>

          {/* CREDENTIALS INFO (Right Side) */}
          <div className="w-full md:w-[320px] bg-[#F8FAFC] border-t md:border-t-0 md:border-l border-[#E2E8F0] p-8 flex flex-col justify-center">
            <h3 className="text-sm font-semibold text-[#0F172A] uppercase tracking-wider mb-5">Test Accounts</h3>
            <p className="text-xs text-[#64748B] mb-5 leading-relaxed">
              Click any account below to instantly auto-fill the login form for testing.
            </p>

            <div className="space-y-3">
              {[
                { role: 'Admin', email: 'admin@owms.com', pass: 'admin123', color: 'bg-blue-100 text-blue-700 border-blue-200' },
                { role: 'HR', email: 'hr@owms.com', pass: 'hr123', color: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                { role: 'PMO', email: 'pmo@owms.com', pass: 'pmo123', color: 'bg-purple-100 text-purple-700 border-purple-200' },
                { role: 'Intern', email: 'intern@owms.com', pass: 'intern123', color: 'bg-orange-100 text-orange-700 border-orange-200' },
              ].map((acc) => (
                <div 
                  key={acc.role} 
                  onClick={() => copyCredentials(acc.email, acc.pass)}
                  className="bg-white border border-[#E2E8F0] rounded-lg p-3 cursor-pointer hover:border-[#CBD5E1] transition-colors shadow-sm group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border ${acc.color}`}>
                      {acc.role}
                    </span>
                    <span className="text-[10px] text-[#94A3B8] font-medium group-hover:text-[#2563EB] transition-colors">Auto-fill &rarr;</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-[#0F172A] font-medium">{acc.email}</span>
                    <span className="text-xs text-[#64748B] font-mono">{acc.pass}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </motion.div>
        
        <p className="text-center text-xs text-slate-300 mt-6 drop-shadow-md">
          &copy; {new Date().getFullYear()} Movi Cloud Labs. All rights reserved.
        </p>
      </div>
      
    </div>
  );
}
