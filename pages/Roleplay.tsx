import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Bot, RefreshCw, Share2, Check, Mic, MicOff, Activity } from 'lucide-react';
import { startRoleplaySession, connectToLiveSession, LiveSessionController } from '../services/geminiService';
import { getSystemPrompt } from '../services/agentSettingsService';
import { RoleplayMessage } from '../types';

const Roleplay: React.FC = () => {
  const [messages, setMessages] = useState<RoleplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<any>(null);
  const [showShare, setShowShare] = useState(false);
  
  // Voice Mode State
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [liveSession, setLiveSession] = useState<LiveSessionController | null>(null);
  const [audioVisualizerLevel, setAudioVisualizerLevel] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    startNewSession();
    return () => {
        if (liveSession) {
            liveSession.disconnect();
        }
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

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

  const startNewSession = () => {
    // If voice session active, kill it
    if (liveSession) {
        liveSession.disconnect();
        setLiveSession(null);
        setIsListening(false);
        setIsVoiceMode(false);
    }

    // Load custom system prompt from Agent Builder settings
    const customPrompt = getSystemPrompt();
    const session = startRoleplaySession(customPrompt);
    setChatSession(session);
    setMessages([{
      id: 'init',
      role: 'model',
      text: "Hi there. I saw your ad for Think ALM. I'm slightly interested, but we're pretty happy with our current spreadsheets. Convince me otherwise.",
      timestamp: new Date()
    }]);
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

  const handleSend = async () => {
    if (!input.trim() || !chatSession) return;

    const userMsg: RoleplayMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await chatSession.sendMessage(userMsg.text);
      const responseText = result.response.text();

      const aiMsg: RoleplayMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("Roleplay error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = () => {
    setShowShare(true);
    setTimeout(() => setShowShare(false), 2000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
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
            onClick={startNewSession}
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

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8" ref={scrollRef}>
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-[75%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 ${
                    msg.role === 'user' 
                    ? 'bg-slate-800 border-slate-700' 
                    : 'bg-brand-600 border-brand-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                }`}>
                  {msg.role === 'user' ? <User size={18} className="text-slate-300" /> : <Bot size={20} className="text-white" />}
                </div>
                <div className={`p-5 rounded-3xl text-sm leading-relaxed shadow-lg ${
                  msg.role === 'user' 
                    ? 'bg-slate-800 border border-slate-700 text-slate-200 rounded-tr-none' 
                    : 'bg-gradient-to-br from-brand-900/80 to-slate-900 border border-brand-500/30 text-slate-100 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
               <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center shrink-0 animate-pulse border-2 border-brand-400">
                   <Bot size={20} className="text-white" />
                </div>
                <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-3xl rounded-tl-none flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-brand-400 rounded-full animate-bounce delay-150"></span>
                </div>
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-slate-950/80 backdrop-blur-md border-t border-slate-800/50">
          <div className="relative flex gap-3">
             <button 
                onClick={toggleVoiceMode}
                className="shrink-0 w-14 h-14 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-brand-500 text-slate-300 hover:text-white rounded-2xl transition-all flex items-center justify-center group"
                title="Start Voice Session"
             >
                 <Mic size={24} className="group-hover:text-brand-400 transition-colors" />
             </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your response... (Enter to send)"
              className="flex-1 bg-slate-900/80 border border-slate-700/50 rounded-2xl pl-6 pr-14 py-4 text-slate-200 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 outline-none resize-none h-14 shadow-inner transition-all"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-2 bottom-2 aspect-square bg-brand-600 hover:bg-brand-500 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center h-10 w-10 mt-0.5"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-xs text-center text-slate-600 mt-3 font-medium">
            AI generated responses can be inaccurate. This is a simulation environment.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Roleplay;