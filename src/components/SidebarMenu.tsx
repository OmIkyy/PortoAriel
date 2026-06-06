import React, { useState, useEffect } from 'react';
import { appAudio } from '../audioEngine';
import { 
  X, User, Award, Image as ImageIcon, MapPin, 
  Settings, Music2, Volume2, Play, Pause, 
  Terminal, ShieldCheck, Heart, Radio, Cpu
} from 'lucide-react';

interface SidebarMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: string) => void;
  onOpenOwner: () => void;
  isOwnerLoggedIn: boolean;
}

export default function SidebarMenu({ 
  isOpen, 
  onClose, 
  onNavigate, 
  onOpenOwner,
  isOwnerLoggedIn
}: SidebarMenuProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isSynthMode, setIsSynthMode] = useState(false);

  useEffect(() => {
    // Sync React states once opened
    if (isOpen) {
      setIsPlaying(appAudio.getIsPlaying());
      setVolume(Math.round(appAudio.getVolume() * 100));
      setIsSynthMode(!appAudio.getIsStreamMode());
    }
  }, [isOpen]);

  const handleTogglePlay = () => {
    appAudio.toggle();
    setIsPlaying(appAudio.getIsPlaying());
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    setVolume(val);
    appAudio.setVolume(val / 100);
  };

  const handleToggleMode = () => {
    appAudio.toggleMode();
    setIsSynthMode(!appAudio.getIsStreamMode());
    setIsPlaying(appAudio.getIsPlaying());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Semi-transparent dark overlay */}
      <div 
        id="sidebar-overlay"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/25 backdrop-blur-xs transition-opacity duration-300"
      ></div>

      {/* Modern High-Contrast Sidebar Drawer (Frosted Glass) */}
      <div 
        id="sidebar-container"
        className="relative w-full max-w-sm md:max-w-md bg-white/95 border-l border-slate-200/80 text-slate-800 h-full shadow-2xl flex flex-col p-6 z-10 overflow-y-auto backdrop-blur-2xl"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200/60">
          <div>
            <h2 className="text-sm font-black tracking-[0.2em] text-slate-900 uppercase">
              Dashboard Navigasi
            </h2>
            <p className="text-[10px] text-slate-400 font-mono font-bold">NODE_INDEX: v1.1.00</p>
          </div>
          <button 
            id="close-sidebar"
            onClick={onClose}
            className="p-2 border border-slate-200/80 hover:border-slate-300 rounded-lg hover:text-slate-800 transition-all text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Categories */}
        <nav className="flex-1 py-8 space-y-4">
          <p className="text-[10px] font-mono text-slate-400 tracking-wider uppercase mb-2 font-bold">PORTOFOLIO LINK</p>
          
          <button
            onClick={() => onNavigate('profile-section')}
            className="w-full flex items-center gap-4 py-3 px-4 border border-slate-200/50 bg-slate-50 hover:bg-slate-105 hover:border-slate-300 hover:text-slate-900 text-slate-700 rounded-xl transition-all text-left font-sans text-sm focus:outline-none cursor-pointer"
          >
            <User className="w-4 h-4 text-slate-400" />
            <span className="flex-1 font-bold font-sans">1. Profil Utama</span>
            <span className="text-[9px] font-mono text-slate-400 font-bold">ABOUT_ME</span>
          </button>

          <button
            onClick={() => onNavigate('achievements-section')}
            className="w-full flex items-center gap-4 py-3 px-4 border border-slate-200/50 bg-slate-50 hover:bg-slate-105 hover:border-slate-300 hover:text-slate-900 text-slate-700 rounded-xl transition-all text-left font-sans text-sm focus:outline-none cursor-pointer"
          >
            <Award className="w-4 h-4 text-slate-400" />
            <span className="flex-1 font-bold font-sans">2. Galeri Pencapaian</span>
            <span className="text-[9px] font-mono text-slate-400 font-bold">ACHIEVE</span>
          </button>

          <button
            onClick={() => onNavigate('gallery-section')}
            className="w-full flex items-center gap-4 py-3 px-4 border border-slate-200/50 bg-slate-50 hover:bg-slate-105 hover:border-slate-300 hover:text-slate-900 text-slate-700 rounded-xl transition-all text-left font-sans text-sm focus:outline-none cursor-pointer"
          >
            <ImageIcon className="w-4 h-4 text-slate-400" />
            <span className="flex-1 font-bold font-sans">3. Galeri Kegiatan</span>
            <span className="text-[9px] font-mono text-slate-400 font-bold">GALLERY</span>
          </button>

          <button
            onClick={() => onNavigate('location-section')}
            className="w-full flex items-center gap-4 py-3 px-4 border border-slate-200/50 bg-slate-50 hover:bg-slate-105 hover:border-slate-300 hover:text-slate-900 text-slate-700 rounded-xl transition-all text-left font-sans text-sm focus:outline-none cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-slate-400" />
            <span className="flex-1 font-bold font-sans">4. Lokasi Tinggal</span>
            <span className="text-[9px] font-mono text-slate-400 font-bold">LOCATION</span>
          </button>

          <button
            onClick={() => onNavigate('terminal-section')}
            className="w-full flex items-center gap-4 py-3 px-4 border border-slate-200/50 bg-slate-50 hover:bg-slate-105 hover:border-slate-300 hover:text-slate-900 text-slate-700 rounded-xl transition-all text-left font-sans text-sm focus:outline-none cursor-pointer"
          >
            <Terminal className="w-4 h-4 text-slate-400" />
            <span className="flex-1 font-bold font-sans">5. Terminal Jaringan</span>
            <span className="text-[9px] font-mono text-slate-400 font-bold">TKJ_PING</span>
          </button>
        </nav>

        {/* Backsound Ambient Control Console */}
        <div className="bg-slate-50 border border-slate-200/80 p-5 rounded-2xl mb-6 text-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Music2 className="w-4 h-4 text-indigo-600 animate-pulse" />
              <span className="text-xs font-black tracking-widest uppercase text-slate-800">AUDIO BACKSOUND</span>
            </div>
            
            {/* Mode switch (Stream vs Web Synth) */}
            <button 
              id="audio-mode-toggle"
              onClick={handleToggleMode}
              className="text-[9px] font-mono px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-all text-slate-600 hover:text-slate-800 font-bold flex items-center gap-1 cursor-pointer"
              title="Ganti antara lofi track internet dengan synthesizer internal"
            >
              {isSynthMode ? <Cpu className="w-2.5 h-2.5 text-indigo-600" /> : <Radio className="w-2.5 h-2.5 text-indigo-600" />}
              {isSynthMode ? "SYNTH OSC" : "LOFI STREAM"}
            </button>
          </div>

          <div className="flex flex-col gap-2 py-3 border-y border-slate-200/80 mb-4 text-slate-750 font-bold">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-slate-400 font-bold uppercase">TRACK AKTIF & DIPUTAR</span>
              <div className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="text-[9px] font-mono text-emerald-600 font-extrabold tracking-widest uppercase">TERPUTAR OTOMATIS</span>
              </div>
            </div>
            <div className="text-xs text-slate-800 font-sans font-black flex items-center justify-between">
              <span>
                {isSynthMode 
                  ? "Ambient Space Chord (Am9)" 
                  : "Aesthetic Lofi Stream"}
              </span>
              {/* Beautiful micro audio wave animation bar */}
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-2.5 bg-indigo-500 animate-pulse"></span>
                <span className="w-0.5 h-3.5 bg-indigo-600"></span>
                <span className="w-0.5 h-1.5 bg-indigo-400 animate-pulse"></span>
                <span className="w-0.5 h-3 bg-indigo-500"></span>
              </div>
            </div>
            <p className="text-[9px] font-mono text-slate-400 mt-1 uppercase font-bold text-center">
              * Jeda musik dinonaktifkan
            </p>
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-3">
            <Volume2 className="w-4 h-4 text-slate-400" />
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-slate-900 bg-slate-200 h-1 rounded-full outline-none cursor-pointer"
            />
            <span className="text-[10px] font-mono text-slate-400 w-6 text-right font-bold">
              {volume}%
            </span>
          </div>
        </div>

        {/* Admin Dashboard Entry Point */}
        <div className="border-t border-slate-200/60 pt-6">
          <button
            onClick={() => {
              onClose();
              onOpenOwner();
            }}
            className={`w-full py-3 px-4 rounded-xl border flex items-center justify-center gap-2 font-sans text-xs tracking-widest uppercase transition-all focus:outline-none cursor-pointer ${
              isOwnerLoggedIn 
                ? 'bg-emerald-50 text-emerald-800 border-emerald-250 hover:bg-emerald-100 font-black' 
                : 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800 font-bold'
            }`}
          >
            {isOwnerLoggedIn ? <ShieldCheck className="w-4 h-4 text-emerald-600" /> : <Settings className="w-4 h-4" />}
            {isOwnerLoggedIn ? "AKTIF: PANEL PEMILIK" : "LOGIN PEMILIK WEBSITE"}
          </button>
          <div className="text-center mt-4">
            <p className="text-[9px] text-slate-400 font-mono font-extrabold">
              Designed with pride for TKJ Vocational Student
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
