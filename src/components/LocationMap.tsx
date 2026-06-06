import { useState, useEffect } from 'react';
import { MapPin, Navigation, Clock, Globe, Compass, ExternalLink } from 'lucide-react';
import { LocationInfo } from '../types';

interface LocationMapProps {
  location: LocationInfo;
}

export default function LocationMap({ location }: LocationMapProps) {
  const [localTime, setLocalTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      // Indonesian Western Time (WIB) - UTC+7
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Jakarta',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      };
      setLocalTime(new Intl.DateTimeFormat('id-ID', options).format(now));
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute a gorgeous google maps static URL search query or embedding
  // We use standard Google Maps iframe embed on selected location coordinates
  const iframeSrc = `https://maps.google.com/maps?q=${location.latitude},${location.longitude}&z=14&ie=UTF8&iwloc=&output=embed`;

  return (
    <div id="location-section" className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 md:p-8 relative backdrop-blur-xl shadow-md text-slate-800">
      {/* Grid Headers */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-200/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100/90 text-[10px] text-slate-500 font-mono tracking-widest border border-slate-200/60 rounded-full uppercase font-bold">
            <Compass className="w-3.5 h-3.5" />
            STATION COORDINATES
          </div>
          <h2 className="text-xl font-black tracking-widest mt-2 uppercase text-slate-905 font-sans">
            Lokasi Rumah Tinggal
          </h2>
        </div>

        {/* Dynamic Indonesia Time Widget */}
        <div className="flex items-center gap-3 bg-slate-100 px-4 py-2.5 border border-slate-200/80 rounded-xl font-mono">
          <Clock className="w-4 h-4 text-slate-500" />
          <div className="text-right">
            <div className="text-[9px] text-slate-400 leading-none font-extrabold">WIB TIMEZONE</div>
            <div className="text-sm font-black text-slate-850 leading-none mt-1">{localTime || '00:00:00'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Address and Cyber Stats Col */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1.5 font-bold">Alamat Tinggal</span>
              <p className="text-sm text-slate-800 leading-relaxed font-sans font-semibold">
                {location.address}
              </p>
              <p className="text-xs text-slate-500 mt-1 font-sans font-bold">
                {location.city}, {location.province}
              </p>
            </div>

            <div className="p-5 bg-slate-50 border border-slate-200/60 rounded-xl">
              <span className="text-[10px] font-mono text-slate-400 block uppercase mb-1.5 font-bold">Tentang Lokasi</span>
              <p className="text-xs text-slate-600 leading-relaxed font-sans font-medium">
                {location.description}
              </p>
            </div>
          </div>

          {/* Telemetry metadata numbers */}
          <div className="grid grid-cols-2 gap-4 bg-transparent pt-2">
            <div className="p-4 bg-slate-100/80 border border-slate-200/70 rounded-xl text-left">
              <div className="text-[9px] font-mono text-slate-400 font-bold">LATITUDE</div>
              <div className="text-xs font-mono font-bold text-slate-700 mt-1">{location.latitude.toFixed(6)}</div>
            </div>
            <div className="p-4 bg-slate-100/80 border border-slate-200/70 rounded-xl text-left">
              <div className="text-[9px] font-mono text-slate-400 font-bold">LONGITUDE</div>
              <div className="text-xs font-mono font-bold text-slate-700 mt-1">{location.longitude.toFixed(6)}</div>
            </div>
          </div>

          <div className="pt-2">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${location.latitude},${location.longitude}`}
              target="_blank"
              rel="noreferrer noopener"
              className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center gap-2 font-sans font-bold text-xs tracking-wider uppercase transition-all rounded-xl shadow-md cursor-pointer"
            >
              <Navigation className="w-4 h-4 fill-white text-white" />
              <span>Dapatkan Rute Perjalanan</span>
              <ExternalLink className="w-3.5 h-3.5 text-white" />
            </a>
          </div>
        </div>

        {/* Right Map Rendering Container */}
        <div className="lg:col-span-7 h-80 lg:h-auto min-h-[280px] bg-slate-100 border border-slate-200 rounded-xl relative group overflow-hidden shadow-md">
          {/* Scanning frame indicator overlays */}
          <div className="absolute top-3 left-3 z-10 bg-slate-900/85 px-3 py-1.5 border border-slate-800 text-[9px] font-mono text-white flex items-center gap-1.5 rounded-lg backdrop-blur-xs">
            <span className="inline-block w-1.5 h-1.5 bg-green-400 rounded-full animate-ping"></span>
            LIVE SAT STATUS: ACTIVE
          </div>

          {/* Styled Map IFrame */}
          <iframe
            id="gmaps-iframe"
            title="Google Maps Location Frame"
            src={iframeSrc}
            className="w-full h-full border-0 filter grayscale hover:grayscale-0 transition-all duration-500"
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
