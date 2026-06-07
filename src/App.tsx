import React, { useState } from 'react';
import { Upload, Sparkles, Download, RefreshCw, Trash2, MessageSquare, Settings as SettingsIcon, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { convertToCrayon, CRAYON_PALETTE } from './components/CrayonProcessor.ts';
import ChatView from './components/ChatView.tsx';
import SettingsView from './components/SettingsView.tsx';

type ViewState = 'generating' | 'chat' | 'settings';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('generating');
  const [image, setImage] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setImage(e.target.result as string);
      reader.readAsDataURL(file);
      setResult(null);
    }
  };

  const handleGenerate = async () => {
    if (!image) return;
    setIsProcessing(true);
    setProgress(0);
    try {
      const response = await fetch('/api/crayons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image })
      });
      if (!response.ok) throw new Error('Backend failed');
      const data = await response.json();
      setResult(data.result);
    } catch (err) {
      console.error(err);
      alert('Gagal memproses gambar melalui Backend. Silahkan coba lagi.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result;
    link.download = `cid-ai-crayon-${Date.now()}.png`;
    link.click();
  };

  const reset = () => {
    setImage(null);
    setResult(null);
    setProgress(0);
  };

  const renderView = () => {
    switch (currentView) {
      case 'chat':
        return <ChatView key="chat" />;
      case 'settings':
        return <SettingsView key="settings" />;
      default:
        return (
          <motion.main 
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full max-w-lg mx-auto flex flex-col p-4 gap-4 relative overflow-hidden"
          >
            {/* Workspace Card */}
            <div className="flex-1 bg-zinc-900/40 border border-zinc-800/50 rounded-[2.5rem] overflow-hidden flex flex-col shadow-inner backdrop-blur-sm relative">
              <AnimatePresence mode="wait">
                {!image ? (
                  <motion.label
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1 flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800/40 transition-colors p-8 text-center group"
                  >
                    <div className="w-24 h-24 rounded-[2rem] bg-zinc-800 border border-zinc-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                      <Upload size={40} className="text-zinc-500 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2 tracking-tight">Upload Moment</h2>
                    <p className="text-sm text-zinc-500 max-w-[200px]">Pilih foto dan biarkan AI mengubahnya menjadi Krayon.</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                  </motion.label>
                ) : (
                  <motion.div
                    key="workspace"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex-1 flex flex-col relative"
                  >
                    <div className="flex-1 p-4 flex flex-col items-center justify-center gap-4">
                      <div className="relative w-full aspect-square max-h-[380px] bg-zinc-950 rounded-[2rem] overflow-hidden border border-zinc-800 shadow-2xl">
                         <img 
                          src={result || image} 
                          className={`w-full h-full object-contain transition-all duration-700 ${isProcessing ? 'grayscale blur-md' : ''}`} 
                          alt="Workspace" 
                        />
                        {isProcessing && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 backdrop-blur-md">
                            <RefreshCw size={48} className="animate-spin text-blue-500 mb-6" />
                            <div className="w-56 h-2 bg-zinc-800 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-blue-600"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress * 100}%` }}
                              />
                            </div>
                            <p className="mt-4 text-[10px] font-bold text-blue-500 uppercase tracking-[0.3em]">Processing AI Layers</p>
                          </div>
                        )}
                        {!isProcessing && result && (
                          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-blue-600/90 text-white text-[10px] font-bold px-4 py-2 rounded-full shadow-2xl backdrop-blur flex items-center gap-2 border border-blue-400/30">
                            <Sparkles size={12} /> CRAYON FILTER V1
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="h-16 bg-zinc-950/60 border-t border-zinc-800 px-6 flex items-center justify-between">
                       <div className="flex -space-x-1">
                        {CRAYON_PALETTE.slice(0, 10).map(c => (
                          <div key={c.hex} className="w-6 h-6 rounded-full border-2 border-zinc-900 shadow-sm" style={{ backgroundColor: c.hex }} />
                        ))}
                       </div>
                       <button onClick={reset} className="p-3 hover:bg-zinc-800 rounded-2xl text-zinc-500 hover:text-red-400 transition-all">
                          <Trash2 size={20} />
                       </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col gap-3">
              {!result ? (
                <button
                  onClick={handleGenerate}
                  disabled={!image || isProcessing}
                  className={`w-full py-5 rounded-3xl font-black text-sm tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 ${
                    !image || isProcessing 
                      ? 'bg-zinc-800 text-zinc-600 border border-zinc-700' 
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                  }`}
                >
                  <Sparkles size={20} />
                  {isProcessing ? 'PROSECCING ENGINE...' : 'GENERATE CRAYON'}
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={reset}
                    className="flex-1 py-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-3xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 border border-zinc-700"
                  >
                    <RefreshCw size={20} />
                  </button>
                  <button
                    onClick={handleDownload}
                    className="flex-[3] py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-3xl font-black text-sm tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95"
                  >
                    <Download size={20} />
                    SIMPAN HASIL
                  </button>
                </div>
              )}
            </div>
          </motion.main>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-[#09090b] text-white flex flex-col items-center overflow-hidden font-sans select-none">
      {/* Dynamic Header */}
      <header className="w-full h-16 flex items-center justify-between px-6 z-40 bg-zinc-950/50 backdrop-blur-xl border-b border-zinc-900">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center font-black text-white italic shadow-lg shadow-blue-900/30">
            C
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-black tracking-tighter leading-none italic uppercase">CID•AI</h1>
            <span className="text-[9px] font-bold text-blue-500 tracking-[0.2em] uppercase">{currentView}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
           <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
           <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">Core Engine Live</span>
        </div>
      </header>

      {/* Dynamic View Container */}
      <AnimatePresence mode="wait">
        {renderView()}
      </AnimatePresence>

      {/* Bottom Navigation Tab Bar */}
      <nav className="w-full h-20 bg-zinc-950 border-t border-zinc-900 flex items-center justify-around px-4 pb-4">
        <button 
          onClick={() => setCurrentView('generating')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'generating' ? 'text-blue-500 scale-110' : 'text-zinc-600'}`}
        >
          <LayoutGrid size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Build</span>
        </button>
        <button 
          onClick={() => setCurrentView('chat')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'chat' ? 'text-blue-500 scale-110' : 'text-zinc-600'}`}
        >
          <MessageSquare size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Chat</span>
        </button>
        <button 
          onClick={() => setCurrentView('settings')}
          className={`flex flex-col items-center gap-1 transition-all ${currentView === 'settings' ? 'text-blue-500 scale-110' : 'text-zinc-600'}`}
        >
          <SettingsIcon size={24} />
          <span className="text-[10px] font-bold uppercase tracking-widest">Admin</span>
        </button>
      </nav>
    </div>
  );
}

