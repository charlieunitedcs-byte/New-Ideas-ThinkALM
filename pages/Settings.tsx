import React, { useState } from 'react';
import { Award, Zap, Briefcase, Lock, CheckCircle2, Cloud, ChevronRight, Star, Settings as SettingsIcon, Mail, Key } from 'lucide-react';
import { Badge, User } from '../types';
import { updateUserEmail, updateUserPassword, isSuperAdmin } from '../services/authService';

const mockBadges: Badge[] = [
    { id: '1', name: 'First Call', description: 'Analyzed your first sales call', icon: '📞', achievedDate: '2023-09-01' },
    { id: '2', name: 'Roleplay Star', description: 'Scored 90+ in a roleplay session', icon: '⭐', achievedDate: '2023-10-15' },
    { id: '3', name: 'Quick Learner', description: 'Completed 5 training modules', icon: '🎓', achievedDate: '2023-11-20' },
    { id: '4', name: 'Deal Closer', description: 'Recorded 10 successful closes', icon: '🤝', achievedDate: undefined },
];

interface SettingsProps {
    demoMode: boolean;
    onToggleDemoMode: (enabled: boolean) => void;
    currentUser: User | null;
    onUserUpdate: (user: User) => void;
}

const Settings: React.FC<SettingsProps> = ({ demoMode, onToggleDemoMode, currentUser, onUserUpdate }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [crmConnected, setCrmConnected] = useState(false);

    // Account Settings State
    const [newEmail, setNewEmail] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [accountMessage, setAccountMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

    const handleEmailChange = () => {
        if (!newEmail.trim() || !currentPassword.trim()) {
            setAccountMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
            setAccountMessage({ type: 'error', text: 'Please enter a valid email address' });
            return;
        }

        const result = updateUserEmail(newEmail, currentPassword);
        if (result.success && result.user) {
            onUserUpdate(result.user);
            setAccountMessage({ type: 'success', text: 'Email updated successfully!' });
            setNewEmail('');
            setCurrentPassword('');
        } else {
            setAccountMessage({ type: 'error', text: result.message });
        }
        setTimeout(() => setAccountMessage(null), 3000);
    };

    const handlePasswordChange = () => {
        if (!currentPassword.trim() || !newPassword.trim() || !confirmPassword.trim()) {
            setAccountMessage({ type: 'error', text: 'Please fill in all fields' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setAccountMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        if (newPassword.length < 6) {
            setAccountMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        const result = updateUserPassword(currentPassword, newPassword);
        if (result.success) {
            setAccountMessage({ type: 'success', text: 'Password updated successfully!' });
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } else {
            setAccountMessage({ type: 'error', text: result.message });
        }
        setTimeout(() => setAccountMessage(null), 3000);
    };

    return (
        <div className="max-w-5xl mx-auto animate-fade-in">
            <h1 className="text-3xl font-bold text-white mb-8">Settings & Preferences</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Sidebar Navigation */}
                <div className="md:col-span-1 space-y-2">
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`w-full flex items-center justify-between px-5 py-4 text-sm font-medium rounded-xl transition-all ${activeTab === 'profile' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Award size={18} /> Profile & Badges
                        </div>
                        {activeTab === 'profile' && <ChevronRight size={16} />}
                    </button>
                    <button 
                        onClick={() => setActiveTab('crm')}
                        className={`w-full flex items-center justify-between px-5 py-4 text-sm font-medium rounded-xl transition-all ${activeTab === 'crm' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Zap size={18} /> Integrations
                        </div>
                        {activeTab === 'crm' && <ChevronRight size={16} />}
                    </button>
                    <button
                        onClick={() => setActiveTab('account')}
                        className={`w-full flex items-center justify-between px-5 py-4 text-sm font-medium rounded-xl transition-all ${activeTab === 'account' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
                    >
                        <div className="flex items-center gap-3">
                            <Lock size={18} /> Account
                        </div>
                        {activeTab === 'account' && <ChevronRight size={16} />}
                    </button>
                    <button
                        onClick={() => setActiveTab('system')}
                        className={`w-full flex items-center justify-between px-5 py-4 text-sm font-medium rounded-xl transition-all ${activeTab === 'system' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'}`}
                    >
                        <div className="flex items-center gap-3">
                            <SettingsIcon size={18} /> System
                        </div>
                        {activeTab === 'system' && <ChevronRight size={16} />}
                    </button>
                </div>

                {/* Content Area */}
                <div className="md:col-span-3">
                    {activeTab === 'profile' && (
                        <div className="glass-panel border border-slate-800/50 rounded-2xl p-8 animate-fade-in">
                            <h2 className="text-xl font-bold text-white mb-2">Your Achievements</h2>
                            <p className="text-slate-400 text-sm mb-8">Track your progress and earn badges to level up your sales game.</p>

                            <div className="mb-8 p-6 bg-gradient-to-r from-brand-900/60 to-slate-900 border border-brand-500/30 rounded-2xl flex items-center justify-between relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                                <div className="relative z-10">
                                    <p className="text-xs font-bold text-brand-300 uppercase tracking-widest mb-1">Current Status</p>
                                    <p className="text-4xl font-bold text-white tracking-tight">Level 5</p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <div className="bg-brand-500 h-full w-[70%]"></div>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium">3,450 / 5,000 XP</p>
                                    </div>
                                </div>
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center shadow-[0_0_20px_rgba(234,179,8,0.3)] rotate-3">
                                    <span className="text-3xl text-white drop-shadow-md">🏆</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {mockBadges.map(badge => (
                                    <div key={badge.id} className={`p-6 rounded-2xl border flex flex-col items-center text-center transition-all group hover:scale-105 duration-300 ${badge.achievedDate ? 'bg-slate-900/60 border-brand-500/20 shadow-lg shadow-black/20' : 'bg-slate-950/30 border-slate-800 opacity-60 grayscale'}`}>
                                        <div className="text-4xl mb-4 transform group-hover:scale-110 transition-transform">{badge.icon}</div>
                                        <h3 className="text-sm font-bold text-slate-200">{badge.name}</h3>
                                        <p className="text-[10px] text-slate-500 mt-2 leading-tight h-8">{badge.description}</p>
                                        {badge.achievedDate ? (
                                            <span className="mt-3 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Earned</span>
                                        ) : (
                                            <span className="mt-3 text-[10px] font-bold text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">Locked</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'crm' && (
                        <div className="glass-panel border border-slate-800/50 rounded-2xl p-8 animate-fade-in">
                            <h2 className="text-xl font-bold text-white mb-2">CRM Integrations</h2>
                            <p className="text-slate-400 text-sm mb-8">Sync call logs, summaries, and contacts directly to your source of truth.</p>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-6 bg-slate-950/50 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-[#ff7a59] rounded-xl flex items-center justify-center shadow-lg shadow-orange-900/20">
                                            <Cloud className="text-white fill-white" size={28} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">HubSpot</h3>
                                            <p className="text-sm text-slate-400 mt-0.5">Two-way sync for contacts & deals.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setCrmConnected(!crmConnected)}
                                        className={`px-6 py-2.5 text-sm font-bold rounded-xl transition-all ${
                                            crmConnected 
                                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' 
                                            : 'bg-white text-slate-900 hover:bg-slate-200 border border-transparent'
                                        }`}
                                    >
                                        {crmConnected ? (
                                            <span className="flex items-center gap-2"><CheckCircle2 size={16} /> Connected</span>
                                        ) : 'Connect App'}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-6 bg-slate-950/30 border border-slate-800 rounded-2xl opacity-60">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 bg-[#00A1E0] rounded-xl flex items-center justify-center grayscale">
                                            <Cloud className="text-white fill-white" size={28} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white text-lg">Salesforce</h3>
                                            <p className="text-sm text-slate-400 mt-0.5">Enterprise sync capabilities.</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-bold text-slate-500 bg-slate-900 px-3 py-1 rounded-full border border-slate-800">COMING SOON</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'account' && (
                        <div className="glass-panel border border-slate-800/50 rounded-2xl p-8 animate-fade-in space-y-8">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-2">Account Settings</h2>
                                <p className="text-slate-400 text-sm">Manage your email and password securely.</p>
                            </div>

                            {accountMessage && (
                                <div className={`p-4 rounded-xl border ${
                                    accountMessage.type === 'success'
                                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                        : 'bg-red-500/10 border-red-500/30 text-red-400'
                                }`}>
                                    {accountMessage.text}
                                </div>
                            )}

                            {/* Current User Info */}
                            <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3">Current Account</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Mail size={16} className="text-slate-500" />
                                        <span className="text-white font-medium">{currentUser?.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-slate-500">Name:</span>
                                        <span className="text-white">{currentUser?.name}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Change Email */}
                            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Mail size={20} className="text-brand-400" />
                                    Change Email Address
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">New Email Address</label>
                                        <input
                                            type="email"
                                            value={newEmail}
                                            onChange={(e) => setNewEmail(e.target.value)}
                                            placeholder="Enter new email"
                                            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Current Password (for verification)</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password"
                                            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handleEmailChange}
                                        className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Update Email
                                    </button>
                                </div>
                            </div>

                            {/* Change Password */}
                            <div className="p-6 bg-slate-900/30 rounded-xl border border-slate-800">
                                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                    <Key size={20} className="text-brand-400" />
                                    Change Password
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Current Password</label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password"
                                            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">New Password</label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password (min 6 characters)"
                                            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-400 mb-2">Confirm New Password</label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                            className="w-full bg-slate-950/50 border border-slate-700 rounded-lg px-4 py-2.5 text-white focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 outline-none"
                                        />
                                    </div>
                                    <button
                                        onClick={handlePasswordChange}
                                        className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors"
                                    >
                                        Update Password
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="glass-panel border border-slate-800/50 rounded-2xl p-8 animate-fade-in">
                            <h2 className="text-2xl font-bold text-white mb-6">System Preferences</h2>

                            <div className="space-y-6">
                                {/* Demo Mode Toggle - Only visible to Super Admin */}
                                {isSuperAdmin(currentUser) && (
                                    <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                                    🎮 Demo Mode
                                                    <span className="text-xs font-normal text-brand-400 bg-brand-900/30 border border-brand-500/30 px-2 py-0.5 rounded">Super Admin Only</span>
                                                </h3>
                                                <p className="text-sm text-slate-400">
                                                    Display sample data and demo indicators throughout the application.
                                                    Turn this off when showing the app to real clients.
                                                </p>
                                            </div>
                                            <div className="ml-6">
                                                <button
                                                    onClick={() => onToggleDemoMode(!demoMode)}
                                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                                                        demoMode ? 'bg-brand-600' : 'bg-slate-700'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                                                            demoMode ? 'translate-x-7' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="mt-4 p-3 bg-amber-900/20 border border-amber-500/30 rounded-lg">
                                            <p className="text-xs text-amber-200">
                                                <strong>Note:</strong> When demo mode is {demoMode ? 'enabled' : 'disabled'},
                                                {demoMode
                                                    ? ' you\'ll see a banner at the top and sample data throughout the app.'
                                                    : ' the app will look production-ready without any demo indicators.'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Additional System Settings */}
                                <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white mb-2">Notifications</h3>
                                            <p className="text-sm text-slate-400">
                                                Receive in-app notifications for important updates.
                                            </p>
                                        </div>
                                        <div className="ml-6">
                                            <button className="relative inline-flex h-8 w-14 items-center rounded-full bg-brand-600 transition-colors">
                                                <span className="inline-block h-6 w-6 transform rounded-full bg-white transition-transform translate-x-7" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;