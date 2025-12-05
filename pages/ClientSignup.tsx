import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, Lock, User, Phone, Building, MapPin, Globe, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { getSignupByToken, completeSignup, ClientSignupData } from '../services/clientSignupService';
import { createUserAccount } from '../services/authService';
import { getClientById, updateClient } from '../services/clientService';
import { UserRole } from '../types';

const ClientSignup: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'success'>('form');

  const [signupInfo, setSignupInfo] = useState<{
    email: string;
    companyName: string;
    clientId: string;
  } | null>(null);

  const [formData, setFormData] = useState<ClientSignupData>({
    companyName: '',
    industry: '',
    size: '',
    contactName: '',
    email: '',
    phone: '',
    address: '',
    website: '',
    notes: ''
  });

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Invalid signup link');
      setLoading(false);
      return;
    }

    // Verify the token
    const signup = getSignupByToken(token);
    if (!signup) {
      setError('This signup link is invalid or has expired.');
      setLoading(false);
      return;
    }

    if (signup.completed) {
      setError('This signup link has already been used.');
      setLoading(false);
      return;
    }

    // Pre-fill the form with available data
    setSignupInfo({
      email: signup.email,
      companyName: signup.companyName,
      clientId: signup.clientId
    });

    setFormData(prev => ({
      ...prev,
      email: signup.email,
      companyName: signup.companyName
    }));

    setLoading(false);
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Validation
    if (!formData.contactName || !formData.phone || !formData.industry || !formData.size) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      setSubmitting(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      setSubmitting(false);
      return;
    }

    try {
      if (!token || !signupInfo) {
        throw new Error('Invalid signup session');
      }

      // Get the client record
      const client = getClientById(signupInfo.clientId);
      if (!client) {
        throw new Error('Client record not found');
      }

      // Complete the signup
      completeSignup(token, formData);

      // Create user account
      createUserAccount(
        formData.email,
        password,
        formData.contactName,
        formData.companyName,
        client.plan,
        UserRole.ADMIN,
        signupInfo.clientId
      );

      // Update client record with additional info
      updateClient(signupInfo.clientId, {
        contactName: formData.contactName,
        phone: formData.phone
      });

      setStep('success');
      setSubmitting(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to complete signup. Please try again.';
      setError(errorMessage);
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05060e] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-brand-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Verifying signup link...</p>
        </div>
      </div>
    );
  }

  if (error && !signupInfo) {
    return (
      <div className="min-h-screen bg-[#05060e] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel border border-red-500/20 p-8 rounded-2xl text-center">
          <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="text-red-400" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Invalid Link</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl transition-colors font-medium"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-[#05060e] flex items-center justify-center p-4">
        <div className="max-w-md w-full glass-panel border border-emerald-500/20 p-8 rounded-2xl text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-600 to-green-500 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)] mx-auto mb-6">
            <CheckCircle className="text-white" size={40} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-4">Setup Complete!</h1>
          <p className="text-slate-400 mb-8">
            Your account has been successfully created. You can now log in with your credentials.
          </p>
          <div className="space-y-4">
            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 text-left">
              <p className="text-sm text-slate-400 mb-1">Login Email:</p>
              <p className="text-white font-mono text-sm">{formData.email}</p>
            </div>
            <button
              onClick={() => window.location.href = '/#/login'}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/25"
            >
              Go to Login
            </button>
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

      <div className="w-full max-w-3xl relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="mb-6 flex justify-center">
            <img
              src="/logo.png"
              alt="Think ABC Logo"
              className="h-32 w-auto object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">Complete Your Setup</h1>
          <p className="text-brand-300 font-medium text-sm">Welcome • {signupInfo?.companyName}</p>
        </div>

        <div className="glass-panel border border-brand-500/20 p-8 rounded-3xl shadow-2xl backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Company Information */}
            <div>
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Building size={20} className="text-brand-400" />
                Company Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    readOnly
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Industry *</label>
                  <select
                    value={formData.industry}
                    onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500/50"
                    required
                  >
                    <option value="">Select Industry</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Finance">Finance</option>
                    <option value="Retail">Retail</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Company Size *</label>
                  <select
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500/50"
                    required
                  >
                    <option value="">Select Size</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Website</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-3.5 text-slate-500" size={18} />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                      placeholder="https://example.com"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-brand-500/50"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-3.5 text-slate-500" size={18} />
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="123 Main St, City, State"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-brand-500/50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="pt-6 border-t border-slate-800/50">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <User size={20} className="text-brand-400" />
                Your Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-3.5 text-slate-500" size={18} />
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      placeholder="John Smith"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-brand-500/50"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    readOnly
                    className="w-full bg-slate-900/50 border border-slate-800 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Phone *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-3.5 text-slate-500" size={18} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-brand-500/50"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Password Setup */}
            <div className="pt-6 border-t border-slate-800/50">
              <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Lock size={20} className="text-brand-400" />
                Set Your Password
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-brand-500/50"
                      required
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Minimum 8 characters</p>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-3.5 text-slate-500" size={18} />
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-brand-500/50"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Additional Notes (Optional)
              </label>
              <div className="relative">
                <FileText className="absolute left-4 top-3.5 text-slate-500" size={18} />
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Any additional information..."
                  rows={3}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-12 pr-4 py-3 text-white outline-none focus:border-brand-500/50 resize-none"
                />
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
              disabled={submitting}
              className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" /> Completing Setup...
                </>
              ) : (
                <>
                  Complete Setup <CheckCircle size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ClientSignup;
