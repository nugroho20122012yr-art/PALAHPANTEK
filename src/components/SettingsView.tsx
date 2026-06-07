import React from 'react';
import { Settings, Shield, Info, Palette, Layers, Cpu } from 'lucide-react';
import { motion } from 'motion/react';

export default function SettingsView() {
  return (
    <div className="flex-1 flex flex-col overflow-y-auto bg-zinc-950 p-6 scrollbar-hide">
      <div className="max-w-lg mx-auto w-full space-y-8">
        
        {/* Profile Section */}
        <div className="flex flex-col items-center py-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center font-black text-white text-4xl italic shadow-2xl mb-4 border-4 border-zinc-900">
            C
          </div>
          <h2 className="text-xl font-bold">CID•AI Premium</h2>
          <p className="text-zinc-500 text-sm">Versi 1.0.0 Stable</p>
        </div>

        {/* Categories */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] px-2">Engine Settings</h3>
          
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <Palette className="text-blue-500" size={20} />
                <span className="text-sm font-medium">Color Depth</span>
              </div>
              <span className="text-xs text-zinc-400">20 Primary Shades</span>
            </div>
            
            <div className="p-4 flex items-center justify-between border-b border-zinc-800">
              <div className="flex items-center gap-3">
                <Layers className="text-purple-500" size={20} />
                <span className="text-sm font-medium">Texture Level</span>
              </div>
              <span className="text-xs text-zinc-400 text-blue-500 font-bold tracking-tighter italic">CRAYON-WAX</span>
            </div>

            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Cpu className="text-green-500" size={20} />
                <span className="text-sm font-medium">Processing Engine</span>
              </div>
              <span className="text-xs text-zinc-400">Local Canvas HW</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] px-2">Application</h3>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl overflow-hidden">
            <div className="p-4 flex items-center justify-between border-b border-zinc-800 cursor-pointer hover:bg-zinc-800/30 transition-colors">
              <div className="flex items-center gap-3">
                <Shield className="text-zinc-400" size={20} />
                <span className="text-sm font-medium">Privacy Policy</span>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between cursor-pointer hover:bg-zinc-800/30 transition-colors">
              <div className="flex items-center gap-3">
                <Info className="text-zinc-400" size={20} />
                <span className="text-sm font-medium">About Developer</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 pb-12 flex flex-col items-center gap-2">
           <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest">
            Handcrafted for Sketchware Pro
          </p>
          <div className="flex gap-4">
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
            <div className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
}
