import React, { useState, useEffect, useContext } from 'react';
import { Save, Bot, Volume2, Globe, Cpu, Play, CheckCircle, Lock } from 'lucide-react';
import { UserRole } from '../types';
import { AgentSettings, loadAgentSettings, saveAgentSettings } from '../services/agentSettingsService';
import { NotificationContext } from '../App';

interface AIAgentConfigProps {
    currentUser: {
        role: UserRole;
    }
}

const AIAgentConfig: React.FC<AIAgentConfigProps> = ({ currentUser }) => {
  const { notify } = useContext(NotificationContext);
  const [activeTab, setActiveTab] = useState('behavior');
  const [settings, setSettings] = useState<AgentSettings>(loadAgentSettings());
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings on mount
  useEffect(() => {
    const loaded = loadAgentSettings();
    setSettings(loaded);
  }, []);

  const handleSave = () => {
    try {
      saveAgentSettings(settings);
      setHasChanges(false);
      notify('Agent configuration saved successfully! Changes will apply to new roleplay sessions.', 'success');
    } catch (error) {
      notify('Failed to save configuration. Please try again.', 'error');
    }
  };

  const handleDiscard = () => {
    const loaded = loadAgentSettings();
    setSettings(loaded);
    setHasChanges(false);
    notify('Changes discarded.', 'info');
  };

  const updateSetting = (key: keyof AgentSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  // --- Access Control Check ---
  if (currentUser.role !== UserRole.ADMIN && currentUser.role !== UserRole.SUPER_ADMIN) {
      return (
          <div className="h-[calc(100vh-10rem)] flex flex-col items-center justify-center animate-fade-in">
              <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800 shadow-xl shadow-black/50">
                  <Lock size={40} className="text-brand-500" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-3">Restricted Access</h1>
              <p className="text-slate-400 max-w-md text-center mb-8">
                  The AI Agent Builder is a powerful tool reserved for organization administrators.
                  Please contact your workspace admin to request changes to agent personas.
              </p>
              <button className="px-6 py-3 bg-slate-800 text-white rounded-xl border border-slate-700 text-sm font-medium hover:bg-slate-700 transition-colors">
                  Return to Dashboard
              </button>
          </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Cpu className="text-brand-400" size={32} /> AI Agent Builder
            </h1>
            <p className="text-slate-400 mt-1">Configure your custom sales roleplay agent with advanced behavior and voice.</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-brand-900/30 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider">
            Beta v2.1
        </span>
      </div>

      <div className="glass-panel border border-slate-800/50 rounded-2xl overflow-hidden">
        <div className="flex border-b border-slate-800/50 bg-slate-900/30">
            <button 
                onClick={() => setActiveTab('behavior')}
                className={`px-8 py-5 text-sm font-bold transition-all relative ${activeTab === 'behavior' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Behavior & Prompt
                {activeTab === 'behavior' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 shadow-[0_0_10px_#ef4444]"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('voice')}
                className={`px-8 py-5 text-sm font-bold transition-all relative ${activeTab === 'voice' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Voice & Provider
                {activeTab === 'voice' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 shadow-[0_0_10px_#ef4444]"></div>}
            </button>
            <button 
                onClick={() => setActiveTab('connect')}
                className={`px-8 py-5 text-sm font-bold transition-all relative ${activeTab === 'connect' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
                Integration
                {activeTab === 'connect' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-500 shadow-[0_0_10px_#ef4444]"></div>}
            </button>
        </div>

        <div className="p-8">
            {activeTab === 'behavior' && (
                <div className="space-y-8 animate-fade-in">
                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Agent Persona Name</label>
                        <input
                            type="text"
                            value={settings.personaName}
                            onChange={(e) => updateSetting('personaName', e.target.value)}
                            className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-5 py-3 text-white focus:ring-2 focus:ring-brand-500/50 outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">
                            System Instruction Prompt
                        </label>
                        <div className="relative">
                            <textarea
                                value={settings.systemPrompt}
                                onChange={(e) => updateSetting('systemPrompt', e.target.value)}
                                className="w-full h-72 bg-slate-950/50 border border-slate-700 rounded-xl p-5 text-slate-200 font-mono text-sm focus:ring-2 focus:ring-brand-500/50 outline-none transition-all leading-relaxed"
                            />
                            <div className="absolute bottom-4 right-4 text-xs text-slate-500">
                                {settings.systemPrompt.length} chars
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between p-5 bg-gradient-to-r from-blue-900/20 to-slate-900 border border-blue-500/20 rounded-xl">
                        <div className="flex gap-4">
                            <div className="p-2 bg-blue-500/20 rounded-lg h-fit">
                                <Bot size={20} className="text-blue-400" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white">First Message Trigger</p>
                                <p className="text-xs text-slate-400 mt-1">Agent speaks first when call connects.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => updateSetting('firstMessageEnabled', !settings.firstMessageEnabled)}
                            className={`relative inline-block w-12 h-6 rounded-full transition-colors cursor-pointer shadow-inner ${
                                settings.firstMessageEnabled ? 'bg-brand-600' : 'bg-slate-700'
                            }`}
                        >
                            <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-transform shadow ${
                                settings.firstMessageEnabled ? 'left-6' : 'left-1'
                            }`}></span>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'voice' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">Voice Provider</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="p-4 border-2 border-brand-500 bg-brand-500/10 rounded-xl text-center shadow-[0_0_15px_rgba(239,68,68,0.2)] relative">
                                    <div className="absolute top-2 right-2 text-brand-400">
                                        <CheckCircle size={16} fill="currentColor" className="text-brand-950" />
                                    </div>
                                    <span className="block font-bold text-white mb-1">Vapi</span>
                                    <span className="text-[10px] uppercase tracking-wider text-brand-300 font-semibold">Low Latency</span>
                                </button>
                                <button className="p-4 border border-slate-700 bg-slate-900/50 rounded-xl text-center hover:bg-slate-800 transition-colors">
                                    <span className="block font-bold text-slate-300 mb-1">ElevenLabs</span>
                                    <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">High Quality</span>
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">Select Voice</label>
                            <select className="w-full bg-slate-950/50 border border-slate-700 rounded-xl px-5 py-3 text-white outline-none focus:border-brand-500/50 transition-all">
                                <option>Sarah (American, Professional)</option>
                                <option>John (British, Casual)</option>
                                <option>Marcus (Deep, Authoritative)</option>
                            </select>
                            <button className="mt-4 flex items-center gap-2 text-xs font-bold text-brand-400 hover:text-brand-300 uppercase tracking-wide px-3 py-2 rounded-lg hover:bg-brand-900/20 w-fit transition-colors">
                                <Play size={14} /> Preview Voice Sample
                            </button>
                        </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-slate-800/50">
                        <label className="block text-sm font-bold text-slate-300 uppercase tracking-wide">Voice Parameters</label>
                        <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-800/50">
                            <div className="mb-6">
                                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
                                    <span>Stability</span>
                                    <span className="text-brand-400">0.50</span>
                                </div>
                                <input type="range" className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500" />
                            </div>
                            <div>
                                <div className="flex justify-between text-xs font-semibold text-slate-400 mb-2">
                                    <span>Similarity Boost</span>
                                    <span className="text-brand-400">0.75</span>
                                </div>
                                <input type="range" className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500" />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'connect' && (
                <div className="space-y-8 animate-fade-in">
                    <div className="p-6 bg-slate-950/50 border border-slate-700 rounded-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-bl-full"></div>
                        <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">Webhook URL</h3>
                        <div className="flex gap-3 relative z-10">
                            <code className="flex-1 bg-slate-900 p-3 rounded-lg text-xs text-brand-200 font-mono border border-slate-800">
                                https://api.thinkalm.com/webhooks/voice-agent/v1/callback
                            </code>
                            <button className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors border border-slate-700">
                                Copy
                            </button>
                        </div>
                    </div>

                    <div className="space-y-4">
                         <div className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-900/30 transition-colors">
                            <div>
                                <h4 className="text-white text-sm font-bold">Record Sessions</h4>
                                <p className="text-xs text-slate-500 mt-1">Automatically save audio for AI analysis.</p>
                            </div>
                            <div className="w-12 h-6 bg-brand-600 rounded-full relative cursor-pointer shadow-inner">
                                <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                         </div>
                    </div>
                </div>
            )}

            <div className="mt-10 pt-6 border-t border-slate-800/50 flex justify-between items-center">
                {hasChanges && (
                    <div className="flex items-center gap-2 text-amber-400 text-sm">
                        <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></div>
                        <span>Unsaved changes</span>
                    </div>
                )}
                {!hasChanges && <div></div>}
                <div className="flex gap-4">
                    <button
                        onClick={handleDiscard}
                        disabled={!hasChanges}
                        className="px-6 py-3 text-slate-400 hover:text-white text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Discard Changes
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasChanges}
                        className="px-8 py-3 bg-brand-600 hover:bg-brand-500 text-white text-sm font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    >
                        <Save size={18} /> Save Agent Configuration
                    </button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AIAgentConfig;