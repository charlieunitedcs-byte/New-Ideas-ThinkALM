import React, { useState } from 'react';
import { Globe, Search, ArrowRight, ExternalLink, Loader2, Sparkles } from 'lucide-react';
import { searchMarketIntel, SearchResult } from '../services/geminiService';
import ReactMarkdown from 'react-markdown'; // Assuming react-markdown isn't available, I'll render simple text, but ideally we'd use a parser.

const MarketIntel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<SearchResult | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;
    setIsSearching(true);
    setResult(null);
    try {
      const data = await searchMarketIntel(query);
      setResult(data);
    } catch (error) {
      console.error(error);
      setResult({ text: "An error occurred while fetching market intelligence.", sources: [] });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <Globe className="text-brand-500" size={32} /> Market Intelligence
        </h1>
        <p className="text-slate-400">Real-time web search grounded by Google. Research prospects, competitors, and trends.</p>
      </div>

      {/* Search Input */}
      <div className="glass-panel p-2 rounded-2xl border border-slate-800 shadow-xl relative z-10">
        <div className="relative flex items-center">
            <Search className="absolute left-6 text-slate-500" size={24} />
            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="E.g. Recent acquisitions by Salesforce, Competitors to HubSpot in 2024..." 
              className="w-full bg-slate-900/50 border-none rounded-xl pl-16 pr-4 py-6 text-lg text-white focus:ring-0 outline-none placeholder:text-slate-600"
            />
            <button 
                onClick={handleSearch}
                disabled={isSearching || !query}
                className="absolute right-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl px-6 py-3 font-bold transition-all disabled:opacity-50 flex items-center gap-2"
            >
                {isSearching ? <Loader2 className="animate-spin" size={20} /> : <ArrowRight size={20} />}
            </button>
        </div>
      </div>

      {/* Results */}
      {result && (
        <div className="glass-panel border border-brand-500/20 rounded-2xl p-8 animate-fade-in">
           <div className="mb-6 flex items-center gap-2">
               <Sparkles size={18} className="text-brand-400" />
               <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider">AI Insight</h3>
           </div>
           
           <div className="prose prose-invert max-w-none text-slate-200 leading-relaxed whitespace-pre-line">
              {result.text}
           </div>

           {result.sources.length > 0 && (
             <div className="mt-8 pt-6 border-t border-slate-800/50">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Sources</h4>
                <div className="grid gap-3 sm:grid-cols-2">
                    {result.sources.map((source, idx) => (
                        <a 
                          key={idx} 
                          href={source.uri} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-brand-500/30 hover:bg-slate-900 transition-colors group"
                        >
                            <div className="w-8 h-8 rounded bg-slate-800 flex items-center justify-center shrink-0">
                                <Globe size={14} className="text-slate-500 group-hover:text-brand-400 transition-colors" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <p className="text-sm font-medium text-slate-300 truncate group-hover:text-white transition-colors">{source.title || "Web Source"}</p>
                                <p className="text-xs text-slate-600 truncate">{source.uri}</p>
                            </div>
                            <ExternalLink size={14} className="text-slate-600 group-hover:text-slate-400" />
                        </a>
                    ))}
                </div>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

export default MarketIntel;