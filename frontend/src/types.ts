
export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  dates: string;
  startDate?: string; // YYYY-MM format
  endDate?: string;   // YYYY-MM format
  isCurrent?: boolean;
  description: string; // Rough notes input by user
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  dates: string;
  startDate?: string; // YYYY-MM format
  endDate?: string;   // YYYY-MM format
  isCurrent?: boolean;
}

export interface ProjectItem {
  id: string;
  name: string;
  link?: string;
  dates: string; // e.g. "2020-2021"
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string;
}

export interface ResumeData {
  language: 'en' | 'fr'; // New field for bilingual support
  mode: 'resume' | 'cv' | 'cover-letter';
  template: 'classic' | 'sidebar' | 'modern' | 'minimalist' | 'cv-academic' | 'cv-executive' | 'cv-corporate' | 'cv-professional' | 'cv-classic';
  themeColor: string; // Hex code
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  photo?: string; // Base64 image string
  targetRole: string; // e.g., "Software Engineer"
  summary: string; // Auto-generated or user input
  experience: ExperienceItem[];
  internships: ExperienceItem[];
  volunteering: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: string; // Comma separated string for input
  languages?: string;
  achievements: string;
  publications: string;
  certifications: string;

  // Cover Letter Specifics
  recipientName?: string;
  recipientRole?: string; // e.g. Hiring Manager
  companyName?: string;
  companyAddress?: string;
  jobDescription?: string; // The JD to tailor the letter to
  coverLetterBody?: string; // The generated HTML/Text content

  // Payment State
  isPaid: boolean;
  paymentReference?: string;

  // Session Management
  sessionId?: string;
  hasDownloaded?: boolean;
}

// The structure expected back from the AI
export interface AIResumeOutput {
  summary: string;
  skills: string[];
  languages?: string[];
  experience: {
    company: string;
    role: string;
    dates: string;
    bullets: string[];
  }[];
  internships: {
    company: string;
    role: string;
    dates: string;
    bullets: string[];
  }[];
  volunteering: {
    company: string;
    role: string;
    dates: string;
    bullets: string[];
  }[];
  projects: {
    name: string;
    link?: string;
    dates: string;
    bullets: string[];
  }[];
  achievements: string[];
  publications: string[];
  certifications: string[];
}

// Structure for Cover Letter AI response
export interface AICoverLetterOutput {
  subject: string;
  salutation: string;
  opening: string; // The hook
  bodyParagraphs: string[]; // The argument/proof
  closing: string; // Call to action
  signOff: string;
}
