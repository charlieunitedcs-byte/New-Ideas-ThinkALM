
import React, { useContext, useState } from 'react';
import { FileText, PlayCircle, Download, Lock, Search, UploadCloud, Users, Globe, X, Plus } from 'lucide-react';
import { TrainingMaterial, UserRole, User } from '../types';
import { NotificationContext } from '../App';

interface TrainingLibraryProps {
    currentUser: User;
}

const mockMaterials: TrainingMaterial[] = [
  { id: '1', title: 'The Perfect Cold Call Script', type: 'PDF', category: 'Prospecting', url: '#', addedBy: 'System Admin', date: '2023-10-15', visibility: 'GLOBAL' },
  { id: '2', title: 'Handling "Too Expensive" Objections', type: 'VIDEO', category: 'Objection Handling', url: '#', addedBy: 'System Admin', date: '2023-10-20', visibility: 'GLOBAL' },
  { id: '3', title: 'Think ALM Product Demo Flow', type: 'VIDEO', category: 'Product Knowledge', url: '#', addedBy: 'System Admin', date: '2023-11-01', visibility: 'GLOBAL' },
  { id: '4', title: 'Q4 Sales Playbook - Sales Alpha', type: 'PDF', category: 'Strategy', url: '#', addedBy: 'Alex Chen', date: '2023-11-10', visibility: 'TEAM', teamId: 'Sales Alpha' },
  { id: '5', title: 'Closing Techniques for SaaS', type: 'VIDEO', category: 'Closing', url: '#', addedBy: 'System Admin', date: '2023-11-15', visibility: 'GLOBAL' },
  { id: '6', title: 'Competitor Battlecards: Beta Team', type: 'PDF', category: 'Strategy', url: '#', addedBy: 'Sarah Miller', date: '2023-11-20', visibility: 'TEAM', teamId: 'Sales Beta' },
];

