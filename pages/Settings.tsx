import React, { useState } from 'react';
import { Award, Zap, Briefcase, Lock, CheckCircle2, Cloud, ChevronRight, Star, Settings as SettingsIcon } from 'lucide-react';
import { Badge } from '../types';

const mockBadges: Badge[] = [
    { id: '1', name: 'First Call', description: 'Analyzed your first sales call', icon: '📞', achievedDate: '2023-09-01' },
    { id: '2', name: 'Roleplay Star', description: 'Scored 90+ in a roleplay session', icon: '⭐', achievedDate: '2023-10-15' },
    { id: '3', name: 'Quick Learner', description: 'Completed 5 training modules', icon: '🎓', achievedDate: '2023-11-20' },
    { id: '4', name: 'Deal Closer', description: 'Recorded 10 successful closes', icon: '🤝', achievedDate: undefined },
];

interface SettingsProps {
    demoMode: boolean;
    onToggleDemoMode: (enabled: boolean) => void;
}

const Settings: React.FC<SettingsProps> = ({ demoMode, onToggleDemoMode }) => {
    const [activeTab, setActiveTab] = useState('profile');
    const [crmConnected, setCrmConnected] = useState(false);

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
                        <div className="glass-panel border border-slate-800/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center py-16 animate-fade-in">
                            <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                <Lock size={40} className="text-slate-600" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Account Security</h3>
                            <p className="text-slate-400 max-w-sm mb-8">Manage your password, email preferences, and subscription plan details securely.</p>
                            <button className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-medium border border-slate-700 hover:border-slate-500">
                                Edit Profile Settings
                            </button>
                        </div>
                    )}

                    {activeTab === 'system' && (
                        <div className="glass-panel border border-slate-800/50 rounded-2xl p-8 animate-fade-in">
                            <h2 className="text-2xl font-bold text-white mb-6">System Preferences</h2>

                            <div className="space-y-6">
                                {/* Demo Mode Toggle */}
                                <div className="p-6 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                                                🎮 Demo Mode
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