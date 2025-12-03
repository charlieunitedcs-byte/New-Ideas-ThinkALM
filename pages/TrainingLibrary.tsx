
import React, { useContext, useState } from 'react';
import { FileText, PlayCircle, Download, Lock, Search, UploadCloud, Users, Globe, X, Plus, Eye, Edit, Trash2 } from 'lucide-react';
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

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<TrainingMaterial | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editType, setEditType] = useState<'PDF' | 'VIDEO'>('PDF');
  const [editCategory, setEditCategory] = useState('General');
  const [editVisibility, setEditVisibility] = useState<'GLOBAL' | 'TEAM'>('TEAM');

  // Viewer Modal State
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewingMaterial, setViewingMaterial] = useState<TrainingMaterial | null>(null);

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

  const handleViewMaterial = (material: TrainingMaterial) => {
    setViewingMaterial(material);
    setViewerOpen(true);
  };

  const handleDownloadMaterial = (material: TrainingMaterial) => {
    // Simulate download by creating a dummy file
    const blob = new Blob([`Training Material: ${material.title}\n\nType: ${material.type}\nCategory: ${material.category}\n\nThis is a demo download.`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${material.title}.${material.type === 'PDF' ? 'pdf' : 'mp4'}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    notify(`Downloading ${material.title}...`, "success");
  };

  // Check if user has admin/super admin access
  const hasFullAccess = currentUser.role === UserRole.ADMIN || currentUser.role === UserRole.SUPER_ADMIN;

  const handleEditMaterial = (material: TrainingMaterial) => {
    setEditingMaterial(material);
    setEditTitle(material.title);
    setEditType(material.type);
    setEditCategory(material.category);
    setEditVisibility(material.visibility);
    setIsEditOpen(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMaterial) return;

    const updatedMaterials = materials.map(m =>
      m.id === editingMaterial.id
        ? {
            ...m,
            title: editTitle,
            type: editType,
            category: editCategory,
            visibility: editVisibility,
            teamId: editVisibility === 'TEAM' ? currentUser.team : undefined
          }
        : m
    );

    setMaterials(updatedMaterials);
    setIsEditOpen(false);
    setEditingMaterial(null);
    notify("Training material updated successfully!", "success");
  };

  const handleDeleteMaterial = (materialId: string) => {
    if (confirm("Are you sure you want to delete this training material?")) {
      setMaterials(materials.filter(m => m.id !== materialId));
      notify("Training material deleted", "success");
    }
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
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewMaterial(item)}
                    className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg hover:bg-brand-600"
                    title="View in app"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => handleDownloadMaterial(item)}
                    className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg hover:bg-brand-600"
                    title="Download"
                  >
                    <Download size={16} />
                  </button>
                  {hasFullAccess && (
                    <>
                      <button
                        onClick={() => handleEditMaterial(item)}
                        className="text-slate-400 hover:text-white transition-colors bg-slate-800 p-2 rounded-lg hover:bg-blue-600 opacity-0 group-hover:opacity-100"
                        title="Edit material"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteMaterial(item.id)}
                        className="text-slate-400 hover:text-red-400 transition-colors bg-slate-800 p-2 rounded-lg hover:bg-red-950/50 opacity-0 group-hover:opacity-100"
                        title="Delete material"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Mock Locked Content - Only show for non-admin users */}
        {!hasFullAccess && (
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
        )}
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

      {/* Edit Material Modal */}
      {isEditOpen && editingMaterial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-fade-in">
              <div className="glass-panel bg-slate-950 border border-slate-800 w-full max-w-lg rounded-2xl p-8 shadow-2xl relative">
                  <button
                    onClick={() => setIsEditOpen(false)}
                    className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                  >
                      <X size={20} />
                  </button>

                  <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-blue-600/20 rounded-xl flex items-center justify-center text-blue-500">
                          <Edit size={20} />
                      </div>
                      <h2 className="text-xl font-bold text-white">Edit Material</h2>
                  </div>

                  <form onSubmit={handleSaveEdit} className="space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Title</label>
                          <input
                            required
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="e.g. Q4 Sales Playbook"
                            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Type</label>
                            <select
                                value={editType}
                                onChange={(e) => setEditType(e.target.value as 'PDF' | 'VIDEO')}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500"
                            >
                                <option value="PDF">PDF Document</option>
                                <option value="VIDEO">Video Recording</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                            <select
                                value={editCategory}
                                onChange={(e) => setEditCategory(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white outline-none focus:border-brand-500"
                            >
                                <option value="General">General</option>
                                <option value="Prospecting">Prospecting</option>
                                <option value="Closing">Closing</option>
                                <option value="Strategy">Strategy</option>
                                <option value="Product Knowledge">Product Knowledge</option>
                                <option value="Objection Handling">Objection Handling</option>
                            </select>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Visibility Scope</label>
                          <div className="grid grid-cols-2 gap-4">
                              <button
                                type="button"
                                onClick={() => setEditVisibility('TEAM')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${editVisibility === 'TEAM' ? 'bg-brand-600/20 border-brand-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                              >
                                  <Users size={20} />
                                  <span className="text-xs font-bold">My Team Only</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditVisibility('GLOBAL')}
                                className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${editVisibility === 'GLOBAL' ? 'bg-brand-600/20 border-brand-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-600'}`}
                              >
                                  <Globe size={20} />
                                  <span className="text-xs font-bold">Everyone (Global)</span>
                              </button>
                          </div>
                          <p className="text-[10px] text-slate-500 mt-2 text-center">
                              {editVisibility === 'TEAM'
                                ? `Visible only to members of ${currentUser.team}`
                                : 'Visible to all users in the organization'}
                          </p>
                      </div>

                      <div className="pt-4 border-t border-slate-800/50 flex gap-3">
                          <button
                            type="submit"
                            className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20"
                          >
                              Save Changes
                          </button>
                          <button
                            type="button"
                            onClick={() => setIsEditOpen(false)}
                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
                          >
                              Cancel
                          </button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {/* Material Viewer Modal */}
      {viewerOpen && viewingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
          <div className="glass-panel bg-slate-950 border border-slate-800 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl relative flex flex-col">
            <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">{viewingMaterial.title}</h2>
                <p className="text-sm text-slate-400 mt-1">{viewingMaterial.category} • {viewingMaterial.type}</p>
              </div>
              <button
                onClick={() => setViewerOpen(false)}
                className="text-slate-500 hover:text-white transition-colors p-2"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {viewingMaterial.type === 'PDF' ? (
                <div className="bg-slate-900/50 rounded-xl p-8 h-full flex flex-col items-center justify-center border border-slate-800">
                  <FileText size={64} className="text-brand-400 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-3">{viewingMaterial.title}</h3>
                  <p className="text-slate-400 text-center max-w-md mb-6">
                    This is a demo PDF viewer. In production, this would display the actual PDF content using a PDF viewer library like react-pdf or pdf.js.
                  </p>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 max-w-2xl w-full">
                    <h4 className="text-sm font-bold text-brand-300 uppercase tracking-wider mb-4">Document Preview</h4>
                    <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
                      <p>📄 <strong>Topic:</strong> {viewingMaterial.category}</p>
                      <p>📅 <strong>Published:</strong> {viewingMaterial.date}</p>
                      <p>👤 <strong>Author:</strong> {viewingMaterial.addedBy}</p>
                      <p className="pt-4 border-t border-slate-800">
                        This training material contains valuable insights and strategies for improving your sales performance.
                        In a real application, the full PDF would be rendered here with interactive features.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-900/50 rounded-xl p-8 h-full flex flex-col items-center justify-center border border-slate-800">
                  <PlayCircle size={64} className="text-brand-400 mb-6" />
                  <h3 className="text-2xl font-bold text-white mb-3">{viewingMaterial.title}</h3>
                  <p className="text-slate-400 text-center max-w-md mb-6">
                    This is a demo video viewer. In production, this would display the actual video using an HTML5 video player or embedded service like YouTube/Vimeo.
                  </p>
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 max-w-2xl w-full">
                    <h4 className="text-sm font-bold text-brand-300 uppercase tracking-wider mb-4">Video Preview</h4>
                    <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
                      <p>🎥 <strong>Topic:</strong> {viewingMaterial.category}</p>
                      <p>📅 <strong>Published:</strong> {viewingMaterial.date}</p>
                      <p>👤 <strong>Instructor:</strong> {viewingMaterial.addedBy}</p>
                      <p className="pt-4 border-t border-slate-800">
                        This training video covers essential techniques and best practices.
                        In a real application, the video player would be embedded here with controls for play, pause, and seeking.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-800/50 flex gap-3">
              <button
                onClick={() => handleDownloadMaterial(viewingMaterial)}
                className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
              >
                <Download size={18} />
                Download
              </button>
              <button
                onClick={() => setViewerOpen(false)}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainingLibrary;
