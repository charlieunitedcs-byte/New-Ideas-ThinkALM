import React, { useState } from 'react';
import { Bot, Mail, Lock, User, Building, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { SubscriptionPlan, UserRole } from '../types';
import { createClient } from '../services/clientService';
import { createUserAccount } from '../services/authService';

interface SignupProps {
  onSignupComplete: () => void;
  onBackToLogin: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSignupComplete, onBackToLogin }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    plan: SubscriptionPlan.TEAM
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    if (!formData.companyName || !formData.contactName || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      setIsLoading(false);
      return;
    }

    // Simulate API delay
    setTimeout(() => {
      try {
        // Create new client record
        const client = createClient({
          companyName: formData.companyName,
          contactName: formData.contactName,
          email: formData.email,
          phone: formData.phone,
          plan: formData.plan,
          status: 'Trialing',
          totalUsers: 1,
          monthlyRevenue: formData.plan === SubscriptionPlan.PRO ? 2500 : 990
        });

        // Create user account linked to the client
        createUserAccount(
          formData.email,
          formData.password,
          formData.contactName,
          formData.companyName,
          formData.plan,
          UserRole.ADMIN,
          client.id
        );

        setStep('success');
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to create account. Please try again.';
        setError(errorMessage);
        setIsLoading(false);
      }
    }, 1500);
  };

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#05060e] flex items-center justify-center p-4 relative overflow-hidden">
        {/* Background Ambience */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/10 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="w-full max-w-md relative z-10 text-center">
          <div className="glass-panel border border-emerald-500/20 p-12 rounded-3xl shadow-2xl backdrop-blur-xl animate-fade-in">
            <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] mx-auto mb-6">
              <CheckCircle className="text-white" size={40} />
            </div>

            <h1 className="text-3xl font-bold text-white mb-4">Account Created!</h1>
            <p className="text-slate-400 mb-8">
              Welcome to Think ABC! Your 14-day free trial has started.
              Check your email at <strong className="text-white">{formData.email}</strong> for login instructions.
            </p>

            <div className="space-y-4">
              <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                <p className="text-sm text-slate-400 mb-2">Your Login Email:</p>
                <p className="text-white font-mono text-sm">{formData.email}</p>
              </div>

              <button
                onClick={onBackToLogin}
                className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 group"
              >
                Go to Login <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05060e] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent-600/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="mb-6 flex justify-center">
            <img
              src="/logo.png"
              alt="Think ABC Logo"
              className="h-64 w-auto object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Create Your Account</h1>
          <p className="text-brand-300 font-medium text-sm">Start your 14-day free trial • No credit card required</p>
        </div>

        <div className="glass-panel border border-brand-500/20 p-8 rounded-3xl shadow-2xl backdrop-blur-xl animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Company Name *</label>
                <div className="relative group">
                  <Building className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-brand-400 transition-colors" size={18} />
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Acme Corporation"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-200 outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Your Name *</label>
                <div className="relative group">
                  <User className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-brand-400 transition-colors" size={18} />
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="John Smith"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-200 outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Work Email *</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-brand-400 transition-colors" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="john@acme.com"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-200 outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone (Optional)</label>
                <div className="relative group">
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+1 (555) 123-4567"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password *</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-brand-400 transition-colors" size={18} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-200 outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm Password *</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-3.5 text-slate-500 group-focus-within:text-brand-400 transition-colors" size={18} />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-slate-200 outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/50 transition-all placeholder:text-slate-700"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Choose Your Plan</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, plan: SubscriptionPlan.PER_USER })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.plan === SubscriptionPlan.PER_USER
                      ? 'border-brand-500 bg-brand-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <p className="font-bold text-white mb-1 text-sm">Per User</p>
                  <p className="text-xl font-bold text-brand-400 mb-2">$49<span className="text-xs text-slate-500">/mo</span></p>
                  <p className="text-xs text-slate-400">Per user/month</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, plan: SubscriptionPlan.TEAM })}
                  className={`p-4 rounded-xl border-2 transition-all relative ${
                    formData.plan === SubscriptionPlan.TEAM
                      ? 'border-brand-500 bg-brand-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <div className="absolute -top-3 right-2 px-2 py-0.5 bg-brand-600 text-white text-[10px] font-bold rounded-full">
                    POPULAR
                  </div>
                  <p className="font-bold text-white mb-1 text-sm">Team Plan</p>
                  <p className="text-xl font-bold text-brand-400 mb-2">$299<span className="text-xs text-slate-500">/mo</span></p>
                  <p className="text-xs text-slate-400">Up to 10 users</p>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, plan: SubscriptionPlan.COMPANY })}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    formData.plan === SubscriptionPlan.COMPANY
                      ? 'border-brand-500 bg-brand-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                      : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
                  }`}
                >
                  <p className="font-bold text-white mb-1 text-sm">Company</p>
                  <p className="text-xl font-bold text-brand-400 mb-2">$999<span className="text-xs text-slate-500">/mo</span></p>
                  <p className="text-xs text-slate-400">Unlimited users</p>
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-lg text-red-200 text-sm flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  Start Free Trial <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
            <p className="text-sm text-slate-500">
              Already have an account?{' '}
              <button onClick={onBackToLogin} className="text-brand-400 hover:text-brand-300 font-bold transition-colors">
                Sign In
              </button>
            </p>
            <p className="text-xs text-slate-600 mt-3">
              By signing up, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