const TrainingLibrary: React.FC<TrainingLibraryProps> = ({ currentUser }) => {
  const { notify } = useContext(NotificationContext);
  const [materials, setMaterials] = useState<TrainingMaterial[]>(mockMaterials);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  
  // Upload Modal State
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadType, setUploadType] = useState<'PDF' | 'VIDEO'>('PDF');
  const [uploadCategory, setUploadCategory] = useState('General');
  const [uploadVisibility, setUploadVisibility] = useState<'GLOBAL' | 'TEAM'>('TEAM');

  // Filter Logic: Show GLOBAL items + TEAM items matching current user's team
  const filteredMaterials = materials.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filter === 'All' || item.category === filter;
      
      const hasAccess = item.visibility === 'GLOBAL' || (item.visibility === 'TEAM' && item.teamId === currentUser.team);
      
      return matchesSearch && matchesCategory && hasAccess;
  });

  const handleUpload = (e: React.FormEvent) => {
      e.preventDefault();
      
      const newMaterial: TrainingMaterial = {
          id: Date.now().toString(),
          title: uploadTitle,
          type: uploadType,
          category: uploadCategory,
          url: '#',
          addedBy: currentUser.name,
          date: new Date().toISOString().split('T')[0],
          visibility: uploadVisibility,
          teamId: uploadVisibility === 'TEAM' ? currentUser.team : undefined
      };

      setMaterials([newMaterial, ...materials]);
      setIsUploadOpen(false);
      setUploadTitle('');
      notify("Training material uploaded successfully!", "success");
  };

  return (
    <div className="space-y-8 animate-fade-in relative">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Training Material</h1>
          <p className="text-slate-400">Master new skills with curated sales resources.</p>
        </div>
        
        <div className="flex gap-3">
             <div className="relative">
                <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                <input 
                    type="text" 
                    placeholder="Search..." 
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 rounded-xl pl-9 pr-4 py-2 text-sm outline-none focus:border-brand-500 w-full md:w-64" 
                />
             </div>
            <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-4 py-2 text-sm outline-none focus:border-brand-500"
            >
                <option value="All">All Categories</option>
                <option value="Prospecting">Prospecting</option>
                <option value="Closing">Closing</option>
                <option value="Strategy">Strategy</option>
                <option value="Product Knowledge">Product Knowledge</option>
            </select>
            
            {/* Admin Only Upload Button */}
            {currentUser.role === UserRole.ADMIN && (
                <button 
                    onClick={() => setIsUploadOpen(true)}
                    className="bg-brand-600 hover:bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-lg shadow-brand-500/25 transition-colors"
                >
                    <Plus size={16} /> Upload
                </button>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMaterials.map((item) => (
          <div key={item.id} className="group glass-panel border border-slate-800/50 rounded-2xl overflow-hidden hover:border-brand-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.15)] transition-all duration-300 hover:translate-y-[-4px]">
            <div className="h-48 bg-slate-900/50 relative flex items-center justify-center group-hover:bg-slate-900/80 transition-colors">
               {item.type === 'VIDEO' ? (
                 <PlayCircle size={56} className="text-slate-700 group-hover:text-brand-400 transition-colors drop-shadow-lg" />
               ) : (
                 <FileText size={56} className="text-slate-700 group-hover:text-accent-400 transition-colors drop-shadow-lg" />
               )}
               <div className="absolute top-4 right-4 flex gap-2">
                 {item.visibility === 'GLOBAL' ? (
                     <span className="px-2 py-1 bg-black/60 backdrop-blur-md text-[10px] font-bold text-slate-300 rounded-md border border-white/10 flex items-center gap-1">
                        <Globe size={10} /> GLOBAL
                     </span>
                 ) : (
                     <span className="px-2 py-1 bg-brand-900/60 backdrop-blur-md text-[10px] font-bold text-brand-200 rounded-md border border-brand-500/30 flex items-center gap-1">
                        <Users size={10} /> TEAM
                     </span>
                 )}
               </div>
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-3">
                 <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest">{item.category}</span>
              </div>
              <h3 className="font-bold text-white mb-2 line-clamp-2 h-12 text-lg leading-snug group-hover:text-brand-100 transition-colors">{item.title}</h3>
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-slate-800/50">
                <div className="flex flex-col">
                    <span className="text-xs text-slate-500 font-medium">{item.date}</span>
                    <span className="text-[10px] text-slate-600">By {item.addedBy}</span>
                </div>
                <button 
                  onClick={() => notify(`Downloading ${item.title}...`, "success")}
                  className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg hover:bg-brand-600"
                >
                  <Download size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {/* Mock Locked Content */}
        <div 
          onClick={() => notify("Content locked. Upgrade to Pro Growth plan to access.", "error")}
          className="glass-panel border border-slate-800/50 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
        >
            <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-4 text-slate-500">
                <Lock size={24} />
            </div>
            <h3 className="font-bold text-slate-300 text-lg">Advanced Masterclass</h3>
            <p className="text-sm text-slate-500 mt-2 mb-6">Upgrade to Pro Growth to unlock exclusive strategies.</p>
            <button className="px-6 py-2 bg-slate-800 text-white text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-700 transition-colors">
                View Plans
            </button>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
              <div className="glass-panel bg-slate-950 border border-slate-800 w-full max-w-lg rounded-2xl p-8 shadow-2xl relative">
                  <button 
                    onClick={() => setIsUploadOpen(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                  >
                      <X size={20} />
                  </button>
                  
                  <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-brand-600/20 rounded-xl flex items-center justify-center text-brand-500">
                          <UploadCloud size={20} />
                      </div>
                      <h2 className="text-xl font-bold text-white">Upload Material</h2>
                  </div>

                  <form onSubmit={handleUpload} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                          <input 
                            required
                            type="text" 
                            value={uploadTitle}
                            onChange={(e) => setUploadTitle(e.target.value)}
                            placeholder="e.g. Q4 Sales Playbook" 
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500"
                          />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                            <select 
                                value={uploadType}
                                onChange={(e) => setUploadType(e.target.value as 'PDF' | 'VIDEO')}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500"
                            >
                                <option value="PDF">PDF Document</option>
                                <option value="VIDEO">Video Recording</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                            <select 
                                value={uploadCategory}
                                onChange={(e) => setUploadCategory(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500"
                            >
                                <option value="General">General</option>
                                <option value="Prospecting">Prospecting</option>
                                <option value="Closing">Closing</option>
                                <option value="Strategy">Strategy</option>
                            </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Visibility Scope</label>
                          <div className="grid grid-cols-2 gap-4">
                              <button 
                                type="button"
                                onClick={() => setUploadVisibility('TEAM')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${uploadVisibility === 'TEAM' ? 'bg-brand-600/20 border-brand-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                              >
                                  <Users size={20} />
                                  <span className="text-xs font-bold">My Team Only</span>
                              </button>
                              <button 
                                type="button"
                                onClick={() => setUploadVisibility('GLOBAL')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${uploadVisibility === 'GLOBAL' ? 'bg-brand-600/20 border-brand-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                              >
                                  <Globe size={20} />
                                  <span className="text-xs font-bold">Everyone (Global)</span>
                              </button>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-2 text-center">
                              {uploadVisibility === 'TEAM' 
                                ? `Visible only to members of ${currentUser.team}` 
                                : 'Visible to all users in the organization'}
                          </p>
                      </div>

                      <div className="pt-4 border-t border-slate-800/50">
                          <button 
                            type="submit" 
                            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20"
                          >
                              Upload Material
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};

export default TrainingLibrary;
