import studentAvatar from './assets/images/student_avatar_1780449540274.png';
import achievementLcc from './assets/images/achievement_lcc_1780449554712.png';
import networkingLab from './assets/images/networking_lab_1780449567974.png';
import { PortfolioData } from './types';

export const DEFAULT_PORTFOLIO_DATA: PortfolioData = {
  profile: {
    name: "Ariel Arillio Saputra",
    role: "Siswa SMK Jurusan TKJ | Network & Digital Specialist",
    school: "SMK Negeri Jurusan Teknik Komputer & Jaringan",
    major: "Teknik Komputer dan Jaringan (TKJ)",
    about: "Saya adalah siswa SMK jurusan TKJ yang memiliki keunggulan kuat di bidang akademik dan wawasan kebangsaan. Sebagai salah satu delegasi dalam Lomba Cerdas Cermat (LCC) 4 Pilar MPR RI, saya terbiasa berpikir cepat, menganalisis informasi kompleks, dan bekerja di bawah tekanan. Didukung kemampuan Matematika dan Bahasa Inggris yang solid, saya mampu mengombinasikan logika berpikir kritis dengan keahlian administrasi digital (Excel, Word, PPT) untuk mengelola data dan dokumen secara terstruktur.",
    avatar: studentAvatar,
    skills: [
      { name: "Administrasi Jaringan & Mikrotik", level: 90, category: "networking" },
      { name: "Routing & Switching (Cisco)", level: 85, category: "networking" },
      { name: "Instalasi Server Linux / Deb", level: 80, category: "networking" },
      { name: "Microsoft Excel (Data Management)", level: 95, category: "admin" },
      { name: "Microsoft Word & PPT (Structured Doc)", level: 92, category: "admin" },
      { name: "Matematika & Logika Analitis", level: 90, category: "general" },
      { name: "Bahasa Inggris (Technical/Business)", level: 88, category: "general" },
      { name: "Analisis Wawasan Kebangsaan (LCC)", level: 95, category: "general" }
    ]
  },
  achievements: [
    {
      id: "ach-1",
      title: "Delegasi Lomba Cerdas Cermat (LCC) 4 Pilar MPR RI",
      category: "Akademik & Kebangsaan",
      date: "Agustus 2025",
      description: "Terpilih sebagai salah satu delegasi sekolah dalam kompetisi wawasan kebangsaan tingkat menteri/MPR RI. Diuji dalam kecepatan berpikir dan analisis ketatanegaraan.",
      image: achievementLcc
    },
    {
      id: "ach-2",
      title: "Juara Umum Kompetensi Keahlian TKJ",
      category: "Keahlian Jurusan",
      date: "Desember 2025",
      description: "Meraih penghargaan siswa terbaik untuk konfigurasi jaringan terpadu (Routing & Subnetting tingkat lanjut) di laboratorium TKJ sekolah.",
      image: networkingLab
    },
    {
      id: "ach-3",
      title: "Sertifikasi Administrasi Digital Tingkat Lanjut",
      category: "Sertifikasi",
      date: "Maret 2026",
      description: "Sertifikasi kompetensi pengelolaan berkas, pemodelan data terstruktur menggunakan Excel Pivot Tables, dan pembuatan presentasi teknis tingkat profesional.",
      image: achievementLcc
    }
  ],
  gallery: [
    {
      id: "gal-1",
      title: "Praktikum Lab Jaringan",
      category: "Lab TKJ",
      description: "Konfigurasi topologi routing dinamis menggunakan perangkat router fisik Mikrotik.",
      image: networkingLab,
      date: "Oktober 2025"
    },
    {
      id: "gal-2",
      title: "Persiapan LCC 4 Pilar",
      category: "Belajar & Diskusi",
      description: "Sesi intensif membaca materi ketatanegaraan dan latihan simulasi kuis cepat tanggap.",
      image: achievementLcc,
      date: "Juni 2025"
    },
    {
      id: "gal-3",
      title: "Project Administrasi Server",
      category: "Tugas Akhir",
      description: "Pengaturan web server lokal, database, dan DNS lokal berbasis Linux Debian di mesin virtual.",
      image: networkingLab,
      date: "Februari 2026"
    }
  ],
  socials: [
    {
      platform: "Instagram",
      url: "https://instagram.com/ariel_arillio",
      icon: "Instagram",
      username: "@ariel_arillio"
    },
    {
      platform: "TikTok",
      url: "https://tiktok.com/@ariel_arillio",
      icon: "Tiktok",
      username: "@ariel_arillio"
    }
  ],
  location: {
    address: "Jl. Pendidikan No. 45, Kecamatan Tunas Harapan, Kota Sukses Maju",
    city: "Kota Sukses Maju",
    province: "Jawa Barat",
    latitude: -6.2088,
    longitude: 106.8456,
    description: "Dekat dengan Akses SMK Negeri Pusat Keunggulan, lingkungan tenang dan ideal untuk fokus belajar sistem jaringan.",
    googleMapsUrl: "https://maps.google.com/?q=-6.2088,106.8456"
  },
  audioUrl: "https://assets.codepen.io/25868/shoptalk-clip.mp3"
};
