import React, { useState, useEffect } from 'react';
import { 
  Key, Lock, ShieldAlert, Check, Plus, Trash2, 
  RefreshCw, MapPin, Award, Image as ImageIcon, 
  Settings, LogOut, CheckCircle, Smartphone, Database, Terminal, Music
} from 'lucide-react';
import { PortfolioData, Achievement, GalleryItem, SocialLink } from '../types';
import { isSupabaseConfigured, supabase, saveSupabasePortfolio } from '../supabase/supabaseClient';

interface OwnerDashboardProps {
  data: PortfolioData;
  onUpdate: (newData: PortfolioData) => void;
  onReset: () => void;
  onClose: () => void;
  isOwnerLoggedIn?: boolean;
  onAuthorizedChange?: (isAuth: boolean) => void;
}

export default function OwnerDashboard({ 
  data, 
  onUpdate, 
  onReset, 
  onClose,
  isOwnerLoggedIn = false,
  onAuthorizedChange
}: OwnerDashboardProps) {
  const [password, setPassword] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(isOwnerLoggedIn);
  const [authError, setAuthError] = useState('');

  // Sync state with parent's login status
  useEffect(() => {
    setIsAuthorized(isOwnerLoggedIn);
  }, [isOwnerLoggedIn]);

  // Active sub-tab inside Authorized CMS
  const [activeTab, setActiveTab] = useState<'profile' | 'achievements' | 'gallery' | 'location' | 'socials' | 'audio'>('profile');

  // Form states
  const [newAch, setNewAch] = useState<Partial<Achievement>>({ title: '', category: '', date: '', description: '', image: '' });
  const [newGal, setNewGal] = useState<Partial<GalleryItem>>({ title: '', category: '', date: '', description: '', image: '' });
  const [editedLocation, setEditedLocation] = useState(data.location);
  const [editedSocials, setEditedSocials] = useState<SocialLink[]>(data.socials);
  const [editedProfile, setEditedProfile] = useState(data.profile);
  const [editedAudioUrl, setEditedAudioUrl] = useState(data.audioUrl || '');

  // Draft local states for Achievements and Gallery to fulfill "explicit click Save to Supabase" requirement
  const [localAchievements, setLocalAchievements] = useState<Achievement[]>(data.achievements);
  const [localGallery, setLocalGallery] = useState<GalleryItem[]>(data.gallery);
  const [isSaving, setIsSaving] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  const [supabaseStatus, setSupabaseStatus] = useState<{ status: 'idle' | 'checking' | 'active' | 'error'; message: string }>({ status: 'idle', message: '' });

  const checkSupabaseConnection = async () => {
    if (!isSupabaseConfigured) {
      setSupabaseStatus({ 
        status: 'error', 
        message: 'Variabel VITE_SUPABASE_URL atau VITE_SUPABASE_ANON_KEY belum terpasang atau masih bernilai default. Silakan periksa pengaturan lingkungan (.env / Secrets Vercel / Secrets AI Studio).' 
      });
      return;
    }
    setSupabaseStatus({ status: 'checking', message: 'Sedang menguji koneksi ke database Supabase...' });
    try {
      if (!supabase) {
        setSupabaseStatus({ status: 'error', message: 'Klien Supabase tidak berhasil diinisialisasi.' });
        return;
      }
      const { error: selectError } = await supabase
        .from('portfolio_data')
        .select('id')
        .limit(1);

      if (selectError) {
        const errMsg = selectError.message || '';
        const isTableMissing = errMsg.includes('does not exist') || selectError.code === '42P01';
        if (isTableMissing) {
          setSupabaseStatus({ 
            status: 'error', 
            message: `Tabel 'portfolio_data' belum dibuat di database Supabase Anda. Silakan salin dan jalankan script SQL di bawah di SQL Editor Supabase!` 
          });
        } else if (errMsg.includes('JWT') || errMsg.includes('key') || selectError.code === 'PGRST111') {
          setSupabaseStatus({
            status: 'error',
            message: `Kunci API (Anon Key) Supabase Anda tidak valid. Periksa konfigurasi VITE_SUPABASE_ANON_KEY di panel Secrets.`
          });
        } else {
          setSupabaseStatus({ 
            status: 'error', 
            message: `Terhubung, namun gagal membaca data. Kemungkinan RLS (Row Level Security) aktif tetapi Policy akses publik belum disetup. Jalankan Script SQL di bawah. Detail Error: ${errMsg}` 
          });
        }
        return;
      }

      setSupabaseStatus({ 
        status: 'active', 
        message: 'Koneksi Sukses! Tabel portfolio_data dideteksi & hak akses (RLS) terbuka. Setiap perubahan akan disimpan langsung ke database cloud dan tersinkronkan real-time di semua perangkat (termasuk HP lain).' 
      });
    } catch (err: any) {
      setSupabaseStatus({ 
        status: 'error', 
        message: `Gagal menghubungi endpoint Supabase. Masalah koneksi: ${err.message || err}` 
      });
    }
  };

  useEffect(() => {
    if (isSupabaseConfigured) {
      checkSupabaseConnection();
    } else {
      setSupabaseStatus({ 
        status: 'error', 
        message: 'Variabel lingkungan Supabase belum dikonfigurasi. Aplikasi berjalan secara offline.' 
      });
    }
  }, []);


  // Sync profile/location/social/audio states when master data changes (on reset or outside refresh)
  useEffect(() => {
    setEditedLocation(data.location);
    setEditedSocials(data.socials);
    setEditedProfile(data.profile);
    setEditedAudioUrl(data.audioUrl || '');
    setLocalAchievements(data.achievements);
    setLocalGallery(data.gallery);
  }, [data]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...data,
      profile: editedProfile
    });
    showToast('Profil utama berhasil diperbarui!');
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        showToast("Ukuran file terlalu besar! Maksimal 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const updated = { ...editedProfile, avatar: reader.result };
          setEditedProfile(updated);
          onUpdate({
            ...data,
            profile: updated
          });
          showToast("Foto profil berhasil diunggah!");
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '1604') {
      setIsAuthorized(true);
      onAuthorizedChange?.(true);
      setAuthError('');
      showToast('Koneksi Terotentikasi!');
    } else {
      setAuthError('Kunci PIN admin salah! Akses ditolak.');
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  // --- CRUD OPERATIONS ---
  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAch.title || !newAch.description) {
      showToast('Judul & Deskripsi harus diisi!');
      return;
    }

    const newItem: Achievement = {
      id: `ach-owner-${Date.now()}`,
      title: newAch.title,
      category: newAch.category || 'Akademik',
      date: newAch.date || 'Tahun Ini',
      description: newAch.description,
      image: newAch.image || 'https://picsum.photos/seed/achievement/800/600'
    };

    setLocalAchievements([newItem, ...localAchievements]);
    setNewAch({ title: '', category: '', date: '', description: '', image: '' });
    showToast('Ditambahkan ke draft! Klik tombol "SIMPAN PERUBAHAN" untuk menyimpan ke Supabase.');
  };

  const handleDeleteAchievement = (id: string) => {
    setLocalAchievements(localAchievements.filter(item => item.id !== id));
    showToast('Dihapus dari draft! Klik tombol "SIMPAN PERUBAHAN" untuk menyimpan ke Supabase.');
  };

  const handleSaveAchievements = async () => {
    setIsSaving(true);
    const updatedData = {
      ...data,
      achievements: localAchievements
    };

    try {
      if (!isSupabaseConfigured) {
        onUpdate(updatedData);
        showToast('✓ Berhasil menyimpan perubahan ke LocalStorage (Offline)!');
        return;
      }

      const success = await saveSupabasePortfolio(updatedData);
      if (success) {
        onUpdate(updatedData);
        showToast('✓ Berhasil menyimpan data Pencapaian ke Supabase!');
      } else {
        showToast('❌ Gagal menyimpan ke Supabase! Periksa status tabel.');
      }
    } catch (err: any) {
      showToast(`❌ Gagal menyimpan ke Supabase: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGallery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGal.title || !newGal.description) {
      showToast('Judul & Deskripsi harus diisi!');
      return;
    }

    const newItem: GalleryItem = {
      id: `gal-owner-${Date.now()}`,
      title: newGal.title,
      category: newGal.category || 'Dokumentasi',
      date: newGal.date || 'Baru Saja',
      description: newGal.description,
      image: newGal.image || 'https://picsum.photos/seed/lab/800/600'
    };

    setLocalGallery([newItem, ...localGallery]);
    setNewGal({ title: '', category: '', date: '', description: '', image: '' });
    showToast('Ditambahkan ke draft! Klik tombol "SIMPAN PERUBAHAN" untuk menyimpan ke Supabase.');
  };

  const handleDeleteGallery = (id: string) => {
    setLocalGallery(localGallery.filter(item => item.id !== id));
    showToast('Dihapus dari draft! Klik tombol "SIMPAN PERUBAHAN" untuk menyimpan ke Supabase.');
  };

  const handleSaveGallery = async () => {
    setIsSaving(true);
    const updatedData = {
      ...data,
      gallery: localGallery
    };

    try {
      if (!isSupabaseConfigured) {
        onUpdate(updatedData);
        showToast('✓ Berhasil menyimpan perubahan ke LocalStorage (Offline)!');
        return;
      }

      const success = await saveSupabasePortfolio(updatedData);
      if (success) {
        onUpdate(updatedData);
        showToast('✓ Berhasil menyimpan data Galeri ke Supabase!');
      } else {
        showToast('❌ Gagal menyimpan ke Supabase! Periksa status tabel.');
      }
    } catch (err: any) {
      showToast(`❌ Gagal menyimpan ke Supabase: ${err.message || err}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...data,
      location: {
        ...editedLocation,
        googleMapsUrl: `https://maps.google.com/?q=${editedLocation.latitude},${editedLocation.longitude}`
      }
    });
    showToast('Titik koordinat rumah diskalakan ulang!');
  };

  const handleSaveSocial = (e: React.FormEvent, index: number, field: keyof SocialLink, value: string) => {
    const updated = [...editedSocials];
    updated[index] = { ...updated[index], [field]: value };
    setEditedSocials(updated);
    
    // Update parent
    onUpdate({
      ...data,
      socials: updated
    });
  };

  const handleSaveAudioUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate({
      ...data,
      audioUrl: editedAudioUrl
    });
    showToast('Lagu latar belakang berhasil diperbarui!');
  };

  const triggerReset = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang data portofolio ke bawaan pabrik?')) {
      onReset();
      setEditedLocation(data.location);
      setEditedSocials(data.socials);
      setEditedAudioUrl(data.audioUrl || '');
      showToast('Sistem disetel ulang ke standarnya!');
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    onAuthorizedChange?.(false);
    setPassword('');
  };

  return (
    <div className="bg-white/90 border border-slate-205/85 rounded-2xl p-6 md:p-8 relative backdrop-blur-xl shadow-xl text-slate-800 font-sans">
      {/* Visual Corner Markers */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-slate-400"></div>
      <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-slate-400"></div>
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-slate-400"></div>
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-slate-400"></div>

      {toastMessage && (
        <div className="fixed top-4 right-4 bg-slate-900 text-white font-sans font-bold text-xs px-4 py-2.5 shadow-2xl rounded-xl z-50 flex items-center gap-2 animate-bounce">
          <CheckCircle className="w-4 h-4 text-green-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Screen 1: Lock Access Authorization Form */}
      {!isAuthorized ? (
        <div className="max-w-md mx-auto py-10 flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Lock className="w-6 h-6 text-indigo-650" />
          </div>
          <h2 className="text-lg font-black tracking-widest text-center uppercase text-slate-900 mb-2 font-sans">
            Dashboard Pemilik Website
          </h2>
          <p className="text-xs text-slate-500 font-sans text-center mb-6 max-w-xs leading-relaxed font-semibold">
            Sektor administrasi terkunci. Masukkan sandi otorisasi pemilik untuk mengubah data portofolio.
          </p>

          <form onSubmit={handleLogin} className="w-full space-y-4">
            <div className="relative">
              <Key className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan PIN Otorisasi Admin"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 font-mono text-xs outline-none focus:border-slate-400 focus:bg-white rounded-xl transition-all text-center placeholder-slate-400 font-black"
              />
            </div>
            {authError && (
              <p className="text-[11px] font-mono text-rose-500 text-center font-bold">{authError}</p>
            )}

            <div className="bg-slate-50 p-4 border border-dashed border-slate-200 text-slate-600 text-center rounded-xl">
              <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold tracking-widest mb-1">OTENTIKASI KEAMANAN</span>
              <p className="text-xs text-slate-500 font-sans leading-relaxed font-semibold">
                Sektor ini dilindungi enkripsi. Harap hubungi pemilik situs jika Anda memerlukan akses otorisasi admin resmi.
              </p>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/2 py-3 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-xl text-xs font-sans font-bold tracking-widest uppercase transition-all cursor-pointer"
              >
                Kembali
              </button>
              <button
                type="submit"
                className="w-1/2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-sans font-bold tracking-widest uppercase transition-all cursor-pointer"
              >
                Otorisasi
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* Screen 2: Authorized Portal Area */
        <div className="space-y-8 font-sans">
          {/* Dashboard Portal Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-200/80 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping"></span>
                <span className="text-[10px] font-mono text-slate-500 tracking-wider font-extrabold">SECURE OWNER SESSION // ROOT_ACTIVE</span>
              </div>
              <h2 className="text-xl font-black tracking-widest uppercase text-slate-900 mt-1">
                PORTAL MANAJEMEN PORTOFOLIO
              </h2>
            </div>

            {/* Logout and Quick Hard Reset Settings */}
            <div className="flex items-center gap-3">
              <button
                onClick={triggerReset}
                className="px-3.5 py-2 border border-slate-200 text-[11px] text-slate-650 hover:text-slate-900 hover:border-slate-350 flex items-center gap-2 font-mono font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                title="Kembalikan semua custom data ke statis default"
              >
                <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
                RESET DATA
              </button>
              <button
                onClick={handleLogout}
                className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[11px] flex items-center gap-2 font-mono font-bold rounded-xl transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-300" />
                KELUAR
              </button>
            </div>
          </div>

          {/* SUPABASE CLOUD DATABASE CONNECTION STATE WITH INTERACTIVE GUIDES */}
          <div className="bg-white/80 border border-slate-200/65 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
              <div className="flex items-start gap-3 w-full">
                <div className={`p-2.5 rounded-xl border flex-shrink-0 ${
                  supabaseStatus.status === 'active' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-200' 
                    : supabaseStatus.status === 'checking'
                    ? 'bg-indigo-50 text-indigo-650 border-indigo-200 animate-pulse'
                    : 'bg-rose-50 text-rose-600 border-rose-200'
                }`}>
                  <Database className="w-5 h-5" />
                </div>
                <div className="space-y-2 w-full">
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-black tracking-widest text-slate-900 uppercase font-sans">
                      Sinkronisasi Database Cloud (Supabase Real-time)
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-mono font-black uppercase tracking-wider ${
                      supabaseStatus.status === 'active' 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : supabaseStatus.status === 'checking'
                        ? 'bg-indigo-100 text-indigo-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {supabaseStatus.status === 'active' ? 'AKTIF' : supabaseStatus.status === 'checking' ? 'MENGUJI' : 'TERPUTUS / LOKAL'}
                    </span>
                  </div>

                  {/* LIVE DIAGNOSTIC BOX */}
                  <p className={`text-xs p-3 rounded-xl border leading-relaxed font-sans ${
                    supabaseStatus.status === 'active'
                      ? 'bg-emerald-50/40 border-emerald-200 text-slate-700'
                      : supabaseStatus.status === 'checking'
                      ? 'bg-indigo-50/40 border-indigo-200 text-slate-700'
                      : 'bg-rose-50/40 border-rose-200 text-rose-950 font-medium'
                  }`}>
                    {supabaseStatus.message || (isSupabaseConfigured 
                      ? '✓ Terhubung ke Supabase. Setiap perubahan data pada profil, pencapaian, galeri, lokasi, dan link sosial disinkronkan secara real-time ke semua browser aktif.'
                      : '⚠ Menggunakan LocalStorage internal. Agar data tersimpan permanen di cloud dan online real-time, konfigurasikan VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY di Secrets panel AI Studio.')}
                  </p>

                  {/* VERCEL/HOSTING WARNING BOX */}
                  <div className="bg-amber-50/50 border border-amber-150 p-4 rounded-xl space-y-2 text-xs">
                    <div className="flex items-center gap-1.5 text-amber-800 font-bold uppercase font-mono text-[10px]">
                      <ShieldAlert className="w-4 h-4 text-amber-600 animate-pulse" />
                      PENTING UNTUK VERCEL HOSTING (SITUS: porto-ariel-tkj.vercel.app):
                    </div>
                    <p className="text-slate-650 font-sans leading-relaxed text-[11px]">
                      Karena Anda meng-host web ini di <strong>Vercel</strong>, setiap perubahan hanya akan tersimpan ke database di HP lain jika Anda sudah mengisi variabel berikut di dashboard Vercel Anda:
                    </p>
                    <div className="bg-amber-150/40 p-2 rounded-lg space-y-1 font-mono text-[10px] text-amber-900 border border-amber-200">
                      <div>• <strong className="text-amber-950">VITE_SUPABASE_URL</strong> = [Masukkan URL project Supabase Anda]</div>
                      <div>• <strong className="text-amber-950">VITE_SUPABASE_ANON_KEY</strong> = [Masukkan Anon Key Supabase Anda]</div>
                    </div>
                    <p className="text-slate-605 font-sans leading-relaxed text-[11px]">
                      Caranya: Buka <strong>Vercel Dashboard &gt; Pilih Project Anda &gt; Settings &gt; Environment Variables</strong>, tambah kedua variabel di atas dengan nilai yang benar, kemudian <strong>Redeploy</strong> proyek Anda.
                    </p>
                    <p className="text-indigo-900 font-sans font-semibold leading-normal text-[11px]">
                      * Tanpa langkah ini, web di Vercel hanya menggunakan memori internal HP Anda sendiri sehingga HP lain tidak akan bisa melihat perubahannya!
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex-shrink-0 flex sm:flex-col md:flex-row gap-2 mt-2 md:mt-0">
                <button
                  type="button"
                  onClick={checkSupabaseConnection}
                  className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-mono font-bold uppercase transition-all rounded-xl cursor-pointer flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${supabaseStatus.status === 'checking' ? 'animate-spin' : ''}`} />
                  Uji Koneksi
                </button>
                <button
                  type="button"
                  onClick={() => setShowSqlGuide(!showSqlGuide)}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-mono font-bold uppercase transition-all rounded-xl cursor-pointer flex items-center justify-center gap-1"
                >
                  {showSqlGuide ? 'TUTUP' : 'PANDUAN'}
                </button>
              </div>
            </div>

            {/* EXPANDABLE INLINE SQL GUIDE */}
            {showSqlGuide && (
              <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 space-y-3 animate-fade-in">
                <div className="flex items-center gap-2 text-slate-800 border-b border-slate-200/60 pb-2">
                  <Terminal className="w-4 h-4 text-slate-500" />
                  <span className="text-xs font-bold tracking-widest uppercase font-mono">Setup Supabase SQL Editor Guide</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Langkah-langkah untuk menyiapkan fungsionalitas real-time cloud:
                </p>
                <ol className="list-decimal list-inside text-[11px] text-slate-500 space-y-1 font-sans">
                  <li>Buat proyek baru di <a href="https://supabase.com" target="_blank" rel="noreferrer" className="text-indigo-600 font-bold hover:underline">Supabase</a>.</li>
                  <li>Pergi ke menu <span className="font-bold text-slate-700">SQL Editor</span> di menu sidebar kiri Supabase dashboard.</li>
                  <li>Klik <span className="font-bold text-slate-700">New Query</span>, lalu paste-kan SQL Code di bawah ini.</li>
                  <li>Klik tombol <span className="font-bold text-slate-700">Run</span> di pojok kanan bawah.</li>
                  <li>Salin url proyek (Project URL) dan API Key anonim Anda, lalu isi variabel di secrets AI Studio panel: <code className="bg-slate-200 px-1 py-0.5 rounded font-bold">VITE_SUPABASE_URL</code> dan <code className="bg-slate-200 px-1 py-0.5 rounded font-bold">VITE_SUPABASE_ANON_KEY</code>.</li>
                </ol>

                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-mono font-extrabold text-slate-400 block uppercase">SQL SCRIPT (Salin Semua):</span>
                  <pre className="p-3 bg-slate-900 text-zinc-300 rounded-lg text-[10px] font-mono overflow-x-auto max-h-56 border border-slate-950 shadow-inner whitespace-pre select-all font-mono">
{`CREATE TABLE IF NOT EXISTS public.portfolio_data (
    id TEXT PRIMARY KEY DEFAULT 'ariel_portfolio',
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.portfolio_data ENABLE ROW LEVEL SECURITY;

-- Drop policy lama jika sudah ada untuk menghindari error 42710 (policy already exists)
DROP POLICY IF EXISTS "Allow public read access" ON public.portfolio_data;
CREATE POLICY "Allow public read access" ON public.portfolio_data FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public write or update access" ON public.portfolio_data;
CREATE POLICY "Allow public write or update access" ON public.portfolio_data FOR ALL USING (true) WITH CHECK (true);

-- Tambahkan ke Realtime (Abaikan jika memberi info "already exists")
ALTER PUBLICATION supabase_realtime ADD TABLE public.portfolio_data;`}
                  </pre>
                  <p className="text-[9px] font-mono text-indigo-650 font-bold mt-1 uppercase text-center">
                    * Berkas SQL lengkap juga tersimpan di /supabase/schema.sql
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Tab Categories Switchers */}
          <div className="flex flex-wrap border-b border-slate-200/80">
            <button
              onClick={() => setActiveTab('profile')}
              className={`px-4 py-3 text-xs tracking-widest uppercase transition-all font-bold border-b-2 flex items-center gap-2 focus:outline-none cursor-pointer ${
                activeTab === 'profile' 
                  ? 'border-indigo-600 text-indigo-650 font-black' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Settings className="w-4 h-4" />
              PROFIL UTAMA
            </button>
            <button
              onClick={() => setActiveTab('achievements')}
              className={`px-4 py-3 text-xs tracking-widest uppercase transition-all font-bold border-b-2 flex items-center gap-2 focus:outline-none cursor-pointer ${
                activeTab === 'achievements' 
                  ? 'border-indigo-600 text-indigo-650 font-black' 
                  : 'border-transparent text-slate-400 hover:text-slate-705'
              }`}
            >
              <Award className="w-4 h-4" />
              PENCAPAIAN ({data.achievements.length})
            </button>
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-3 text-xs tracking-widest uppercase transition-all font-bold border-b-2 flex items-center gap-2 focus:outline-none cursor-pointer ${
                activeTab === 'gallery' 
                  ? 'border-indigo-600 text-indigo-650 font-black' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <ImageIcon className="w-4 h-4" />
              GALERI ({data.gallery.length})
            </button>
            <button
              onClick={() => setActiveTab('location')}
              className={`px-4 py-3 text-xs tracking-widest uppercase transition-all font-bold border-b-2 flex items-center gap-2 focus:outline-none cursor-pointer ${
                activeTab === 'location' 
                  ? 'border-indigo-600 text-indigo-650 font-black' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <MapPin className="w-4 h-4" />
              LOKASI TINGGAL
            </button>
            <button
              onClick={() => setActiveTab('socials')}
              className={`px-4 py-3 text-xs tracking-widest uppercase transition-all font-bold border-b-2 flex items-center gap-2 focus:outline-none cursor-pointer ${
                activeTab === 'socials' 
                  ? 'border-indigo-600 text-indigo-650 font-black' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Smartphone className="w-4 h-4" />
              MEDIA SOSIAL
            </button>
            <button
              onClick={() => setActiveTab('audio')}
              className={`px-4 py-3 text-xs tracking-widest uppercase transition-all font-bold border-b-2 flex items-center gap-2 focus:outline-none cursor-pointer ${
                activeTab === 'audio' 
                  ? 'border-indigo-600 text-indigo-650 font-black' 
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <Music className="w-4 h-4" />
              MUSIK LATAR
            </button>
          </div>

          {/* --- TAB CONTENT 0: PROFILE CONFIG --- */}
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="max-w-2xl space-y-5 pt-4">
              <h3 className="text-xs font-black tracking-widest text-slate-800 uppercase mb-4 flex items-center gap-2">
                <Settings className="w-4 h-4 text-indigo-650" />
                KONFIGURASI PROFIL UTAMA & FOTO PROFIL
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Nama Lengkap</label>
                  <input
                    type="text"
                    required
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Sekolah / Instansi / Jurusan</label>
                  <input
                    type="text"
                    required
                    value={editedProfile.role}
                    onChange={(e) => setEditedProfile({ ...editedProfile, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Foto Profil (Ganti / Edit Gambarnya)</label>
                <div className="flex flex-col sm:flex-row items-center gap-4 mt-2">
                  <div className="w-16 h-16 rounded-xl border border-slate-200 overflow-hidden bg-slate-50 flex-shrink-0">
                    <img 
                      src={editedProfile.avatar} 
                      alt="Pratinjau Avatar" 
                      className="w-full h-full object-cover filter grayscale"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    {/* Method 1: File Uploader */}
                    <div className="flex items-center gap-3">
                      <label className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold tracking-widest uppercase transition-all cursor-pointer select-none">
                        UNGGAH FOTO BARU
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFileChange}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[11px] font-mono text-slate-400">Atau paste URL gambar eksternal di bawah:</span>
                    </div>
                    {/* Method 2: Manual URL */}
                    <input
                      type="text"
                      value={editedProfile.avatar}
                      onChange={(e) => setEditedProfile({ ...editedProfile, avatar: e.target.value })}
                      placeholder="https://example.com/foto.jpg"
                      className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200/80 text-slate-600 text-xs outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Ringkasan Tentang Saya</label>
                <textarea
                  rows={5}
                  required
                  value={editedProfile.about}
                  onChange={(e) => setEditedProfile({ ...editedProfile, about: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-700 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold resize-none"
                ></textarea>
              </div>

              <button
                type="submit"
                className="py-3 px-6 bg-slate-900 text-white hover:bg-slate-800 font-extrabold text-xs tracking-widest uppercase transition-all rounded-lg flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                SIMPAN PERUBAHAN PROFIL
              </button>
            </form>
          )}

          {/* --- TAB CONTENT 1: ACHIEVEMENTS CMS --- */}
          {activeTab === 'achievements' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
              {/* Form Col */}
              <form onSubmit={handleAddAchievement} className="lg:col-span-5 space-y-4">
                <h3 className="text-xs font-black tracking-widest text-slate-800 uppercase mb-4">TAMBAH PRESTASI BARU</h3>
                
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Judul Pencapaian / Lomba</label>
                  <input
                    type="text"
                    required
                    value={newAch.title}
                    onChange={(e) => setNewAch({ ...newAch, title: e.target.value })}
                    placeholder="Contoh: Juara 1 LCC MPR Jabar"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Kategori</label>
                    <input
                      type="text"
                      value={newAch.category}
                      onChange={(e) => setNewAch({ ...newAch, category: e.target.value })}
                      placeholder="Contoh: Akademik"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Tanggal / Bulan</label>
                    <input
                      type="text"
                      value={newAch.date}
                      onChange={(e) => setNewAch({ ...newAch, date: e.target.value })}
                      placeholder="Contoh: Mei 2026"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Deskripsi Kegiatan</label>
                  <textarea
                    rows={4}
                    required
                    value={newAch.description}
                    onChange={(e) => setNewAch({ ...newAch, description: e.target.value })}
                    placeholder="Jelaskan peran Anda, kendala, hasil LCC atau materi teknis..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold resize-none text-slate-700"
                  ></textarea>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Foto / Video (URL atau Unggah File)</label>
                  <input
                    type="text"
                    value={newAch.image || ''}
                    onChange={(e) => setNewAch({ ...newAch, image: e.target.value })}
                    placeholder="Masukkan URL foto/video atau unggah berformat MP4/Gambar di bawah..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold mb-2"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-200 hover:border-slate-350 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-lg cursor-pointer transition-all text-xs font-semibold">
                      <Music className="w-4 h-4 text-indigo-500" />
                      <span>{newAch.image && newAch.image.startsWith('data:') ? 'Ganti File Terunggah' : 'Unggah Foto atau Video'}</span>
                      <input
                        type="file"
                        accept="image/*, video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 15 * 1024 * 1024) {
                              alert("Ukuran file terlalu besar! Maksimal 15MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setNewAch({ ...newAch, image: reader.result });
                                showToast("Media berhasil dimuat!");
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {newAch.image && (
                      <button
                        type="button"
                        onClick={() => setNewAch({ ...newAch, image: '' })}
                        className="px-3 py-2 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg text-xs font-bold transition-all"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  {newAch.image && (
                    <div className="mt-2 border border-slate-200 rounded-lg p-2 bg-slate-50 flex items-center gap-2">
                      {newAch.image.startsWith('data:video') || newAch.image.endsWith('.mp4') || newAch.image.endsWith('.webm') ? (
                        <video src={newAch.image} className="w-16 h-12 object-cover rounded bg-black" muted playsInline />
                      ) : (
                        <img src={newAch.image} className="w-16 h-12 object-cover rounded border border-slate-200 animate-fade-in" referrerPolicy="no-referrer" />
                      )}
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1.5 border border-emerald-150 rounded-lg font-bold uppercase truncate animate-pulse">
                        ✓ Media Terpasang
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold tracking-widest uppercase transition-all rounded-lg flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Simpan Pencapaian
                </button>
              </form>

              {/* Data Table Col */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">DAFTAR AKTIF PORTOFOLIO PRESTASI</h3>
                  {JSON.stringify(localAchievements) !== JSON.stringify(data.achievements) && (
                    <span className="text-[9px] font-mono text-amber-700 bg-amber-50 px-2.5 py-1.5 border border-amber-200/60 rounded-lg animate-pulse font-black uppercase tracking-wider">
                      Draft Belum Disimpan
                    </span>
                  )}
                </div>

                {JSON.stringify(localAchievements) !== JSON.stringify(data.achievements) && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
                    <div className="text-xs font-sans text-amber-800 font-semibold leading-relaxed">
                      ⚠ Penambahan/penghapusan prestasi baru masih berupa draf lokal.
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveAchievements}
                      disabled={isSaving}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-mono font-black tracking-widest uppercase transition-all shadow-md cursor-pointer flex-shrink-0"
                    >
                      {isSaving ? 'SINKRONISASI...' : 'SIMPAN KE CLOUD'}
                    </button>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl overflow-hidden divide-y divide-slate-200/70 shadow-sm">
                  {localAchievements.map((item) => (
                    <div key={item.id} className="p-4 flex items-start gap-4 hover:bg-slate-100/50 transition-all">
                      <div className="w-12 h-12 border border-slate-200 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {item.image.startsWith('data:video') || item.image.toLowerCase().endsWith('.mp4') || item.image.toLowerCase().endsWith('.webm') ? (
                          <video src={item.image} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all bg-black" muted playsInline />
                        ) : (
                          <img 
                             src={item.image} 
                             alt="Thumbnail" 
                             className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all"
                             referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-black">{item.category} | {item.date}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteAchievement(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-101 transition-all border border-transparent rounded-lg cursor-pointer"
                            title="Hapus pencapaian"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 font-sans">{item.title}</h4>
                        <p className="text-xs text-slate-500 max-w-md truncate font-medium">{item.description}</p>
                      </div>
                    </div>
                  ))}
                  {localAchievements.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400 uppercase font-mono font-bold">
                      BELUM ADA PRESTASI TERSEDIA. SILAKAN TAMBAH BARU.
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveAchievements}
                    disabled={isSaving}
                    className={`w-full py-3 border text-xs font-bold tracking-widest uppercase transition-all rounded-lg flex items-center justify-center gap-1.5 cursor-pointer ${
                      JSON.stringify(localAchievements) !== JSON.stringify(data.achievements)
                        ? 'bg-emerald-600 text-white font-extrabold border-emerald-600 hover:bg-emerald-500 shadow-md ring-2 ring-emerald-300 animate-pulse'
                        : 'bg-slate-100 text-slate-450 border-slate-200 hover:bg-slate-200/80 hover:text-slate-700'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {isSaving ? 'MEMPROSES GENERASI TRANSAKSI...' : 'SIMPAN PERUBAHAN PRESTASI KE SUPABASE'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB CONTENT 2: GALLERY CMS --- */}
          {activeTab === 'gallery' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-4">
              {/* Form Col */}
              <form onSubmit={handleAddGallery} className="lg:col-span-5 space-y-4">
                <h3 className="text-xs font-black tracking-widest text-slate-800 uppercase mb-4">TAMBAH FOTO BARU KE GALERI</h3>
                
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Judul Gambar / Kegiatan</label>
                  <input
                    type="text"
                    required
                    value={newGal.title}
                    onChange={(e) => setNewGal({ ...newGal, title: e.target.value })}
                    placeholder="Contoh: Konfigurasi Router Utama"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Kategori / Subjek</label>
                    <input
                      type="text"
                      value={newGal.category}
                      onChange={(e) => setNewGal({ ...newGal, category: e.target.value })}
                      placeholder="Contoh: Lab TKJ"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Tanggal Kegiatan</label>
                    <input
                      type="text"
                      value={newGal.date}
                      onChange={(e) => setNewGal({ ...newGal, date: e.target.value })}
                      placeholder="Contoh: April 2026"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Deskripsi Kegiatan</label>
                  <textarea
                    rows={4}
                    required
                    value={newGal.description}
                    onChange={(e) => setNewGal({ ...newGal, description: e.target.value })}
                    placeholder="Tuliskan keterangan singkat, topologi yang dirancang, atau aktivitas..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold resize-none text-slate-700"
                  ></textarea>
                </div>

                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Foto / Video (URL atau Unggah File)</label>
                  <input
                    type="text"
                    value={newGal.image || ''}
                    onChange={(e) => setNewGal({ ...newGal, image: e.target.value })}
                    placeholder="Masukkan URL foto/video atau unggah berformat MP4/Gambar di bawah..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold mb-2"
                  />
                  <div className="flex items-center gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-slate-200 hover:border-slate-350 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-lg cursor-pointer transition-all text-xs font-semibold">
                      <Music className="w-4 h-4 text-indigo-500" />
                      <span>{newGal.image && newGal.image.startsWith('data:') ? 'Ganti File Terunggah' : 'Unggah Foto atau Video'}</span>
                      <input
                        type="file"
                        accept="image/*, video/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 15 * 1024 * 1024) {
                              alert("Ukuran file terlalu besar! Maksimal 15MB.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setNewGal({ ...newGal, image: reader.result });
                                showToast("Media berhasil dimuat!");
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {newGal.image && (
                      <button
                        type="button"
                        onClick={() => setNewGal({ ...newGal, image: '' })}
                        className="px-3 py-2 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg text-xs font-bold transition-all"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  {newGal.image && (
                    <div className="mt-2 border border-slate-200 rounded-lg p-2 bg-slate-50 flex items-center gap-2">
                      {newGal.image.startsWith('data:video') || newGal.image.endsWith('.mp4') || newGal.image.endsWith('.webm') ? (
                        <video src={newGal.image} className="w-16 h-12 object-cover rounded bg-black" muted playsInline />
                      ) : (
                        <img src={newGal.image} className="w-16 h-12 object-cover rounded border border-slate-200 animate-fade-in" referrerPolicy="no-referrer" />
                      )}
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1.5 border border-emerald-150 rounded-lg font-bold uppercase truncate animate-pulse">
                        ✓ Media Terpasang
                      </span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold tracking-widest uppercase transition-all rounded-lg flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Simpan ke Galeri
                </button>
              </form>

              {/* Data Table Col */}
              <div className="lg:col-span-7 space-y-4">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                  <h3 className="text-xs font-black tracking-widest text-slate-400 uppercase">DAFTAR AKTIF DOKUMENTASI GALERI</h3>
                  {JSON.stringify(localGallery) !== JSON.stringify(data.gallery) && (
                    <span className="text-[9px] font-mono text-amber-700 bg-amber-50 px-2.5 py-1.5 border border-amber-200/60 rounded-lg animate-pulse font-black uppercase tracking-wider">
                      Draft Belum Disimpan
                    </span>
                  )}
                </div>

                {JSON.stringify(localGallery) !== JSON.stringify(data.gallery) && (
                  <div className="p-3.5 bg-amber-50/70 border border-amber-200/60 rounded-xl flex items-center justify-between gap-3 animate-fade-in">
                    <div className="text-xs font-sans text-amber-800 font-semibold leading-relaxed">
                      ⚠ Penambahan/penghapusan galeri baru masih berupa draf lokal.
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveGallery}
                      disabled={isSaving}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-mono font-black tracking-widest uppercase transition-all shadow-md cursor-pointer flex-shrink-0"
                    >
                      {isSaving ? 'SINKRONISASI...' : 'SIMPAN KE CLOUD'}
                    </button>
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-200/80 rounded-xl overflow-hidden divide-y divide-slate-200/70 shadow-sm">
                  {localGallery.map((item) => (
                    <div key={item.id} className="p-4 flex items-start gap-4 hover:bg-slate-100/50 transition-all">
                      <div className="w-12 h-12 border border-slate-200 flex-shrink-0 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {item.image.startsWith('data:video') || item.image.toLowerCase().endsWith('.mp4') || item.image.toLowerCase().endsWith('.webm') ? (
                          <video src={item.image} className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all bg-black" muted playsInline />
                        ) : (
                          <img 
                            src={item.image} 
                            alt="Thumbnail" 
                            className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono text-slate-400 uppercase font-black">{item.category} | {item.date}</span>
                          <button
                            type="button"
                            onClick={() => handleDeleteGallery(item.id)}
                            className="p-1 text-slate-400 hover:text-rose-500 hover:bg-rose-50 hover:border-rose-101 transition-all border border-transparent rounded-lg cursor-pointer"
                            title="Hapus gambar"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 font-sans">{item.title}</h4>
                        <p className="text-xs text-slate-500 max-w-md truncate font-medium">{item.description}</p>
                      </div>
                    </div>
                  ))}
                  {localGallery.length === 0 && (
                    <div className="p-8 text-center text-xs text-slate-400 uppercase font-mono font-bold">
                      BELUM ADA GAMBAR GALERI TERSEDIA. SILAKAN TAMBAH BARU.
                    </div>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleSaveGallery}
                    disabled={isSaving}
                    className={`w-full py-3 border text-xs font-bold tracking-widest uppercase transition-all rounded-lg flex items-center justify-center gap-1.5 cursor-pointer ${
                      JSON.stringify(localGallery) !== JSON.stringify(data.gallery)
                        ? 'bg-emerald-600 text-white font-extrabold border-emerald-600 hover:bg-emerald-500 shadow-md ring-2 ring-emerald-300 animate-pulse'
                        : 'bg-slate-100 text-slate-450 border-slate-205 hover:bg-slate-200/80 hover:text-slate-700'
                    }`}
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    {isSaving ? 'MEMPROSES GENERASI TRANSAKSI...' : 'SIMPAN PERUBAHAN GALERI KE SUPABASE'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB CONTENT 3: LOCATION EDIT --- */}
          {activeTab === 'location' && (
            <form onSubmit={handleSaveLocation} className="max-w-2xl space-y-5 pt-4">
              <h3 className="text-xs font-black tracking-widest text-slate-800 uppercase mb-4 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-600" />
                KONFIGURASI ALAMAT & LATITUDE LONGITUDE
              </h3>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Alamat Fisik Lengkap</label>
                <input
                  type="text"
                  required
                  value={editedLocation.address}
                  onChange={(e) => setEditedLocation({ ...editedLocation, address: e.target.value })}
                  placeholder="Nama jalan, nomor rumah, RT/RW, kecamatan..."
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Kabupaten / Kota</label>
                  <input
                    type="text"
                    required
                    value={editedLocation.city}
                    onChange={(e) => setEditedLocation({ ...editedLocation, city: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Provinsi</label>
                  <input
                    type="text"
                    required
                    value={editedLocation.province}
                    onChange={(e) => setEditedLocation({ ...editedLocation, province: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Latitude Koordinat</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={editedLocation.latitude}
                    onChange={(e) => setEditedLocation({ ...editedLocation, latitude: parseFloat(e.target.value) || 0 })}
                    placeholder="Contoh: -6.2088"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 font-mono text-xs outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Longitude Koordinat</label>
                  <input
                    type="number"
                    step="0.000001"
                    required
                    value={editedLocation.longitude}
                    onChange={(e) => setEditedLocation({ ...editedLocation, longitude: parseFloat(e.target.value) || 0 })}
                    placeholder="Contoh: 106.8456"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 font-mono text-xs outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">Deskripsi Tambahan Alamat</label>
                <textarea
                  rows={3}
                  required
                  value={editedLocation.description}
                  onChange={(e) => setEditedLocation({ ...editedLocation, description: e.target.value })}
                  placeholder="Detil deskripsi lingkungan sekitar rumah tempat tinggal..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200/80 text-slate-800 text-sm outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold resize-none text-slate-700"
                ></textarea>
              </div>

              <button
                type="submit"
                className="py-3 px-6 bg-slate-900 text-white hover:bg-slate-800 font-black text-xs tracking-widest uppercase transition-all rounded-lg flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
              >
                <Check className="w-4 h-4 text-emerald-400" />
                Daftarkan Alamat Baru
              </button>
            </form>
          )}

          {/* --- TAB CONTENT 4: SOCIALS EDIT --- */}
          {activeTab === 'socials' && (
            <div className="space-y-6 pt-4 max-w-2xl">
              <h3 className="text-xs font-black tracking-widest text-slate-800 uppercase mb-4 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-indigo-650" />
                PENGATURAN TAUTAN & USERNAME MEDIA SOSIAL
              </h3>

              <div className="space-y-4 divide-y divide-slate-200">
                {editedSocials.map((social, idx) => (
                  <div key={social.platform} className="pt-4 first:pt-0 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="md:col-span-3 text-xs font-black text-slate-700 tracking-wider">
                      {social.platform}
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1 font-bold">Username / Tampilan</label>
                      <input
                        type="text"
                        value={social.username}
                        onChange={(e) => handleSaveSocial(e, idx, 'username', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200/80 text-slate-800 text-xs outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-bold"
                      />
                    </div>
                    <div className="md:col-span-5">
                      <label className="text-[9px] font-mono text-slate-400 block uppercase mb-1 font-bold">URL Profil Tujuan</label>
                      <input
                        type="text"
                        value={social.url}
                        onChange={(e) => handleSaveSocial(e, idx, 'url', e.target.value)}
                        className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200/80 text-slate-800 text-xs outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all font-sans font-semibold text-slate-600"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* --- TAB CONTENT 5: BACKGROUND MUSIC EDIT --- */}
          {activeTab === 'audio' && (
            <form onSubmit={handleSaveAudioUrl} className="space-y-6 pt-4 max-w-2xl text-slate-800">
              <h3 className="text-xs font-black tracking-widest text-slate-800 uppercase mb-4 flex items-center gap-2">
                <Music className="w-4 h-4 text-indigo-650" />
                PENGATURAN MUSIK LATAR BELAKANG (BG MUSIC)
              </h3>

              <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-2">
                <p className="text-xs text-slate-600 leading-relaxed font-sans">
                  Aplikasi ini dirancang dengan background music otomatis yang akan berputar setelah Anda mengetuk Touch Scan Sidik Jari di awal masuk. Anda dapat mengubah trek lagunya via form di bawah ini dengan memasukkan URL audio langsung (Direct Audio Link) berformat MP3 / OGG.
                </p>
                <div className="text-[10px] font-mono text-indigo-600 font-bold uppercase">
                  REKOMENDASI SUMBER AUDIO:
                </div>
                <ul className="list-disc list-inside text-[10px] text-slate-500 font-mono space-y-1">
                  <li>Tautan MP3 langsung (contoh: dari hosting pribadi/Google Drive direct link)</li>
                  <li>Link lagu lofi bebas royalti gratis</li>
                </ul>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1 font-bold">URL Trek Lagu MP3 Utama</label>
                  <input
                    type="url"
                    required
                    value={editedAudioUrl}
                    onChange={(e) => setEditedAudioUrl(e.target.value)}
                    placeholder="https://assets.codepen.io/25868/shoptalk-clip.mp3"
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200/80 text-slate-800 font-mono text-xs outline-none focus:border-slate-400 focus:bg-white rounded-lg transition-all"
                  />
                </div>

                <div className="border-t border-slate-200/60 pt-4">
                  <label className="text-[10px] font-mono text-slate-400 block uppercase mb-1.5 font-bold">ATAU UNGGAH BERKAS MP3 SAYA (MAKSIMAL 12MB)</label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <label className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 border-2 border-dashed border-slate-200 hover:border-slate-350 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 rounded-xl cursor-pointer transition-all active:scale-98 select-none font-sans font-bold text-xs">
                      <Music className="w-4 h-4 text-indigo-500 animate-bounce" />
                      <span>{editedAudioUrl.startsWith('data:audio') ? 'Ganti File MP3 Terunggah' : 'Unggah Lagu (*.mp3)'}</span>
                      <input
                        type="file"
                        accept="audio/mp3, audio/mpeg, audio/ogg, audio/wav"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            if (file.size > 12 * 1024 * 1024) {
                              alert("Ukuran musik terlalu besar! Maksimal 12MB agar menghemat ruang penyimpanan browser.");
                              return;
                            }
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              if (typeof reader.result === 'string') {
                                setEditedAudioUrl(reader.result);
                                showToast("Lagu berhasil dimuat! Ketuk tombol Simpan dibawah.");
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                      />
                    </label>

                    {editedAudioUrl.startsWith('data:audio') ? (
                      <span className="text-[10px] font-mono text-emerald-600 bg-emerald-50 px-2.5 py-1.5 border border-emerald-150 rounded-lg font-bold">
                        ✓ LAGU MP3 DIUNGGAH (SIAP SIMPAN)
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400">
                        Belum ada berkas lokal terpilih
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="py-3 px-6 bg-slate-900 text-white hover:bg-slate-800 font-black text-xs tracking-widest uppercase transition-all rounded-lg flex items-center justify-center gap-1.5 focus:outline-none cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-400" />
                  PERBARUI LAGU LATAR BELAKANG
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditedAudioUrl("https://assets.codepen.io/25868/shoptalk-clip.mp3");
                  }}
                  className="py-3 px-4 border border-slate-200 text-slate-500 hover:bg-slate-50 font-bold text-xs tracking-widest uppercase transition-all rounded-lg focus:outline-none cursor-pointer"
                >
                  Gunakan Lagu Bawaan
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
