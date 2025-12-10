import React, { useEffect } from 'react';
import { X, Download, FileText, PlayCircle } from 'lucide-react';
import { TrainingMaterial } from '../types';

interface TrainingMaterialViewerProps {
  material: TrainingMaterial | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload: (material: TrainingMaterial) => void;
}

const TrainingMaterialViewer: React.FC<TrainingMaterialViewerProps> = ({
  material,
  isOpen,
  onClose,
  onDownload
}) => {
  // Handle ESC key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen || !material) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-fade-in">
      <div className="glass-panel bg-slate-950 border border-slate-800 w-full max-w-4xl h-[80vh] rounded-2xl shadow-2xl relative flex flex-col">
        <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white">{material.title}</h2>
            <p className="text-sm text-slate-400 mt-1">{material.category} • {material.type}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors p-2"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-auto p-6">
          {material.type === 'PDF' ? (
            material.url.startsWith('data:') ? (
              // Display uploaded PDF
              <iframe
                src={material.url}
                className="w-full h-full rounded-xl border border-slate-800"
                title={material.title}
              />
            ) : (
              // Demo material
              <div className="bg-slate-900/50 rounded-xl p-8 h-full flex flex-col items-center justify-center border border-slate-800">
                <FileText size={64} className="text-brand-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-3">{material.title}</h3>
                <p className="text-slate-400 text-center max-w-md mb-6">
                  This is a demo material. Upload your own files to view them here!
                </p>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 max-w-2xl w-full">
                  <h4 className="text-sm font-bold text-brand-300 uppercase tracking-wider mb-4">Document Info</h4>
                  <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
                    <p>📄 <strong>Topic:</strong> {material.category}</p>
                    <p>📅 <strong>Published:</strong> {material.date}</p>
                    <p>👤 <strong>Author:</strong> {material.addedBy}</p>
                  </div>
                </div>
              </div>
            )
          ) : (
            material.url.startsWith('data:') ? (
              // Display uploaded video
              <video
                controls
                className="w-full h-full rounded-xl border border-slate-800"
                src={material.url}
              >
                Your browser does not support the video tag.
              </video>
            ) : (
              // Demo material
              <div className="bg-slate-900/50 rounded-xl p-8 h-full flex flex-col items-center justify-center border border-slate-800">
                <PlayCircle size={64} className="text-brand-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-3">{material.title}</h3>
                <p className="text-slate-400 text-center max-w-md mb-6">
                  This is a demo material. Upload your own videos to view them here!
                </p>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-6 max-w-2xl w-full">
                  <h4 className="text-sm font-bold text-brand-300 uppercase tracking-wider mb-4">Video Info</h4>
                  <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
                    <p>🎥 <strong>Topic:</strong> {material.category}</p>
                    <p>📅 <strong>Published:</strong> {material.date}</p>
                    <p>👤 <strong>Instructor:</strong> {material.addedBy}</p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        <div className="p-6 border-t border-slate-800/50 flex gap-3">
          <button
            onClick={() => onDownload(material)}
            className="flex-1 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
          >
            <Download size={18} />
            Download
          </button>
          <button
            onClick={onClose}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainingMaterialViewer;
