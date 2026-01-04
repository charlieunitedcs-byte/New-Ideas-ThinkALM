import React, { useState } from 'react';
import { UploadCloud, FileText, Check, AlertCircle, Loader2, Share2, MessageSquare, Send, Trophy, Sparkles, Volume2 } from 'lucide-react';
import { analyzeCallTranscript, analyzeCallAudio } from '../services/aiService';
import { CallAnalysisResult, Comment } from '../types';
import { saveCallToHistory } from '../services/callHistoryService';
import { getCurrentUser } from '../services/authService';

const CallAnalysis: React.FC = () => {
  const [transcriptInput, setTranscriptInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<CallAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<'upload' | 'paste'>('paste');
  const [salesRepName, setSalesRepName] = useState<string>('');

  // Collaboration & Gamification State
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [showShareSuccess, setShowShareSuccess] = useState(false);
  const [showGamificationToast, setShowGamificationToast] = useState(false);

  const handleAnalyze = async () => {
    if (!transcriptInput.trim()) return;

    setIsAnalyzing(true);
    setError(null);
    setResult(null);
    setComments([]);
    setShowGamificationToast(false);

    try {
      const data = await analyzeCallTranscript(transcriptInput);
      setResult(data);

      // Save to call history (async - don't block UI)
      const currentUser = getCurrentUser();
      if (currentUser) {
        saveCallToHistory(data, currentUser.id, salesRepName.trim() || undefined, currentUser.team)
          .catch(err => console.error('Failed to save call history:', err));
      }

      // Trigger gamification toast
      setTimeout(() => setShowGamificationToast(true), 500);
    } catch (err) {
      console.error("Analysis error:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to analyze call. Please ensure your API key is set and try again.";
      setError(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const audioFile = e.target.files[0];

      // Reasonable file size limit (50MB max - most sales calls are much smaller)
      const maxSizeInMB = 50;
      const maxSizeInBytes = maxSizeInMB * 1024 * 1024;

      if (audioFile.size > maxSizeInBytes) {
        setError(
          `Audio file is too large (${(audioFile.size / 1024 / 1024).toFixed(1)}MB). ` +
          `Maximum size is ${maxSizeInMB}MB. ` +
          `Please use a shorter audio clip or paste the transcript instead.`
        );
        e.target.value = ''; // Reset file input
        return;
      }

      setIsAnalyzing(true);
      setError(null);
      setResult(null);
      setComments([]);
      setShowGamificationToast(false);

      try {
        const data = await analyzeCallAudio(audioFile);
        setResult(data);
        setTranscriptInput(data.transcript);
        setTab('paste'); // Switch to paste tab to show transcript

        // Save to call history (async - don't block UI)
        const currentUser = getCurrentUser();
        if (currentUser) {
          saveCallToHistory(data, currentUser.id, salesRepName.trim() || undefined, currentUser.team)
            .catch(err => console.error('Failed to save call history:', err));
        }

        // Trigger gamification toast
        setTimeout(() => setShowGamificationToast(true), 500);
      } catch (err) {
        console.error("Audio analysis error:", err);
        const errorMessage = err instanceof Error ? err.message : "Failed to analyze audio. Please ensure your API key is set and the audio file is valid.";
        setError(errorMessage);
      } finally {
        setIsAnalyzing(false);
      }
    }
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Alex Chen',
      avatar: 'https://picsum.photos/100/100',
      text: newComment,
      timestamp: 'Just now'
    };
    
    setComments([...comments, comment]);
    setNewComment('');
  };

  const handleShare = () => {
    setShowShareSuccess(true);
    setTimeout(() => setShowShareSuccess(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in relative">
      {/* Gamification Toast */}
      {showGamificationToast && (
          <div className="fixed bottom-10 right-10 z-50 animate-fade-in">
              <div className="bg-gradient-to-r from-brand-900 to-slate-900 border border-brand-500/50 p-4 rounded-xl shadow-[0_0_30px_rgba(239,68,68,0.3)] flex items-center gap-4 max-w-sm">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shrink-0 border-2 border-slate-900">
                      <Trophy className="text-white fill-white" size={20} />
                  </div>
                  <div>
                      <h4 className="font-bold text-white text-sm">Achievement Unlocked!</h4>
                      <p className="text-xs text-brand-200 mt-1">"Data Driven" - +50 XP</p>
                  </div>
                  <button onClick={() => setShowGamificationToast(false)} className="ml-auto text-slate-400 hover:text-white">
                      <Check size={16} />
                  </button>
              </div>
          </div>
      )}

      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
            Call Intelligence <Sparkles size={18} className="text-brand-400" />
          </h1>
          <p className="text-slate-400">Upload recording or paste transcript to get AI-powered insights.</p>
        </div>
      </div>

      {!result && (
        <div className="glass-panel rounded-2xl p-2 overflow-hidden border border-slate-800/50">
          <div className="flex gap-2 p-1.5 bg-slate-900/40 rounded-xl mb-6 w-fit mx-6 mt-6">
            <button 
              onClick={() => setTab('paste')}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'paste' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Paste Transcript
            </button>
            <button 
              onClick={() => setTab('upload')}
              className={`px-6 py-2 text-sm font-medium rounded-lg transition-all ${tab === 'upload' ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Upload Audio
            </button>
          </div>

          <div className="px-6 pb-6">
            {tab === 'paste' ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Sales Rep Name <span className="text-slate-600">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-300 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 outline-none text-sm"
                    placeholder="e.g., John Smith"
                    value={salesRepName}
                    onChange={(e) => setSalesRepName(e.target.value)}
                  />
                </div>
                <textarea
                  className="w-full h-72 bg-slate-950/50 border border-slate-700/50 rounded-xl p-5 text-slate-300 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 outline-none resize-none font-mono text-sm leading-relaxed"
                  placeholder="Paste conversation transcript here..."
                  value={transcriptInput}
                  onChange={(e) => setTranscriptInput(e.target.value)}
                />
                <div className="flex justify-end">
                    <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !transcriptInput}
                    className="px-8 py-3 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all transform hover:scale-105"
                    >
                    {isAnalyzing ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                    {isAnalyzing ? 'Analyzing with AI...' : 'Analyze Transcript'}
                    </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Sales Rep Name <span className="text-slate-600">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full bg-slate-950/50 border border-slate-700/50 rounded-xl px-4 py-3 text-slate-300 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 outline-none text-sm"
                    placeholder="e.g., John Smith"
                    value={salesRepName}
                    onChange={(e) => setSalesRepName(e.target.value)}
                  />
                </div>
                <div className="border-2 border-dashed border-slate-700 rounded-xl p-16 flex flex-col items-center justify-center text-center hover:bg-slate-800/20 transition-colors group">
                  {isAnalyzing ? (
                  <>
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6">
                      <Loader2 size={40} className="text-brand-400 animate-spin" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Analyzing Audio...</h3>
                    <p className="text-slate-500 text-sm max-w-sm">
                      Processing your call recording with AI. This may take a minute.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <UploadCloud size={40} className="text-brand-400 group-hover:text-brand-300" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Upload Audio File</h3>
                    <p className="text-slate-500 text-sm max-w-sm mb-8">
                      Supports MP3, WAV, M4A. Max file size 50MB. <br/>
                      <span className="text-xs text-emerald-400/70">AI will transcribe and analyze your call automatically.</span>
                    </p>
                    <input
                      type="file"
                      id="audio-upload"
                      className="hidden"
                      accept="audio/*"
                      onChange={handleAudioUpload}
                      disabled={isAnalyzing}
                    />
                    <label
                      htmlFor="audio-upload"
                      className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl cursor-pointer transition-colors border border-slate-600 hover:border-slate-500"
                    >
                      Select File
                    </label>
                  </>
                )}
                </div>
              </div>
            )}
            
            {error && (
              <div className="mt-6 p-4 bg-red-950/30 border border-red-900/50 rounded-xl flex items-center gap-3 text-red-200">
                <AlertCircle size={20} />
                <p>{error}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {result && (
        <div className="animate-fade-in space-y-6">
          <div className="flex justify-end">
            <button 
                onClick={handleShare}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-medium border ${showShareSuccess ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-brand-500 hover:text-white'}`}
            >
                {showShareSuccess ? <Check size={18}/> : <Share2 size={18} />}
                {showShareSuccess ? "Shared with Team!" : "Share Analysis"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Score Card */}
            <div className="glass-panel border border-slate-800/50 rounded-2xl p-8 lg:col-span-1 h-fit relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-500 via-accent-500 to-brand-500"></div>
              <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6 text-center">Performance Score</h3>
              <div className="relative flex items-center justify-center py-4">
                <div className="w-48 h-48 rounded-full border-[12px] border-slate-800 flex items-center justify-center relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                  <div className="absolute inset-0 rounded-full border-[12px] border-accent-500 border-t-transparent border-l-transparent animate-spin-slow" style={{ transform: `rotate(${(result.score / 100) * 360}deg)`}}></div>
                  <div className="text-center">
                    <span className="text-5xl font-bold text-white block tracking-tighter">{result.score}</span>
                    <span className="text-xs text-brand-300 font-semibold">OUT OF 100</span>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                 <div className="p-4 bg-brand-900/20 rounded-xl border border-brand-500/20">
                  <p className="text-sm text-brand-100 italic text-center leading-relaxed">"{result.summary}"</p>
                </div>
              </div>
              <button 
                onClick={() => setResult(null)}
                className="mt-6 w-full py-3 border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 rounded-xl text-sm transition-colors"
              >
                Analyze Another Call
              </button>
            </div>

            <div className="lg:col-span-2 space-y-6">
                {/* Details Card */}
                <div className="glass-panel border border-slate-800/50 rounded-2xl p-8">
                    <div className="grid md:grid-cols-2 gap-10">
                        <div>
                        <h3 className="flex items-center gap-2 text-emerald-400 font-bold mb-5 tracking-wide uppercase text-sm">
                            <Check size={18} /> Key Strengths
                        </h3>
                        <ul className="space-y-4">
                            {result.strengths.map((s, i) => (
                            <li key={i} className="flex gap-3 text-sm text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-slate-800/50">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                {s}
                            </li>
                            ))}
                        </ul>
                        </div>
                        <div>
                        <h3 className="flex items-center gap-2 text-accent-400 font-bold mb-5 tracking-wide uppercase text-sm">
                            <AlertCircle size={18} /> Growth Areas
                        </h3>
                        <ul className="space-y-4">
                            {result.improvements.map((s, i) => (
                            <li key={i} className="flex gap-3 text-sm text-slate-300 bg-slate-900/40 p-3 rounded-lg border border-slate-800/50">
                                <span className="w-2 h-2 rounded-full bg-accent-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                                {s}
                            </li>
                            ))}
                        </ul>
                        </div>
                    </div>

                    {/* Tone & Emotional Intelligence */}
                    <div className="mt-10 pt-8 border-t border-slate-800/50">
                        <h3 className="flex items-center gap-2 text-brand-400 font-bold mb-6 tracking-wide uppercase text-sm">
                            <Volume2 size={18} /> Tone & Emotional Intelligence Analysis
                        </h3>
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <div className="p-5 bg-brand-900/20 rounded-xl border border-brand-500/20">
                                    <p className="text-xs text-slate-400 mb-2 uppercase tracking-wider font-bold">Sales Rep Tone</p>
                                    <p className="text-lg text-white font-semibold capitalize">{result.tone}</p>
                                    <p className="text-xs text-slate-500 mt-2">Overall communication style and demeanor</p>
                                </div>
                            </div>
                            <div>
                                <div className="p-5 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <p className="text-xs text-slate-400 mb-3 uppercase tracking-wider font-bold">Emotional Intelligence Score</p>
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="flex-1 h-3 bg-slate-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all ${
                                                    result.emotionalIntelligence >= 75 ? 'bg-emerald-500' :
                                                    result.emotionalIntelligence >= 50 ? 'bg-amber-500' :
                                                    'bg-red-500'
                                                }`}
                                                style={{ width: `${result.emotionalIntelligence}%` }}
                                            />
                                        </div>
                                        <span className="text-2xl font-bold text-white min-w-[3rem]">{result.emotionalIntelligence}</span>
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        {result.emotionalIntelligence >= 75 ? '✨ Excellent ability to read and respond to prospect emotions' :
                                         result.emotionalIntelligence >= 50 ? '⚡ Good emotional awareness with room for growth' :
                                         '📚 Needs development in reading emotional cues'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-10 pt-8 border-t border-slate-800/50">
                        <h3 className="text-white font-bold mb-4 flex items-center gap-2">
                             Recommended Training <span className="text-xs font-normal text-slate-500 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">AI Curated</span>
                        </h3>
                        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
                            <div className="shrink-0 w-64 p-4 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-brand-500/50 cursor-pointer transition-all hover:translate-y-[-2px] group">
                                <div className="h-28 bg-slate-900 rounded-lg mb-3 flex items-center justify-center text-3xl group-hover:text-brand-400 transition-colors">📹</div>
                                <p className="text-sm font-bold text-slate-200 truncate">Advanced Closing Techniques</p>
                                <p className="text-xs text-brand-400 mt-1">Video • 12 mins</p>
                            </div>
                            <div className="shrink-0 w-64 p-4 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-brand-500/50 cursor-pointer transition-all hover:translate-y-[-2px] group">
                                <div className="h-28 bg-slate-900 rounded-lg mb-3 flex items-center justify-center text-3xl group-hover:text-brand-400 transition-colors">📄</div>
                                <p className="text-sm font-bold text-slate-200 truncate">Objection Handling Script</p>
                                <p className="text-xs text-brand-400 mt-1">PDF • Read now</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Team Collaboration / Comments */}
                <div className="glass-panel border border-slate-800/50 rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                        <MessageSquare size={18} className="text-brand-400"/> Team Discussion
                    </h3>
                    
                    <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                        {comments.length === 0 ? (
                            <div className="text-center py-8 bg-slate-900/30 rounded-xl border border-dashed border-slate-800">
                                <p className="text-sm text-slate-500 italic">No comments yet. Start the conversation!</p>
                            </div>
                        ) : (
                            comments.map((comment) => (
                                <div key={comment.id} className="flex gap-4 animate-fade-in group">
                                    <img src={comment.avatar} className="w-10 h-10 rounded-full border-2 border-slate-800" alt={comment.author} />
                                    <div className="bg-slate-900/80 p-4 rounded-2xl rounded-tl-none border border-slate-800 group-hover:border-brand-500/20 transition-colors flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-sm font-bold text-white">{comment.author}</span>
                                            <span className="text-xs text-slate-500">{comment.timestamp}</span>
                                        </div>
                                        <p className="text-sm text-slate-300 leading-relaxed">{comment.text}</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="relative">
                        <input 
                            type="text" 
                            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl pl-5 pr-14 py-4 text-sm text-slate-200 focus:ring-2 focus:ring-brand-500/50 focus:border-brand-500/50 outline-none transition-all placeholder:text-slate-600"
                            placeholder="Add a comment for the team..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                        />
                        <button 
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-brand-600 hover:bg-brand-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                        >
                            <Send size={18} />
                        </button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CallAnalysis;