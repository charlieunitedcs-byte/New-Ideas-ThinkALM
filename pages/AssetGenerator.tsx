import React, { useState } from 'react';
import { Image as ImageIcon, Download, Loader2, Wand2, Layers } from 'lucide-react';
import { generateMarketingImage } from '../services/geminiService';

const AssetGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setGeneratedImage(null);
    setError(null);

    try {
      const base64Image = await generateMarketingImage(prompt, size);
      setGeneratedImage(base64Image);
    } catch (err) {
      setError("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Layers className="text-brand-500" size={32} /> Creative Studio
          </h1>
          <p className="text-slate-400">Generate high-fidelity marketing assets using Nano Banana Pro.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Controls */}
        <div className="glass-panel border border-slate-800/50 rounded-2xl p-6 h-fit">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-slate-300 mb-2 uppercase tracking-wide">Image Prompt</label>
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A futuristic sales dashboard on a glass tablet, neon lighting, cyberpunk style..."
                className="w-full h-32 bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-brand-500/50 outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-300 mb-3 uppercase tracking-wide">Resolution</label>
              <div className="grid grid-cols-3 gap-2">
                {(['1K', '2K', '4K'] as const).map((s) => (
                  <button
                    key={s}
                    onClick={() => setSize(s)}
                    className={`py-3 rounded-lg text-sm font-bold border transition-all ${
                      size === s 
                      ? 'bg-brand-600 text-white border-brand-500 shadow-lg shadow-brand-500/20' 
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={handleGenerate}
              disabled={isGenerating || !prompt}
              className="w-full py-4 bg-gradient-to-r from-brand-600 to-accent-600 hover:from-brand-500 hover:to-accent-500 text-white font-bold rounded-xl shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
            >
              {isGenerating ? <Loader2 className="animate-spin" /> : <Wand2 size={18} />}
              {isGenerating ? 'Generating...' : 'Generate Asset'}
            </button>
          </div>
        </div>

        {/* Preview Area */}
        <div className="lg:col-span-2">
            <div className={`aspect-video rounded-2xl border border-slate-800 bg-slate-950/50 flex items-center justify-center overflow-hidden relative group ${!generatedImage && 'border-dashed'}`}>
                {generatedImage ? (
                    <>
                        <img src={generatedImage} alt="Generated Asset" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                            <a 
                                href={generatedImage} 
                                download="generated-asset.png"
                                className="px-6 py-3 bg-white text-black font-bold rounded-full flex items-center gap-2 hover:bg-slate-200 transition-colors"
                            >
                                <Download size={18} /> Download
                            </a>
                        </div>
                    </>
                ) : (
                    <div className="text-center p-8">
                        {isGenerating ? (
                            <div className="flex flex-col items-center">
                                <div className="w-16 h-16 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-slate-400 animate-pulse">Rendering high-resolution asset...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center text-slate-600">
                                <ImageIcon size={48} className="mb-4 opacity-50" />
                                <p className="font-medium">Preview will appear here</p>
                                <p className="text-xs mt-1">Select a resolution and enter a prompt</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
            {error && (
                <div className="mt-4 p-4 bg-red-950/30 border border-red-900/50 rounded-xl text-red-300 text-sm">
                    {error}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AssetGenerator;