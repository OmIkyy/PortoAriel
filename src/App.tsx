import React, { useState, useEffect } from 'react';
import { 
  Menu, ShieldCheck, Star, AppWindow, Network, 
  MapPin, Image as ImageIcon, Send, ArrowUp,
  Github, Instagram, MessageSquare, Linkedin, Trash2, Plus, Info, LayoutDashboard,
  User, Award, Terminal
} from 'lucide-react';
import { motion } from 'motion/react';
import FingerprintScanner from './components/FingerprintScanner';
import SidebarMenu from './components/SidebarMenu';
import LocationMap from './components/LocationMap';
import NetworkTerminal from './components/NetworkTerminal';
import OwnerDashboard from './components/OwnerDashboard';
import { loadPortfolioData, savePortfolioData, resetPortfolioData } from './utils';
import { PortfolioData } from './types';
import { appAudio } from './audioEngine';
import { 
  isSupabaseConfigured, 
  fetchSupabasePortfolio, 
  saveSupabasePortfolio, 
  subscribeToPortfolioChanges 
} from './supabase/supabaseClient';

// Premium custom Tiktok vector icon to guarantee perfect library compatibility
const TiktokIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    {...props}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isOwnerOpen, setIsOwnerOpen] = useState(false);
  const [isOwnerLoggedIn, setIsOwnerLoggedIn] = useState(false);
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(() => loadPortfolioData());
  const [skillFilter, setSkillFilter] = useState<'all' | 'networking' | 'admin' | 'general'>('all');
  const [activePhoto, setActivePhoto] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<'profile' | 'achievements' | 'gallery' | 'location' | 'terminal' | 'owner'>('profile');

  // Auto-scroll to top when unlocked
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [isUnlocked]);

  // Sync background music URL with audio engine
  useEffect(() => {
    if (portfolioData.audioUrl) {
      appAudio.setStreamUrl(portfolioData.audioUrl);
    }
  }, [portfolioData.audioUrl]);

  // Fetch Supabase data immediately on mount for all devices
  useEffect(() => {
    let unsubscribe = () => {};

    if (isSupabaseConfigured) {
      fetchSupabasePortfolio().then((cloudData) => {
        if (cloudData) {
          setPortfolioData(cloudData);
          savePortfolioData(cloudData);
        } else {
          // If DB is empty, sync current local storage up to cloud DB
          saveSupabasePortfolio(portfolioData).catch((err) => {
            console.error("Failed to write first sync row to Supabase: ", err);
          });
        }
      });

      unsubscribe = subscribeToPortfolioChanges((newData) => {
        setPortfolioData(newData);
        savePortfolioData(newData);
      });
    }

    return () => {
      unsubscribe();
    };
  }, []);

  const handleUnlock = () => {
    setIsUnlocked(true);
  };

  const handleUpdateData = (newData: PortfolioData) => {
    setPortfolioData(newData);
    savePortfolioData(newData);
    if (isSupabaseConfigured) {
      saveSupabasePortfolio(newData).catch((err) => {
        console.error("Failed to save to Supabase: ", err);
      });
    }
    // Auto sync log state if map coordinates changed or links updated
    if (newData.location.address !== portfolioData.location.address) {
      setIsOwnerLoggedIn(true);
    }
  };

  const handleResetData = () => {
    const defaultData = resetPortfolioData();
    setPortfolioData(defaultData);
    if (isSupabaseConfigured) {
      saveSupabasePortfolio(defaultData).catch((err) => {
        console.error("Failed to reset database on Supabase: ", err);
      });
    }
  };


  const handleNavigate = (sectionId: string) => {
    setIsSidebarOpen(false);
    
    if (sectionId === 'profile-section') {
      setActiveSection('profile');
    } else if (sectionId === 'achievements-section') {
      setActiveSection('achievements');
    } else if (sectionId === 'gallery-section') {
      setActiveSection('gallery');
    } else if (sectionId === 'location-section') {
      setActiveSection('location');
    } else if (sectionId === 'terminal-section') {
      setActiveSection('terminal');
    } else if (sectionId === 'owner-cms-section') {
      setActiveSection('owner');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const iconComponents: { [key: string]: any } = {
    Instagram: Instagram,
    Tiktok: TiktokIcon,
    Github: Github,
    MessageSquare: MessageSquare,
    Linkedin: Linkedin
  };

  // If not unlocked yet, render the full-screen simulated fingerprint scanner
  if (!isUnlocked) {
    return (
      <FingerprintScanner 
        name={portfolioData.profile.name} 
        role={portfolioData.profile.role} 
        onUnlock={handleUnlock} 
      />
    );
  }

  return (
    <div className="min-h-screen mesh-gradient text-slate-800 font-sans selection:bg-slate-900 selection:text-white overflow-x-hidden relative">
      {/* Background Mesh Gradient (Monochrome overlays) */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-150 blur-[120px] rounded-full"></div>
      </div>

      {/* FIXED HEADER NAVBAR */}
      <header className="sticky top-0 z-45 border-b border-slate-200/55 backdrop-blur-md bg-white/65 px-6 py-5 flex items-center justify-between text-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 border border-slate-200/80 flex items-center justify-center font-mono font-black text-sm tracking-widest bg-slate-905 text-white rounded-lg shadow-sm">
            AA
          </div>
          <div>
            <h1 className="text-sm font-black tracking-[0.2em] uppercase text-slate-950 font-sans">
              {portfolioData.profile.name}
            </h1>
            <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest">{portfolioData.profile.role}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Audio stream track visualizer feedback */}
          <div className="hidden lg:flex items-end gap-1 h-4 mr-4">
            <div className="w-0.5 h-3 bg-slate-700/80 animate-pulse"></div>
            <div className="w-0.5 h-4 bg-slate-700/60"></div>
            <div className="w-0.5 h-2 bg-slate-700/95 animate-pulse"></div>
            <div className="w-0.5 h-5 bg-slate-800"></div>
            <span className="ml-2 text-[9px] uppercase tracking-widest text-slate-600/80">Audio active</span>
          </div>

          <div className="hidden md:flex items-center gap-3 px-4 py-1.5 border border-slate-200/60 rounded-full bg-slate-100/80 text-[10px] font-mono font-bold select-none text-slate-700">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-800 animate-pulse" />
            AUTHORIZED: TKJ_STUDENT
          </div>

          {/* Core Hamburger Activation button */}
          <button
            id="hamburger-menu"
            onClick={() => setIsSidebarOpen(true)}
            className="p-2.5 bg-white border border-slate-200/80 hover:bg-slate-50 hover:border-slate-350 rounded-lg transition-all text-slate-800 shadow-xs focus:outline-none flex items-center gap-2 cursor-pointer text-xs"
          >
            <Menu className="w-4 h-4" />
            <span className="hidden sm:inline font-mono text-[9px] tracking-[0.2em] font-bold">DASHBOARD</span>
          </button>
        </div>
      </header>

      {/* DASHBOARD MODAL DRAWER OVERLAY */}
      <SidebarMenu
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onNavigate={handleNavigate}
        onOpenOwner={() => {
          setActiveSection('owner');
          setIsSidebarOpen(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isOwnerLoggedIn={isOwnerLoggedIn}
      />

      {/* MAIN LAYOUT WRAPPER */}
      <main className="max-w-7xl mx-auto px-6 py-10 md:py-16 space-y-10 md:space-y-14 z-10 relative">
        
        {/* IN-PAGE DASHBOARD HUB COCKPIT NAVIGATION */}
        <div className="bg-white/95 border border-slate-205/85 rounded-2xl p-3 shadow-md backdrop-blur-xl flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 px-2">
            <LayoutDashboard className="w-5 h-5 text-slate-800 animate-pulse" />
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-widest text-slate-500 block leading-tight">SYSTEM CONTROL</span>
              <p className="text-[8px] font-mono text-slate-400 uppercase font-bold tracking-widest">Aplikasi Berbasis Dashboard</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 justify-center lg:justify-end">
            <button
              onClick={() => handleNavigate('profile-section')}
              className={`px-4 py-2.5 rounded-xl border text-[10px] font-sans font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'profile'
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md font-black'
                  : 'bg-slate-50 border-slate-150 text-slate-500 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <User className="w-3.5 h-3.5 text-indigo-400" />
              PROFIL SAYA
            </button>

            <button
              id="dash-btn-achievements"
              onClick={() => handleNavigate('achievements-section')}
              className={`px-4 py-2.5 rounded-xl border text-[10px] font-sans font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'achievements'
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md font-black'
                  : 'bg-slate-50 border-slate-150 text-slate-500 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              PENCAPAIAN
            </button>

            <button
              id="dash-btn-gallery"
              onClick={() => handleNavigate('gallery-section')}
              className={`px-4 py-2.5 rounded-xl border text-[10px] font-sans font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'gallery'
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md font-black'
                  : 'bg-slate-50 border-slate-150 text-slate-500 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
              GALERI KEGIATAN
            </button>

            <button
              onClick={() => handleNavigate('location-section')}
              className={`px-4 py-2.5 rounded-xl border text-[10px] font-sans font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'location'
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md font-black'
                  : 'bg-slate-50 border-slate-150 text-slate-500 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              LOKASI MAPS
            </button>

            <button
              onClick={() => handleNavigate('terminal-section')}
              className={`px-4 py-2.5 rounded-xl border text-[10px] font-sans font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'terminal'
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md font-black'
                  : 'bg-slate-50 border-slate-150 text-slate-500 hover:text-slate-800 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-violet-400" />
              DIAGNOSA TKJ
            </button>

            <button
              onClick={() => handleNavigate('owner-cms-section')}
              className={`px-4 py-2.5 rounded-xl border text-[10px] font-sans font-extrabold uppercase tracking-widest transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSection === 'owner'
                  ? 'bg-emerald-600 border-emerald-600 text-white shadow-md font-black'
                  : isOwnerLoggedIn
                    ? 'bg-emerald-50 border-emerald-250 text-emerald-800 hover:bg-emerald-100 font-black'
                    : 'bg-slate-50 border-slate-150 text-slate-500 hover:text-slate-850 hover:bg-slate-100 hover:border-slate-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              {isOwnerLoggedIn ? "ADMIN PANEL (AKTIF)" : "PANEL ADMIN"}
            </button>
          </div>
        </div>

        {/* SECTION 1: PROFIL HERO UTAMA */}
        {activeSection === 'profile' && (
          <motion.section 
            id="profile-section" 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start text-slate-800"
          >
            
            {/* Avatar Profile Left Box */}
            <div className="lg:col-span-4 flex flex-col items-center p-8 bg-white/80 border border-slate-200/60 rounded-2xl backdrop-blur-xl relative shadow-xl">
              <div className="absolute top-3 left-4 text-[9px] font-mono text-slate-400 font-bold">NODE: PROFILE_01</div>
              <div className="absolute top-3 right-4 text-[9px] font-mono text-slate-400 font-bold">STATUS: STABLE</div>

              {/* Profile Avatar Image with dual borders */}
              <div className="aspect-square w-full rounded-2xl overflow-hidden border-4 border-white bg-slate-100 shadow-lg relative mt-4 mb-6 group/avatar">
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10"></div>
                <img
                  src={portfolioData.profile.avatar}
                  alt="Ariel Arillio"
                  className="w-full h-full object-cover filter grayscale contrast-115 group-hover/avatar:grayscale-0 group-hover/avatar:contrast-100 transition-all duration-700 font-bold"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
                  <h3 className="text-xl font-black uppercase tracking-tight text-white">{portfolioData.profile.name}</h3>
                  <p className="text-[10px] text-white/80 tracking-widest uppercase mt-0.5">{portfolioData.profile.school}</p>
                </div>

                {/* DIRECT OWNER/ADMIN PHOTO CHANGER OVERLAY BUTTON */}
                {isOwnerLoggedIn && (
                  <div className="absolute top-3 right-3 z-30">
                    <label className="flex items-center gap-1.5 bg-slate-950/95 hover:bg-slate-900 border border-slate-700 text-white rounded-xl px-3 py-2 text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xl select-none">
                      <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Ganti Foto</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 2 * 1024 * 1024) {
                              alert("Ukuran berkas terlalu besar! Maksimal 2MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                const updated = { ...portfolioData.profile, avatar: reader.result };
                                handleUpdateData({
                                  ...portfolioData,
                                  profile: updated
                                });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="text-center w-full">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200/60 rounded-full text-[10px] font-mono text-slate-655">
                  <Network className="w-3.5 h-3.5 text-slate-500" />
                  DITELUSURI: 192.168.100.45
                </div>
              </div>

              {/* Telemetry diagnostics information */}
              <div className="w-full border-t border-slate-150 mt-6 pt-5 space-y-2.5 text-[10px] font-mono text-slate-500">
                <div className="flex justify-between">
                  <span>SEKTOR AKADEMIK:</span>
                  <span className="text-slate-850 font-bold">UNGGUL (95/100)</span>
                </div>
                <div className="flex justify-between">
                  <span>WAWASAN KEBANGSAAN:</span>
                  <span className="text-slate-850 font-bold">LCC 4 PILAR DELEGASI</span>
                </div>
                <div className="flex justify-between">
                  <span>KOMPETENSI JURUSAN:</span>
                  <span className="text-slate-850 font-bold">NETWORKING & EXCEL ADV</span>
                </div>
              </div>
            </div>

            {/* About Me Details Right Box */}
            <div className="lg:col-span-8 space-y-8 flex flex-col justify-between h-full bg-transparent">
              <div className="p-8 rounded-2xl bg-white/70 border border-slate-200/60 backdrop-blur-xl space-y-4 shadow-md text-slate-800">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200/50 rounded-full text-[10px] text-slate-500 font-mono tracking-widest uppercase font-bold">
                  <Info className="w-3.5 h-3.5 text-slate-600" />
                  RINGKASAN TEKNIS SAYA
                </div>
                <h3 className="text-2xl font-black tracking-widest uppercase font-sans text-slate-905">
                  TENTANG SAYA
                </h3>
                <p className="text-sm font-sans text-slate-650 leading-relaxed text-justify font-semibold">
                  {portfolioData.profile.about}
                </p>
              </div>

              {/* HIGH END THEME ACCENT HIGHLIGHT CARDS ROW / SHORT LINKS TO SECTIONS */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <button
                  onClick={() => handleNavigate('achievements-section')}
                  className="bg-white hover:bg-slate-50/80 text-left text-slate-905 p-6 rounded-2xl flex flex-col justify-between h-36 border border-slate-200/80 shadow-md transition-all group/b1 hover:border-slate-350 cursor-pointer"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">LIHAT PRESTASI</span>
                    <Award className="w-4 h-4 text-amber-500 group-hover/b1:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-xl font-black italic tracking-tighter uppercase leading-none text-slate-900">MATH & LOGIC</h4>
                </button>

                <button
                  onClick={() => handleNavigate('gallery-section')}
                  className="bg-slate-100 hover:bg-slate-150/60 text-left border border-slate-200/80 p-6 rounded-2xl flex flex-col justify-between h-36 shadow-sm transition-all group/b2 hover:border-slate-300 cursor-pointer"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">DOKUMENTASI KELAS</span>
                    <ImageIcon className="w-4 h-4 text-blue-500 group-hover/b2:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-xl font-black tracking-tighter uppercase leading-none text-slate-900">GALERI PRAKTIKUM</h4>
                </button>

                <button
                  onClick={() => handleNavigate('location-section')}
                  className="bg-white/90 hover:bg-white text-left border border-slate-200 backdrop-blur-md p-6 rounded-2xl flex flex-col justify-between h-36 shadow-md transition-all group/b3 hover:border-slate-350 cursor-pointer"
                >
                  <div className="flex justify-between items-center w-full">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono">MAPS & LOKASI</span>
                    <MapPin className="w-4 h-4 text-emerald-500 group-hover/b3:scale-110 transition-transform" />
                  </div>
                  <h4 className="text-xl font-black tracking-tighter uppercase leading-none text-slate-900">TEMPAT TINGGAL</h4>
                </button>
              </div>

              {/* SYSTEM PROFESSIONAL SKILLS RADAR BAR */}
              <div className="p-8 rounded-2xl bg-white/75 border border-slate-200/85 backdrop-blur-md space-y-6 shadow-md text-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200/60 pb-4 gap-3">
                  <span className="text-[11px] font-bold tracking-widest uppercase text-slate-600 font-sans">
                    SPESIFIKASI KEAHLIAN / KOMPETENSI
                  </span>

                  {/* Categories Filter tab */}
                  <div className="flex flex-wrap gap-2 text-[10px] font-mono">
                    {(['all', 'networking', 'admin', 'general'] as const).map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSkillFilter(cat)}
                        className={`px-3 py-1 rounded-full border transition-all cursor-pointer uppercase ${
                          skillFilter === cat
                            ? 'bg-slate-900 text-white border-slate-900 font-extrabold'
                            : 'bg-slate-100/80 border-slate-200/80 text-slate-605 hover:text-slate-900 hover:border-slate-350'
                        }`}
                      >
                        {cat === 'all' ? 'Tampilkan Semua' : cat === 'admin' ? 'Digital Admin' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Grid meter bars */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {portfolioData.profile.skills
                    .filter((sk) => skillFilter === 'all' || sk.category === skillFilter)
                    .map((sk) => (
                      <div key={sk.name} className="space-y-2">
                        <div className="flex items-center justify-between text-xs font-sans">
                          <span className="text-slate-800 font-semibold">{sk.name}</span>
                          <span className="font-mono text-slate-500">{sk.level}%</span>
                        </div>
                        <div className="h-2 bg-slate-100 border border-slate-200/40 p-0.5 rounded-full">
                          <div 
                            className="h-full bg-slate-800 rounded-full transition-all duration-1000"
                            style={{ width: `${sk.level}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* SECTION 2: GALERI PENCAPAIAN / PRESTASI */}
        {activeSection === 'achievements' && (
          <motion.section 
            id="achievements-section" 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-8 bg-white/70 border border-slate-200/80 rounded-2xl p-8 backdrop-blur-xl shadow-md text-slate-800"
          >
            <div className="border-b border-slate-200/60 pb-5">
              <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase font-bold">HONORS & AWARDS REPORT</span>
              <h3 className="text-xl font-black tracking-widest text-slate-905 uppercase font-sans mt-1">
                Galeri Pencapaian Prestasi
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {portfolioData.achievements.map((item) => (
                <div key={item.id} className="bg-white border border-slate-150 rounded-xl flex flex-col justify-between group relative overflow-hidden transition-all duration-350 hover:border-slate-300 hover:bg-slate-50/50 shadow-sm hover:shadow-lg">
                  {/* Image panel */}
                  <div className="h-44 bg-slate-100 overflow-hidden relative border-b border-slate-150 flex items-center justify-center bg-slate-950">
                    {item.image?.startsWith('data:video') || item.image?.toLowerCase().endsWith('.mp4') || item.image?.toLowerCase().endsWith('.webm') ? (
                      <video
                        src={item.image}
                        className="w-full h-full object-cover filter grayscale group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500 bg-black"
                        muted
                        playsInline
                        controls
                      />
                    ) : (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover filter grayscale group-hover:scale-105 group-hover:grayscale-0 transition-all duration-500"
                        referrerPolicy="no-referrer"
                      />
                    )}
                    <div className="absolute top-3 left-3 px-2.5 py-1 bg-slate-900/85 text-[9px] font-mono text-white rounded-md backdrop-blur-xs leading-none z-10">
                      {item.date}
                    </div>
                  </div>

                  {/* Details info */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <span className="text-[9px] font-mono text-slate-400 font-bold uppercase tracking-widest">Kategori: {item.category}</span>
                      <h4 className="text-sm font-black text-slate-905 uppercase font-sans group-hover:text-indigo-600 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium line-clamp-3">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* SECTION 3: PHOTO GALLERY */}
        {activeSection === 'gallery' && (
          <motion.section 
            id="gallery-section" 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-8 bg-white/70 border border-slate-200/80 rounded-2xl p-8 backdrop-blur-xl shadow-md text-slate-800"
          >
            <div className="border-b border-slate-200/60 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase font-bold">LABORATORY DOCUMENTATION</span>
                <h3 className="text-xl font-black tracking-widest text-slate-905 uppercase font-sans mt-1">
                  Galeri
                </h3>
              </div>
              
              {/* Quick counters */}
              <div className="text-[10px] font-mono text-slate-600 bg-slate-100 border border-slate-200/60 px-3 py-1 rounded-full animate-pulse">
                TOTAL ITEMS: <span className="text-slate-900 font-extrabold">{portfolioData.gallery.length} MEDIA</span>
              </div>
            </div>

            {/* Photo grids */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {portfolioData.gallery.map((photo) => {
                const isVideo = photo.image?.startsWith('data:video') || photo.image?.toLowerCase().endsWith('.mp4') || photo.image?.toLowerCase().endsWith('.webm');
                return (
                  <div 
                    key={photo.id}
                    onClick={() => setActivePhoto(photo.image)}
                    className="group cursor-pointer bg-slate-100 border border-slate-200/80 hover:border-slate-400 rounded-xl overflow-hidden relative shadow-md"
                  >
                    <div className="h-56 overflow-hidden relative flex items-center justify-center bg-slate-950">
                      {isVideo ? (
                        <video
                          src={photo.image}
                          className="w-full h-full object-cover filter grayscale group-hover:scale-103 group-hover:grayscale-0 transition-all duration-355 bg-black"
                          muted
                          playsInline
                        />
                      ) : (
                        <img
                          src={photo.image}
                          alt={photo.title}
                          className="w-full h-full object-cover filter grayscale group-hover:scale-103 group-hover:grayscale-0 transition-all duration-355"
                          referrerPolicy="no-referrer"
                        />
                      )}
                      {/* Photo label floating metadata */}
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <span className="text-[9px] font-mono text-zinc-300 tracking-widest mb-1">{photo.category.toUpperCase()} // {photo.date} {isVideo ? '[VIDEO]' : ''}</span>
                        <h4 className="text-xs font-black text-white uppercase font-sans">{photo.title}</h4>
                        <p className="text-[10px] text-zinc-200 leading-normal line-clamp-2 mt-1">{photo.description}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Photo lightbox zoom modal */}
            {activePhoto && (
              <div 
                onClick={() => setActivePhoto(null)}
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-fade-in"
              >
                <div className="max-w-4xl max-h-[85vh] relative border border-white/10 rounded-2xl p-2 bg-neutral-950 shadow-2xl flex flex-col items-center">
                  {activePhoto.startsWith('data:video') || activePhoto.toLowerCase().endsWith('.mp4') || activePhoto.toLowerCase().endsWith('.webm') ? (
                    <video 
                      src={activePhoto} 
                      controls
                      autoPlay
                      className="max-w-full max-h-[80vh] object-contain rounded-xl"
                    />
                  ) : (
                    <img 
                      src={activePhoto} 
                      alt="Enlarged" 
                      className="max-w-full max-h-[80vh] object-contain rounded-xl filter grayscale hover:grayscale-0 transition-all"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <p className="text-[10px] text-center font-mono text-neutral-400 mt-3 select-none">
                    Klik di mana saja untuk menutup pratinjau zoom
                  </p>
                </div>
              </div>
            )}
          </motion.section>
        )}

        {/* SECTION 4: LOCATION AND HOME COORDINATES */}
        {activeSection === 'location' && (
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <LocationMap location={portfolioData.location} />
          </motion.div>
        )}

        {/* SECTION 5: TKJ SPECIAL NETWORK DIAGNOSTIC SHELL TERMINAL */}
        {activeSection === 'terminal' && (
          <motion.section 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="border-b border-slate-200/60 pb-4">
              <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase font-bold">TKJ PROTOCOL INTERACTIVE TEST</span>
              <h3 className="text-xl font-black tracking-widest text-slate-905 uppercase font-sans mt-1">
                Terminal Diagnosa Jaringan (Simulasi)
              </h3>
            </div>
            <NetworkTerminal />
          </motion.section>
        )}

        {/* OWNER CMS MANAGEMENT CENTER */}
        {activeSection === 'owner' && (
          <motion.section 
            id="owner-cms-section" 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="space-y-8 pt-8 border-t border-slate-200/60"
          >
            <div className="flex items-center gap-3 text-slate-800">
              <LayoutDashboard className="w-5 h-5 text-slate-600" />
              <h3 className="text-lg font-black tracking-widest text-slate-905 uppercase font-sans">
                Administrasi Pemilik Website
              </h3>
            </div>
            
            <OwnerDashboard
              data={portfolioData}
              onUpdate={handleUpdateData}
              onReset={handleResetData}
              onClose={() => handleNavigate('profile-section')}
              isOwnerLoggedIn={isOwnerLoggedIn}
              onAuthorizedChange={(isAuth) => setIsOwnerLoggedIn(isAuth)}
            />
          </motion.section>
        )}

        {/* CHAT / QUICK INQUIRY SOCIAL NETWORKS FOOTER */}
        <motion.section 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white/80 border border-slate-200/70 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative backdrop-blur-md shadow-md text-slate-800"
        >
          <div className="space-y-2 text-center md:text-left">
            <h4 className="text-sm font-black tracking-widest uppercase text-slate-905 font-sans">
              Terhubung Secara Profesional
            </h4>
            <p className="text-xs text-slate-500 font-sans max-w-sm font-medium">
              Gunakan jalur komunikasi di samping untuk menjalin kerja sama atau berdiskusi seputar networking dan digital administrasi.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {portfolioData.socials.map((soc) => {
              const IconComp = iconComponents[soc.icon] || MessageSquare;
              return (
                <a
                  key={soc.platform}
                  href={soc.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="px-4 py-2 bg-white border border-slate-200/80 hover:border-slate-400 rounded-xl text-slate-700 hover:text-slate-900 transition-all text-xs font-mono flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <IconComp className="w-4 h-4 text-slate-500" />
                  <span>{soc.username}</span>
                </a>
              );
            })}
          </div>
        </motion.section>
      </main>

      {/* CORE STANDARD FOOTER */}
      <footer className="border-t border-slate-200/60 bg-white/70 backdrop-blur-md mt-16 py-10 px-6 text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-[11px] font-mono text-slate-500 font-bold">
              © 2026 {portfolioData.profile.name}. All rights reserved.
            </p>
            <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
              REKAYASA JARINGAN & ADMINISTRASI DIGITAL // PORTAL VERIFIKASI v1.2
            </p>
          </div>

          {/* Quick scroll to top button */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="p-3 bg-white border border-slate-200/85 hover:border-slate-355 rounded-lg transition-all text-slate-600 hover:text-slate-900 flex items-center gap-1.5 focus:outline-none cursor-pointer shadow-xs"
            title="Kembali ke bagian atas"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold">SCROLL TOP</span>
          </button>
        </div>
      </footer>
    </div>
  );
}
