import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Shield, RefreshCw, Layers, CheckCircle } from 'lucide-react';

interface LogLine {
  text: string;
  type: 'info' | 'success' | 'warn' | 'input';
}

export default function NetworkTerminal() {
  const [input, setInput] = useState('');
  const [logs, setLogs] = useState<LogLine[]>([
    { text: 'ARIEL PROTOCOL TERMINAL (AA_TERM) [v1.1.00]', type: 'info' },
    { text: 'SMK NEGERI TKJ NETWORKING SERVICES CO.', type: 'info' },
    { text: 'Tipe "help" beralih untuk melihat opsi perintah diagnosa jaringan.', type: 'warn' },
    { text: 'SYS_STATUS: ONLINE, PORT_FIREWALL: SECURE', type: 'success' },
    { text: '', type: 'info' }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const executeCommand = (cmdText: string) => {
    const trimmed = cmdText.trim().toLowerCase();
    if (!trimmed) return;

    const newLogs = [...logs, { text: `ariel@tkj-node:~$ ${cmdText}`, type: 'input' as const }];
    setIsProcessing(true);

    setTimeout(() => {
      let replies: LogLine[] = [];

      switch (trimmed) {
        case 'help':
          replies = [
            { text: 'Sistem Diagnosa - Daftar Perintah yang Tersedia:', type: 'warn' },
            { text: '  ping ariel.net   - Menguji respon latensi ke server hosting ariel', type: 'info' },
            { text: '  ping backup.net  - Menguji respon latensi ke server hosting backup', type: 'info' },
            { text: '  netstat          - Menampilkan status interface router & port aktif', type: 'info' },
            { text: '  skills           - Dump data level kompetensi TKJ Ariel', type: 'info' },
            { text: '  about            - Output ringkasan visi & administrasi kebangsaan', type: 'info' },
            { text: '  subnet           - Hitung kalkulator subnet cepat biner IP lokal', type: 'info' },
            { text: '  clear            - Membersihkan histori terminal', type: 'info' }
          ];
          break;

        case 'ping ariel.net':
        case 'ping backup.net':
          replies = [
            { text: 'PING ariel.net (192.168.100.45) 56(84) bytes of data.', type: 'info' },
            { text: '64 bytes from 192.168.100.45: icmp_seq=1 ttl=64 time=11.2 ms', type: 'success' },
            { text: '64 bytes from 192.168.100.45: icmp_seq=2 ttl=64 time=8.54 ms', type: 'success' },
            { text: '64 bytes from 192.168.100.45: icmp_seq=3 ttl=64 time=9.12 ms', type: 'success' },
            { text: '--- ariel.net ping statistics ---', type: 'info' },
            { text: '3 packets transmitted, 3 received, 0% packet loss, time 2003ms', type: 'success' },
            { text: 'rtt min/avg/max/mdev = 8.54/9.62/11.2/1.37 ms', type: 'info' }
          ];
          break;

        case 'netstat':
          replies = [
            { text: 'Active Internet Connections (only servers)', type: 'warn' },
            { text: 'Proto Recv-Q Send-Q Local Address           Foreign Address         State', type: 'info' },
            { text: 'tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN (MySQL)', type: 'info' },
            { text: 'tcp        0      0 192.168.100.45:80       0.0.0.0:*               LISTEN (Nginx Web)', type: 'info' },
            { text: 'tcp        0      0 192.168.100.45:22       0.0.0.0:*               LISTEN (SSH_Mikrotik)', type: 'success' },
            { text: 'udp        0      0 192.168.100.45:53       0.0.0.0:*               LISTEN (Local DNS)', type: 'info' }
          ];
          break;

        case 'skills':
          replies = [
            { text: 'LOAD: PORTOFOLIO_SKILLS_DUMP.sh', type: 'warn' },
            { text: '[NET-Routing] Cisco switches & ospf/bgp tables ....... 85%', type: 'success' },
            { text: '[NET-Mikrotik] Bandwidth limits & queue tree ........ 95%', type: 'success' },
            { text: '[ADM-Excel] Pivot, multi-sheets VLOOKUP, macros ..... 95%', type: 'success' },
            { text: '[SYS-Linux] Server Web, FTP & SSH access ............ 85%', type: 'success' },
            { text: '[GEN-English] Reading/Writing technical guides ...... 88%', type: 'success' }
          ];
          break;

        case 'about':
          replies = [
            { text: 'DATA SUBYEK:', type: 'warn' },
            { text: 'Nama: ARIEL ARILLIO SAPUTRA', type: 'info' },
            { text: 'Status: Delegasi LCC 4 Pilar MPR RI', type: 'success' },
            { text: 'Kemampuan Utama: Kombinasi Logika Matematika kuat dengan keahlian server komputer dan pengorganisasian digital terstruktur.', type: 'info' }
          ];
          break;

        case 'subnet':
          replies = [
            { text: 'IP_PROMPT: 192.168.100.0/24 Subnetting Analisis:', type: 'warn' },
            { text: '  Netmask IP:  255.255.255.0 (Biner: 11111111.11111111.11111111.00000000)', type: 'info' },
            { text: '  Total Host:  254 usable hosts (IP Range: 192.168.100.1 ke 192.168.100.254)', type: 'success' },
            { text: '  Broadcast ID: 192.168.100.255', type: 'info' }
          ];
          break;

        case 'clear':
          setLogs([]);
          setInput('');
          setIsProcessing(false);
          return;

        default:
          replies = [
            { text: `error: Perintah "${trimmed}" tidak dikenali.`, type: 'warn' },
            { text: 'Ketik "help" untuk melihat daftar perintah diagnosa utama.', type: 'info' }
          ];
          break;
      }

      setLogs([...newLogs, ...replies]);
      setInput('');
      setIsProcessing(false);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      executeCommand(input);
    }
  };

  return (
    <div id="terminal-section" className="bg-white/70 border border-slate-200/80 rounded-2xl p-6 relative font-sans backdrop-blur-xl shadow-md text-slate-800">
      <div className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 bg-slate-100 border border-slate-200 py-1 text-[9px] font-mono text-slate-500 font-bold rounded-full uppercase">
        <Terminal className="w-2.5 h-2.5" />
        SHELL DIAG_OS
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="flex gap-1.5">
          <span className="w-2.5 h-2.5 bg-slate-200 rounded-full"></span>
          <span className="w-2.5 h-2.5 bg-slate-300 rounded-full"></span>
          <span className="w-2.5 h-2.5 bg-slate-400 rounded-full"></span>
        </div>
        <span className="text-xs text-slate-500 font-mono font-bold pl-2">Console Diagnosa Jaringan TKJ Ariel</span>
      </div>

      {/* Terminal Main Logs Viewport */}
      <div 
        ref={scrollRef}
        className="h-64 overflow-y-auto mb-4 bg-slate-950 border border-slate-900 rounded-xl p-4 font-mono text-xs leading-relaxed overflow-x-hidden border-b-2 border-slate-800 shadow-inner"
      >
        {logs.map((log, idx) => (
          <div 
            key={idx} 
            className={`whitespace-pre-wrap ${
              log.type === 'input' ? 'text-indigo-300 font-bold' :
              log.type === 'success' ? 'text-emerald-400 border-l border-emerald-500/50 pl-2 my-0.5' :
              log.type === 'warn' ? 'text-amber-300 font-semibold' :
              'text-slate-300/90'
            }`}
          >
            {log.text}
          </div>
        ))}
        {isProcessing && (
          <div className="text-indigo-400 flex items-center gap-2 text-[10px] animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Memproses instruksi jaringan...</span>
          </div>
        )}
      </div>

      {/* Manual Helper / Quick Command Tags */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-extrabold">Tes Cepat:</span>
        {['ping ariel.net', 'netstat', 'skills', 'subnet', 'help'].map((cmd) => (
          <button
            key={cmd}
            onClick={() => executeCommand(cmd)}
            disabled={isProcessing}
            className="px-3 py-1.5 text-[10px] font-mono border border-slate-200 bg-slate-100 rounded-full text-slate-700 hover:border-slate-300 hover:bg-slate-200 transition-all disabled:opacity-40 cursor-pointer font-bold"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* User Input prompt */}
      <div className="flex items-center gap-2 border-t border-slate-200 pt-4">
        <span className="text-xs font-mono font-bold text-indigo-650 uppercase select-none">ariel@tkj:~$</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isProcessing}
          placeholder="Ketik perintah di sini (cth: skills)"
          className="flex-1 bg-transparent text-slate-800 border-0 outline-none focus:ring-0 px-1 font-mono text-xs placeholder-slate-400 uppercase font-semibold"
        />
      </div>
    </div>
  );
}
