import React, { useState, useEffect } from 'react';
import { RefreshCw, Share2, Check, Mic, MicOff, Activity, Bot } from 'lucide-react';
import { connectToLiveSession, LiveSessionController } from '../services/geminiService';
import { getSystemPrompt } from '../services/agentSettingsService';

const Roleplay: React.FC = () => {
  const [showShare, setShowShare] = useState(false);

  // Voice Mode State
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveSession, setLiveSession] = useState<LiveSessionController | null>(null);
  const [audioVisualizerLevel, setAudioVisualizerLevel] = useState(0);

  useEffect(() => {
    return () => {
        if (liveSession) {
            liveSession.disconnect();
        }
    };
  }, []);

  // Simulate visualizer activity interval
  useEffect(() => {
    let interval: any;
    if (isListening) {
        interval = setInterval(() => {
            setAudioVisualizerLevel(Math.random() * 100);
        }, 100);
    } else {
        setAudioVisualizerLevel(0);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  const resetSession = () => {
    // If voice session active, disconnect it
    if (liveSession) {
        liveSession.disconnect();
        setLiveSession(null);
        setIsListening(false);
        setIsVoiceMode(false);
    }
  };

  const toggleVoiceMode = async () => {
    if (isVoiceMode) {
        // Stop Voice Mode
        if (liveSession) {
            liveSession.disconnect();
            setLiveSession(null);
        }
        setIsListening(false);
        setIsVoiceMode(false);
    } else {
        // Start Voice Mode
        setIsVoiceMode(true);
        setIsListening(true); // Assuming connecting...
        
        try {
            // Load custom system prompt from Agent Builder settings
            const customPrompt = getSystemPrompt();

            const controller = await connectToLiveSession(
                (audioBuffer) => {
                    // When we get audio back, we can visualize it or log it
                    // For now, simpler visualizer driven by state
                },
                () => {
                    setIsListening(false);
                    setIsVoiceMode(false);
                },
                customPrompt + " This is a voice conversation. Keep responses natural and conversational."
            );
            setLiveSession(controller);
        } catch (err) {
            console.error("Failed to start voice session", err);
            setIsVoiceMode(false);
            setIsListening(false);
            alert("Could not access microphone. Please ensure permissions are granted.");
        }
    }
  };

  const handleShare = () => {
    setShowShare(true);
    setTimeout(() => setShowShare(false), 2000);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center shadow-lg shadow-brand-500/20">
                <Bot className="text-white" size={24} />
            </div>
             AI Roleplay Arena
          </h1>
          <p className="text-slate-400 mt-1">Scenario: Cold Call Objection Handling - "We use spreadsheets"</p>
        </div>
        <div className="flex gap-3">
            <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors border border-slate-700"
            >
                {showShare ? <Check size={16} className="text-emerald-400" /> : <Share2 size={16} />}
                {showShare ? "Sent to Manager" : "Share Session"}
            </button>
            <button
            onClick={resetSession}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-brand-900/30 hover:bg-brand-900/50 text-brand-300 rounded-xl transition-colors border border-brand-500/30"
            >
            <RefreshCw size={16} /> Reset
            </button>
        </div>
      </div>

      <div className="flex-1 glass-panel border border-slate-800/50 rounded-2xl overflow-hidden flex flex-col shadow-2xl shadow-black/50 relative">
        
        {/* Voice Mode Overlay / Visualizer */}
        {isVoiceMode && (
             <div className="absolute inset-0 z-20 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-8 transition-all duration-500">
                <div className="relative mb-12">
                     {/* Pulsing Rings */}
                     <div className={`absolute inset-0 rounded-full border-4 border-brand-500/30 transition-all duration-100 ${isListening ? 'scale-150 opacity-50' : 'scale-100 opacity-20'}`} style={{ transform: `scale(${1 + audioVisualizerLevel/200})`}}></div>
                     <div className={`absolute inset-0 rounded-full border-4 border-brand-500/50 transition-all duration-100 ${isListening ? 'scale-125 opacity-60' : 'scale-100 opacity-20'}`} style={{ transform: `scale(${1 + audioVisualizerLevel/300})`}}></div>
                     
                     <div className="w-40 h-40 bg-gradient-to-br from-brand-600 to-accent-600 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(239,68,68,0.5)] relative z-10 animate-pulse-slow">
                        <Mic size={64} className="text-white" />
                     </div>
                </div>
                
                <h2 className="text-2xl font-bold text-white mb-2 tracking-tight">Voice Session Active</h2>
                <p className="text-slate-400 text-center max-w-md">
                    Speak naturally to the AI agent. The conversation is being processed in real-time.
                </p>
                
                <div className="flex items-center gap-2 mt-8 px-4 py-2 bg-slate-900 rounded-full border border-slate-800">
                    <Activity size={16} className="text-brand-400 animate-pulse" />
                    <span className="text-xs font-mono text-brand-300">LIVE AUDIO STREAM</span>
                </div>

                <button 
                    onClick={toggleVoiceMode}
                    className="mt-12 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-600 transition-colors flex items-center gap-3 font-medium"
                >
                    <MicOff size={18} /> End Voice Session
                </button>
             </div>
        )}

        {/* Empty State / Instructions */}
        {!isVoiceMode && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="text-center max-w-md">
              <div className="w-24 h-24 bg-gradient-to-br from-brand-600/20 to-accent-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-brand-500/30">
                <Mic size={48} className="text-brand-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-3">Voice-Only Roleplay</h2>
              <p className="text-slate-400 leading-relaxed mb-6">
                Practice your sales conversations with our AI agent using natural voice interactions.
                Click the microphone button below to start your session.
              </p>
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-400 mb-2 font-bold uppercase tracking-wider">Current Scenario</p>
                <p className="text-sm text-slate-300">Cold Call Objection Handling - "We use spreadsheets"</p>
              </div>
            </div>
          </div>
        )}

        {/* Voice-Only Input Area */}
        <div className="p-8 bg-slate-950/80 backdrop-blur-md border-t border-slate-800/50">
          <div className="flex flex-col items-center gap-4">
            <button
               onClick={toggleVoiceMode}
               className="w-20 h-20 bg-gradient-to-br from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 border-4 border-brand-400/50 text-white rounded-full transition-all flex items-center justify-center group shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-[0_0_40px_rgba(239,68,68,0.5)] hover:scale-110"
               title={isVoiceMode ? "Stop Voice Session" : "Start Voice Session"}
            >
                {isVoiceMode ? <MicOff size={32} /> : <Mic size={32} />}
            </button>
            <div className="text-center">
              <p className="text-sm font-bold text-white mb-1">
                {isVoiceMode ? "Voice Session Active" : "Voice-Only Roleplay"}
              </p>
              <p className="text-xs text-slate-400">
                {isVoiceMode ? "Tap to end session" : "Tap microphone to start voice conversation"}
              </p>
            </div>
          </div>
          <p className="text-xs text-center text-slate-600 mt-4 font-medium">
            AI generated responses can be inaccurate. This is a simulation environment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Roleplay;