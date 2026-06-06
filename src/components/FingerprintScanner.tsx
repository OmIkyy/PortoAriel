import React, { useState, useEffect, useRef } from 'react';
import { appAudio } from '../audioEngine';
import { ShieldCheck, Fingerprint, RefreshCw, Volume2 } from 'lucide-react';

interface FingerprintScannerProps {
  onUnlock: () => void;
  name?: string;
  role?: string;
}

export default function FingerprintScanner({ 
  onUnlock, 
  name = 'ARIEL ARILLIO SAPUTRA', 
  role = 'TEKNIK KOMPUTER DAN JARINGAN' 
}: FingerprintScannerProps) {
  const [isPressing, setIsPressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('SISTEM DIKUNCI — OTENTIKASI DIPERLUKAN');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success' | 'failed'>('idle');
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPressing) {
      setScanState('scanning');
      const start = Date.now();
      const duration = 1500; // 1.5 seconds scan

      intervalRef.current = window.setInterval(() => {
        const elapsed = Date.now() - start;
        const currentProgress = Math.min(100, (elapsed / duration) * 100);
        setProgress(Math.round(currentProgress));

        // Dynamic status subtitles based on progress and TKJ context
        if (currentProgress < 30) {
          setStatusText('Mendownload kontur biometrik sidik jari...');
        } else if (currentProgress < 60) {
          setStatusText('Memvalidasi hash enkripsi SHA-256...');
        } else if (currentProgress < 90) {
          setStatusText('Mencocokkan dengan database lokal perangkat...');
        } else {
          setStatusText('Identitas terverifikasi. Membuka portal...');
        }

        if (currentProgress >= 100) {
          handleSuccess();
        }
      }, 30);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (progress < 100) {
        setProgress(0);
        setScanState('idle');
        setStatusText('SISTEM DIKUNCI — SILAKAN INTRODUKSI SIDIK JARI');
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPressing]);

  const handleStartScan = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsPressing(true);
    // Prepare Audio Context immediately on touch gesture (crucial to allow browsers to autoplay music)
    appAudio.init();
  };

  const handleEndScan = () => {
    setIsPressing(false);
  };

  const handleSuccess = () => {
    setIsPressing(false);
    setScanState('success');
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Play beautiful ambient background music automatically using the touch guesture authorization!
    setTimeout(() => {
      appAudio.start();
      onUnlock();
    }, 600);
  };

  return (
    <div 
      id="fingerprint-screen"
      className="fixed inset-0 mesh-gradient flex flex-col items-center justify-center p-6 text-slate-800 overflow-hidden font-sans"
    >
      {/* Background Mesh Gradient (Monochrome overlays) */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-100 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-150 blur-[120px] rounded-full"></div>
      </div>

      {/* Aesthetic TKJ System details in visual margins */}
      <div className="absolute top-6 left-8 hidden md:block text-[11px] font-mono text-slate-500 font-bold tracking-wider">
        CORE-SEC_NODE: ACTIVE // PROTOCOL: AUTH_SECURE
      </div>
      <div className="absolute top-6 right-8 hidden md:block text-[11px] font-mono text-slate-500 font-bold tracking-wider">
        ENCRYPTION: SHIELD_256_ACTIVE // LOC_TIME: 2026-06-03
      </div>

      <div className="w-full max-w-md bg-white/85 border border-slate-250/60 backdrop-blur-xl rounded-2xl p-8 flex flex-col items-center relative shadow-2xl">
        {/* System Header */}
        <div className="text-center mb-10 w-full">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100/80 rounded-full text-xs font-mono tracking-widest text-slate-700 mb-4 border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-700 animate-pulse" />
            SECURE PORTFOLIO GATEWAY
          </div>
          <h1 className="text-2xl font-black tracking-widest text-slate-900 uppercase mb-2">
            {name}
          </h1>
          <p className="text-[11px] text-slate-500 font-mono tracking-wider font-extrabold">
            {role}
          </p>
        </div>

        {/* Scan Center Container */}
        <div className="relative w-48 h-48 flex items-center justify-center mb-8">
          {/* Progress Circular ring */}
          <svg className="absolute inset-0 w-full h-full transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-slate-100 stroke-[3]"
              fill="transparent"
            />
            <circle
              cx="50"
              cy="50"
              r="44"
              className="stroke-indigo-600 stroke-[4] transition-all duration-75"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 44}
              strokeDashoffset={2 * Math.PI * 44 * (1 - progress / 100)}
            />
          </svg>

          {/* Core Interactive Touch Sensor */}
          <button
            id="scan-button"
            onMouseDown={handleStartScan}
            onMouseUp={handleEndScan}
            onMouseLeave={handleEndScan}
            onTouchStart={handleStartScan}
            onTouchEnd={handleEndScan}
            className={`cursor-pointer group relative w-36 h-36 rounded-full flex flex-col items-center justify-center transition-all duration-300 border select-none outline-none ${
              scanState === 'scanning'
                ? 'bg-slate-100 border-indigo-600 scale-95 shadow-[0_0_20px_rgba(79,70,229,0.15)]'
                : scanState === 'success'
                ? 'bg-slate-950 text-white border-slate-950'
                : 'bg-slate-50 hover:bg-slate-100/50 border-slate-250/70 hover:border-slate-300'
            }`}
          >
            {scanState === 'success' ? (
              <ShieldCheck className="w-16 h-16 text-white animate-bounce" />
            ) : (
              <Fingerprint 
                className={`w-16 h-16 transition-all ${
                  scanState === 'scanning' 
                    ? 'text-indigo-600 scale-110 animate-pulse' 
                    : 'text-slate-400 group-hover:text-slate-800'
                }`} 
              />
            )}

            {/* Glowing Scan Ray (Moving Laser Line) */}
            {scanState === 'scanning' && (
              <div className="absolute left-0 right-0 h-0.5 bg-indigo-600 opacity-80 shadow-[0_0_8px_rgb(79,70,229)] animate-scan-laser pointer-events-none"></div>
            )}
          </button>
        </div>

        {/* Scan Helper / Realtime Feedback */}
        <div className="text-center w-full min-h-[48px]">
          <div className="text-xs font-mono font-black tracking-wide uppercase text-slate-800 mb-1">
            {scanState === 'scanning' ? `PROSES SCANNING: ${progress}%` : 
             scanState === 'success' ? 'OTENTIKASI SUKSES!' : 'SIAP UNTUK PEMINDAIAN'}
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed font-sans px-2 transition-all font-semibold">
            {statusText}
          </p>
        </div>

        {/* Autoplay Music Notice (to fulfill browser policy transparently) */}
        <div className="mt-8 flex items-center gap-1.5 text-[10px] text-slate-450 font-mono text-center justify-center border-t border-slate-100 w-full pt-4 font-bold">
          <Volume2 className="w-3.5 h-3.5 text-slate-500" />
          <span>MUSIC WILL AUTO-PLAY ON SUCCESSFUL UNLOCK</span>
        </div>
      </div>

      {/* Manual bypass link if they are on device without easy mouse hold, though mouse hold is easy */}
      <button 
        onClick={handleSuccess}
        className="mt-6 text-[11px] font-mono text-slate-500 hover:text-slate-800 underline cursor-pointer transition-all uppercase tracking-widest font-black"
      >
        Unduh Manual Tanpa Pres &gt;
      </button>

      {/* Tailwind specific animations insertion */}
      <style>{`
        @keyframes scan-laser {
          0% { top: 10%; }
          50% { top: 90%; }
          100% { top: 10%; }
        }
        .animate-scan-laser {
          animation: scan-laser 2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}
