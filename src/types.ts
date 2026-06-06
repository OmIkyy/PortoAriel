export interface Profile {
  name: string;
  role: string;
  school: string;
  major: string;
  about: string;
  avatar: string;
  skills: { name: string; level: number; category: 'networking' | 'admin' | 'general' }[];
}

export interface Achievement {
  id: string;
  title: string;
  category: string;
  date: string;
  description: string;
  image: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: string;
  description: string;
  image: string;
  date: string;
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
  username: string;
}

export interface LocationInfo {
  address: string;
  latitude: number;
  longitude: number;
  description: string;
  googleMapsUrl: string;
  city: string;
  province: string;
}

export interface PortfolioData {
  profile: Profile;
  achievements: Achievement[];
  gallery: GalleryItem[];
  socials: SocialLink[];
  location: LocationInfo;
  audioUrl?: string;
}
