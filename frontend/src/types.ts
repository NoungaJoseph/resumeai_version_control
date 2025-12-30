
export interface ExperienceItem {
  id: string;
  company: string;
  role: string;
  dates: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string;
  bullets?: string[]; // To handle both AI and user input
}

export interface AchievementItem {
  id: string;
  title: string;
  date?: string;
  description?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer?: string;
  date?: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  dates: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description?: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  link?: string;
  dates: string;
  startDate?: string;
  endDate?: string;
  isCurrent?: boolean;
  description: string;
  bullets?: string[];
}

export interface ResumeData {
  language: 'en' | 'fr';
  mode: 'resume' | 'cv' | 'cover-letter' | 'motivation-letter' | 'internship-letter' | 'visa-letter' | 'business-plan' | 'legal-agreement';
  template:
  | 'modern' | 'classic' | 'sidebar' | 'minimalist'
  | 'resume-ats' | 'resume-executive' | 'resume-creative' | 'resume-technical' | 'resume-entry'
  | 'cv-academic' | 'cv-executive' | 'cv-corporate' | 'cv-professional' | 'cv-classic'
  | 'cv-research' | 'cv-medical' | 'cv-faculty' | 'cv-scientific' | 'cv-international'
  | 'legal-lease' | 'legal-partnership' | 'legal-sale'
  | 'business-modern' | 'visa-official'; // New templates
  themeColor: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
  photo?: string;
  targetRole: string;
  summary: string;
  experience: ExperienceItem[];
  internships: ExperienceItem[];
  volunteering: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  skills: string;
  languages?: string;
  achievements: AchievementItem[]; // Restructured
  publications: string;
  certifications: CertificationItem[]; // Restructured

  // Cover Letter Specifics
  recipientName?: string;
  recipientRole?: string;
  companyName?: string;
  companyAddress?: string;
  jobDescription?: string;
  coverLetterBody?: string;

  // Motivation Letter Specifics
  organizationName?: string;
  positionApplied?: string;
  motivationText?: string;

  // Internship Specifics
  schoolName?: string;
  program?: string;
  educationLevel?: string;
  internshipStartDate?: string;
  internshipEndDate?: string;
  supervisorName?: string;
  expectedOutcomes?: string;

  // Visa Letter Specifics
  dob?: string;
  passportNumber?: string;
  passportIssueDate?: string;
  passportExpiryDate?: string;
  nationality?: string;
  destinationCountry?: string;
  embassyDetails?: string;
  travelStartDate?: string;
  travelEndDate?: string;
  travelPurpose?: string;
  sponsorshipType?: 'self' | 'sponsor';
  sponsorDetails?: string;
  accommodationDetails?: string;
  returnAssurance?: string;
  supportingDocuments?: string;

  // Business Plan Specifics
  businessName?: string;
  ownerName?: string;
  businessSector?: string;
  problemStatement?: string;
  solutionOverview?: string;
  targetCustomers?: string;
  competitors?: string;
  uniqueAdvantage?: string;
  revenueModel?: string;
  startupCosts?: string;
  operatingCosts?: string;
  expectedRevenue?: string;
  marketingStrategy?: string;
  longTermVision?: string;

  // Legal Specifics
  legalPartyA?: string;
  legalPartyB?: string;
  agreementDate?: string;
  agreementTerms?: string;
  financialValue?: string;

  // Customization
  fontFamily?: string;
  fontSize?: 'small' | 'medium' | 'large';
  margins?: 'narrow' | 'balanced' | 'wide';
  sectionSpacing?: 'compact' | 'standard' | 'relaxed';

  // Payment State
  isPaid: boolean;
  paymentReference?: string;

  // Session Management
  sessionId?: string;
  hasDownloaded?: boolean;
}

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
  achievements: { title: string; date?: string; description?: string }[];
  publications: string[];
  certifications: { name: string; issuer?: string; date?: string }[];
}

export interface AICoverLetterOutput {
  subject: string;
  salutation: string;
  opening: string;
  bodyParagraphs: string[];
  closing: string;
  signOff: string;
}
