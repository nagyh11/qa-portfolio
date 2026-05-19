export interface HeroContent {
  name: string;
  badge: string;
  title1: string;
  title2: string;
  description: string;
  location: string;
  certification: string;
  experience: string;
  profileImage: string;
}

export interface StatItem {
  value: number;
  suffix: string;
  label: string;
}

export interface ProfileDetail {
  icon: string;
  title: string;
  sub: string;
}

export interface AboutContent {
  bio: string;
  profileDetails: ProfileDetail[];
  stats: StatItem[];
}

export interface Experience {
  company: string;
  position: string;
  duration: string;
  current: boolean;
  items: string[];
}

export interface ToolCategory {
  title: string;
  icon: string;
  items: string[];
}

export interface Skill {
  name: string;
  level: number;
}

export interface SkillGroup {
  title: string;
  skills: Skill[];
}

export interface Certification {
  name: string;
  issuer: string;
  icon: string;
}

export interface Project {
  title: string;
  description: string;
  tech: string[];
  badge: string;
  github: string;
  link: string;
  image: string;
  showGithubLink?: boolean;
  showLiveUrl?: boolean;
}

export interface Achievement {
  value?: number;
  suffix?: string;
  label: string;
  icon: string;
  text?: boolean;
}

export interface ContactContent {
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  github: string;
}

export interface FooterContent {
  name: string;
  email: string;
  linkedin: string;
  github: string;
}

export interface CmsContent {
  hero: HeroContent;
  about: AboutContent;
  experiences: Experience[];
  tools: ToolCategory[];
  skills: SkillGroup[];
  certifications: Certification[];
  projects: Project[];
  achievements: Achievement[];
  contact: ContactContent;
  footer: FooterContent;
}
