
import React, { useState, useRef, useEffect } from 'react';
import { SparklesIcon, PlusIcon, TrashIcon, DownloadIcon, CheckIcon } from './components/Icons';
import ResumePreview from './components/ResumePreview';
import { generateProfessionalResume, generateCoverLetter } from './services/geminiService';
import { ResumeData, AIResumeOutput, AICoverLetterOutput } from './types';
import { PaymentModal } from './components/PaymentModal';
import { LandingPage } from './components/LandingPage';
import './index.css'

// UI Labels (English Only)
const UI = {
  new: "New",
  clearData: "Clear all data and start a new session",
  edit: "Edit",
  preview: "Preview",
  download: "Download PDF",
  downloaded: "Downloaded",
  unlock: "Download PDF (10 FCFA)",
  loadSample: "Load Sample",
  resume: "Resume",
  cv: "CV",
  coverLetter: "Cover Letter",
  cvDetails: "CV Details",
  resumeDetails: "Resume Details",
  letterDetails: "Letter Details",
  craftLetter: "Craft a persuasive letter.",
  buildProfile: "Build your professional profile.",
  matchingStyle: "Matching Style",
  accentColor: "Accent Color",
  targetRole: "Target Job Role",
  recipientDetails: "Recipient Details",
  jobContext: "Job Context",
  personalInfo: "Personal Information",
  workExperience: "Work Experience",
  internships: "Internships",
  volunteering: "Volunteering",
  education: "Education",
  projects: "Projects",
  projectsResearch: "Projects / Research",
  skillsExtra: "Skills & Extra",
  generate: "Generate",
  generating: "Generating...",
  polishing: "Polishing with AI...",
  success: "Success!",
  addJob: "Add Job",
  addInternship: "Add Internship",
  addVolunteering: "Add Volunteering",
  addSchool: "Add School",
  addProject: "Add Project",
  addEntry: "Add Entry"
};

const generateId = () => Math.random().toString(36).substring(2, 9);

const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const hasSessionDownloaded = (sessionId: string): boolean => {
  const downloadedSessions = JSON.parse(localStorage.getItem('downloadedSessions') || '[]');
  return downloadedSessions.includes(sessionId);
};

const markSessionAsDownloaded = (sessionId: string) => {
  const downloadedSessions = JSON.parse(localStorage.getItem('downloadedSessions') || '[]');
  if (!downloadedSessions.includes(sessionId)) {
    downloadedSessions.push(sessionId);
    localStorage.setItem('downloadedSessions', JSON.stringify(downloadedSessions));
  }
};

// Locale-aware date formatter
// Locale-aware date formatter
const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const [year, month] = dateStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

const ROLES = [
  "Software Engineer",
  "Data Entry Specialist",
  "Project Manager",
  "Marketing Specialist",
  "Sales Representative",
  "Customer Support Agent",
  "Graphic Designer",
  "Accountant",
  "Human Resources Manager",
  "Nurse / Healthcare",
  "Teacher / Educator",
  "Business Analyst",
  "Research Scientist",
  "Academic Professor",
  "Senior Executive",
  "Student / Intern",
  "Other"
];

// Enhanced color palette with better contrast and modern appeal
const COLORS = [
  { name: "Deep Navy", hex: "#1a2332", class: "bg-slate-900" },
  { name: "Ocean Teal", hex: "#4a9b8e", class: "bg-teal-700" },
  { name: "Forest Green", hex: "#166534", class: "bg-green-800" },
  { name: "Warm Coral", hex: "#ff6b6b", class: "bg-red-500" },
  { name: "Royal Blue", hex: "#2563eb", class: "bg-blue-600" },
  { name: "Charcoal", hex: "#374151", class: "bg-gray-700" },
  { name: "Burgundy", hex: "#7f1d1d", class: "bg-red-900" },
];

const INITIAL_DATA: ResumeData = {
  language: 'en',
  mode: 'resume',
  template: 'modern',
  themeColor: '#1a2332',
  fullName: '',
  email: '',
  phone: '',
  location: '',
  linkedin: '',
  website: '',
  photo: '',
  targetRole: '',
  summary: '',
  experience: [],
  internships: [],
  volunteering: [],
  education: [],
  projects: [],
  skills: '',
  languages: '',
  achievements: '',
  publications: '',
  certifications: '',
  recipientName: '',
  recipientRole: '',
  companyName: '',
  companyAddress: '',
  jobDescription: '',
  coverLetterBody: '',
  isPaid: false,
  paymentReference: '',
  sessionId: '',
  hasDownloaded: false
};

const SAMPLE_DATA: ResumeData = {
  language: 'en',
  mode: 'resume',
  template: 'modern',
  themeColor: '#1a2332',
  fullName: 'Sarah Johnson',
  email: 'sarah.johnson@email.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  linkedin: 'linkedin.com/in/sarahjohnson',
  website: 'sarahjohnson.dev',
  photo: '',
  targetRole: 'Software Engineer',
  summary: 'Full-stack developer with 5+ years of experience building scalable web applications. Passionate about clean code, user experience, and mentoring junior developers.',
  skills: 'JavaScript, TypeScript, React, Node.js, Python, PostgreSQL, AWS, Docker, Kubernetes, GraphQL',
  languages: 'English (Native), Spanish (Conversational)',
  achievements: 'Led team of 5 developers to launch SaaS platform\nReduced page load time by 40% through optimization\nMentored 3 junior developers to senior positions',
  publications: 'Building Scalable React Applications (TechBlog 2024)',
  certifications: 'AWS Certified Solutions Architect\nGoogle Cloud Professional Developer',
  experience: [
    {
      id: 'exp1',
      company: 'TechFlow Solutions',
      role: 'Senior Software Engineer',
      dates: 'March 2022 - Present',
      startDate: '2022-03',
      endDate: '',
      isCurrent: true,
      description: 'Lead development of customer-facing dashboard using React and Node.js. Implemented real-time analytics features that increased user engagement by 35%.'
    },
    {
      id: 'exp2',
      company: 'InnovateCorp',
      role: 'Software Engineer',
      dates: 'June 2019 - February 2022',
      startDate: '2019-06',
      endDate: '2022-02',
      isCurrent: false,
      description: 'Built RESTful APIs and microservices architecture. Collaborated with design team to implement responsive UI components.'
    }
  ],
  internships: [
    {
      id: 'int1',
      company: 'Google',
      role: 'Software Engineering Intern',
      dates: 'Summer 2018',
      startDate: '2018-06',
      endDate: '2018-08',
      isCurrent: false,
      description: 'Worked on Gmail frontend team, implementing new features and improving performance metrics.'
    }
  ],
  volunteering: [
    {
      id: 'vol1',
      company: 'Code for Good',
      role: 'Tech Mentor',
      dates: '2020 - Present',
      startDate: '2020-01',
      endDate: '',
      isCurrent: true,
      description: 'Teach web development to underrepresented communities. Organized 12 coding workshops reaching 200+ participants.'
    }
  ],
  projects: [
    {
      id: 'proj1',
      name: 'E-Commerce Platform',
      link: 'https://github.com/sarah/ecommerce-platform',
      dates: '2023',
      startDate: '2023-01',
      endDate: '2023-12',
      isCurrent: false,
      description: 'Full-stack e-commerce solution with payment integration, inventory management, and real-time order tracking.'
    }
  ],
  education: [
    {
      id: 'edu1',
      school: 'Stanford University',
      degree: 'B.S. Computer Science',
      dates: '2015 - 2019',
      startDate: '2015-09',
      endDate: '2019-06',
      isCurrent: false
    }
  ],
  recipientName: 'Hiring Manager',
  recipientRole: 'Technical Recruiter',
  companyName: 'Tech Innovations Inc',
  companyAddress: '123 Innovation Drive, San Francisco, CA 94105',
  jobDescription: 'Seeking experienced full-stack developer to join our growing team. Must have React, Node.js experience and passion for clean code.',
  isPaid: false,
  sessionId: '',
  hasDownloaded: false
};

export default function App() {
  const [showLanding, setShowLanding] = useState(true);

  const [data, setData] = useState<ResumeData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('resumeData');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          // Ensure language property exists for older saves
          if (!parsed.language) parsed.language = 'en';

          if (parsed.sessionId && hasSessionDownloaded(parsed.sessionId)) {
            return {
              ...parsed,
              isPaid: false,
              hasDownloaded: true,
              paymentReference: undefined
            };
          }

          if (!parsed.sessionId) {
            parsed.sessionId = generateSessionId();
          }

          return parsed;
        } catch (e) {
          console.error('Failed to parse saved resume data');
        }
      }
      return { ...INITIAL_DATA, sessionId: generateSessionId() };
    }
    return { ...INITIAL_DATA, sessionId: generateSessionId() };
  });

  // Helper to get current UI text
  const t = UI;

  const [aiOutput, setAiOutput] = useState<AIResumeOutput | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aiOutput');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [aiCoverLetter, setAiCoverLetter] = useState<AICoverLetterOutput | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('aiCoverLetter');
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const printRef = useRef<any>(null); // Updated type to allow method access
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (aiOutput) localStorage.setItem('aiOutput', JSON.stringify(aiOutput));
  }, [aiOutput]);

  useEffect(() => {
    if (aiCoverLetter) localStorage.setItem('aiCoverLetter', JSON.stringify(aiCoverLetter));
  }, [aiCoverLetter]);

  const handleStartApp = () => {
    setShowLanding(false);
    localStorage.setItem('hasStarted', 'true');
  };

  const resetData = () => {
    if (confirm("This will clear ALL your current data and start a new session. Are you sure?")) {
      const newSessionId = generateSessionId();
      const resetState = { ...INITIAL_DATA, sessionId: newSessionId };

      setData(resetState);
      setAiOutput(null);
      setAiCoverLetter(null);
      localStorage.removeItem('resumeData');
      localStorage.removeItem('aiOutput');
      localStorage.removeItem('aiCoverLetter');
    }
  };

  const handleDownloadClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!data.isPaid) {
      setIsPaymentModalOpen(true);
      return;
    }
    executeDownload();
  };

  const handlePaymentSuccess = () => {
    const newSessionId = generateSessionId();
    setData(prev => ({
      ...prev,
      isPaid: true,
      hasDownloaded: false,
      sessionId: newSessionId
    }));
    setIsPaymentModalOpen(false);
    setShowSuccessAnimation(true);
    setTimeout(() => setShowSuccessAnimation(false), 3000);
  };

  const executeDownload = () => {
    const originalTitle = document.title;
    if (data.fullName) {
      const type = data.mode === 'cover-letter' ? 'Cover_Letter' : data.mode === 'cv' ? 'CV' : 'Resume';
      document.title = `${data.fullName.replace(' ', '_')}_${type}`;
    }

    setActiveTab('preview');

    setTimeout(() => {
      window.print();
      document.title = originalTitle;

      setTimeout(() => {
        if (data.sessionId) {
          markSessionAsDownloaded(data.sessionId);
          setData(prev => ({
            ...prev,
            hasDownloaded: true,
            isPaid: false
          }));
        }
      }, 1000);
    }, 500);
  };

  const handleImageDownload = async (format: 'png' | 'jpeg' | 'svg') => {
    if (!data.isPaid) {
      setIsPaymentModalOpen(true);
      return;
    }

    setActiveTab('preview');
    setShowDownloadMenu(false);

    // Wait for preview to render if needed
    setTimeout(async () => {
      if (printRef.current && printRef.current.downloadAsImage) {
        await printRef.current.downloadAsImage(format);

        if (data.sessionId) {
          markSessionAsDownloaded(data.sessionId);
          setData(prev => ({
            ...prev,
            hasDownloaded: true,
            isPaid: false
          }));
        }
      } else {
        alert("Preview not ready. Please try again.");
      }
    }, 500);
  };

  const handleAiGenerate = async () => {
    if (!data.targetRole) {
      alert("Please select a target role/niche first.");
      return;
    }

    setIsGenerating(true);
    try {
      if (data.mode === 'cover-letter') {
        const result = await generateCoverLetter(data);
        setAiCoverLetter(result);
      } else {
        const result = await generateProfessionalResume(data);
        setAiOutput(result);
      }
      setActiveTab('preview');
      setShowSuccessAnimation(true);
      setTimeout(() => setShowSuccessAnimation(false), 2000);
    } catch (error) {
      alert("Failed to generate. Please ensure your API key is valid and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSampleData = () => {
    if (confirm("This will replace your current data with sample data. Continue?")) {
      setData({ ...SAMPLE_DATA, mode: data.mode, language: data.language, isPaid: false });
      setAiOutput(null);
      setAiCoverLetter(null);
    }
  };

  const switchMode = (mode: 'resume' | 'cv' | 'cover-letter') => {
    if (mode !== data.mode) {
      let defaultTemplate = data.template;
      if (mode === 'cv' && !data.template.startsWith('cv')) defaultTemplate = 'cv-corporate';
      if (mode === 'resume' && data.template.startsWith('cv')) defaultTemplate = 'modern';

      setData(prev => ({ ...prev, mode, template: defaultTemplate }));
    }
  };

  const switchLanguage = (lang: 'en' | 'fr') => {
    setData(prev => ({ ...prev, language: lang }));
  };

  const updateField = (field: keyof ResumeData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSizeMB = 2;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;

      if (file.size > maxSizeBytes) {
        alert(`Image is too large. Maximum size is ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }

      if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        updateField('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    updateField('photo', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateDateRange = (
    type: 'experience' | 'education' | 'projects' | 'internships' | 'volunteering',
    id: string,
    field: 'startDate' | 'endDate' | 'isCurrent',
    value: any
  ) => {
    setData(prev => {
      const list = prev[type] as any[];
      return {
        ...prev,
        [type]: list.map(item => {
          if (item.id !== id) return item;

          const updatedItem = { ...item, [field]: value };

          if (field === 'isCurrent' && value === true) {
            updatedItem.endDate = '';
          }

          const startStr = formatDate(updatedItem.startDate);
          const endStr = updatedItem.isCurrent ? 'Present' : formatDate(updatedItem.endDate);

          updatedItem.dates = startStr && endStr
            ? `${startStr} - ${endStr}`
            : startStr || endStr || '';

          return updatedItem;
        })
      };
    });
  };

  const addItem = (type: 'experience' | 'education' | 'projects' | 'internships' | 'volunteering') => {
    const newItem: any = { id: generateId(), dates: '', startDate: '', endDate: '', isCurrent: false };

    if (type === 'education') {
      newItem.school = '';
      newItem.degree = '';
    } else if (type === 'projects') {
      newItem.name = '';
      newItem.link = '';
      newItem.description = '';
    } else {
      newItem.company = '';
      newItem.role = '';
      newItem.description = '';
    }

    setData(prev => ({
      ...prev,
      [type]: [...(prev[type] as any[]), newItem]
    }));
  };

  const removeItem = (type: 'experience' | 'education' | 'projects' | 'internships' | 'volunteering', id: string) => {
    setData(prev => ({
      ...prev,
      [type]: (prev[type] as any[]).filter(item => item.id !== id)
    }));
  };

  const updateItemField = (type: 'experience' | 'education' | 'projects' | 'internships' | 'volunteering', id: string, field: string, value: string) => {
    setData(prev => {
      const list = prev[type] as any[];
      return {
        ...prev,
        [type]: list.map(item => item.id === id ? { ...item, [field]: value } : item)
      };
    });
  };

  if (showLanding) {
    return <LandingPage onStart={handleStartApp} />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 print:bg-white print:h-auto print:overflow-visible">
      {/* Enhanced Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 print:hidden shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={resetData}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: data.themeColor }}>
              <SparklesIcon className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-800 group-hover:text-slate-600 transition-colors">ResumeAI</span>
          </div>

          {/* Center: Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl mx-2 sm:mx-8">
            <button
              onClick={() => switchMode('resume')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${data.mode === 'resume'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
            >
              {t.resume}
            </button>
            <button
              onClick={() => switchMode('cv')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${data.mode === 'cv'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
            >
              {t.cv}
            </button>
            <button
              onClick={() => switchMode('cover-letter')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${data.mode === 'cover-letter'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                }`}
            >
              {t.coverLetter}
            </button>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={loadSampleData}
              className="text-sm font-medium text-slate-600 hover:text-slate-800 transition-colors hidden md:block"
            >
              {t.loadSample}
            </button>

            <button
              onClick={resetData}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-all hover:scale-105"
              title={t.clearData}
            >
              <TrashIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{t.new}</span>
            </button>

            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'edit'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {t.edit}
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'preview'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
                  }`}
              >
                {t.preview}
              </button>
            </div>

            {/* Updated Download Button with Explicit Text */}
            {/* Download Dropdown */}
            <div className="relative">
              <button
                onClick={() => {
                  if (!data.isPaid) {
                    setIsPaymentModalOpen(true);
                  } else {
                    setShowDownloadMenu(!showDownloadMenu);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:scale-105 shadow-sm ${data.hasDownloaded
                  ? 'bg-slate-400 text-white cursor-not-allowed'
                  : data.isPaid
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-slate-900 text-white hover:bg-slate-800 ring-2 ring-offset-2 ring-slate-900'
                  }`}
              >
                {data.hasDownloaded ? (
                  <>
                    <CheckIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.downloaded}</span>
                  </>
                ) : data.isPaid ? (
                  <>
                    <DownloadIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t.download}</span>
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">{t.unlock}</span>
                  </>
                )}
              </button>

              {showDownloadMenu && data.isPaid && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                  <button onClick={handleDownloadClick} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2 border-b border-slate-50">
                    <span className="font-bold text-red-500">PDF</span> (Best for Print)
                  </button>
                  <button onClick={() => handleImageDownload('png')} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <span className="font-bold text-blue-500">PNG</span> (High Quality)
                  </button>
                  <button onClick={() => handleImageDownload('jpeg')} className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                    <span className="font-bold text-green-500">JPG</span> (Small Size)
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        amountXAF={10}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto p-0 sm:p-4 sm:px-6 lg:px-8 py-4 sm:py-8 flex flex-col lg:flex-row gap-8 items-start print:p-0 print:m-0 print:max-w-none print:block">

        <div className={`flex-1 w-full transition-all duration-300 ${activeTab === 'edit' ? 'block opacity-100' : 'hidden lg:block lg:w-1/3 lg:flex-none'} print:hidden`}>
          <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
            <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  {data.mode === 'cv' ? t.cvDetails : data.mode === 'cover-letter' ? t.letterDetails : t.resumeDetails}
                </h2>
                <p className="text-sm text-slate-600 mt-1">
                  {data.mode === 'cover-letter' ? t.craftLetter : t.buildProfile}
                </p>
              </div>
              <button onClick={loadSampleData} className="text-sm text-slate-600 hover:text-slate-800 font-medium transition-colors">
                {t.loadSample}
              </button>
            </div>

            <div className="p-6 space-y-8 h-[calc(100vh-180px)] overflow-y-auto pb-20">

              {data.mode === 'cover-letter' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                  <section>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">{t.matchingStyle}</label>
                    <p className="text-xs text-slate-500 mb-4">Select the template style to match your Resume/CV.</p>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white hover:border-slate-400"
                      value={data.template}
                      onChange={(e) => updateField('template', e.target.value)}
                    >
                      <option value="modern">Modern</option>
                      <option value="classic">Classic</option>
                      <option value="sidebar">Sidebar</option>
                      <option value="minimalist">Executive</option>
                      <option value="cv-corporate">Corporate CV</option>
                      <option value="cv-academic">Academic CV</option>
                      <option value="cv-executive">Executive CV</option>
                    </select>

                    <div className="mt-5">
                      <label className="block text-sm font-semibold text-slate-700 mb-3">{t.accentColor}</label>
                      <div className="flex flex-wrap gap-4">
                        {COLORS.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => updateField('themeColor', color.hex)}
                            className={`w-10 h-10 rounded-full shadow-md border-2 transition-all flex items-center justify-center hover:scale-110 ${data.themeColor === color.hex ? 'border-slate-900 scale-110' : 'border-transparent'
                              }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </section>

                  <section>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">{t.targetRole}</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white hover:border-slate-400"
                      value={data.targetRole}
                      onChange={(e) => updateField('targetRole', e.target.value)}
                    >
                      <option value="" disabled>Select role...</option>
                      {ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </section>

                  <section className="space-y-4 border-t border-slate-100 pt-6">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">1</span>
                      {t.recipientDetails}
                    </h3>
                    <div className="grid grid-cols-1 gap-4">
                      <input
                        type="text"
                        placeholder="Company Name"
                        className="input-field enhanced"
                        value={data.companyName}
                        onChange={(e) => updateField('companyName', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Hiring Manager Name (Optional)"
                        className="input-field enhanced"
                        value={data.recipientName}
                        onChange={(e) => updateField('recipientName', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Recipient Role (e.g. HR Manager)"
                        className="input-field enhanced"
                        value={data.recipientRole}
                        onChange={(e) => updateField('recipientRole', e.target.value)}
                      />
                      <input
                        type="text"
                        placeholder="Company Address (Optional)"
                        className="input-field enhanced"
                        value={data.companyAddress}
                        onChange={(e) => updateField('companyAddress', e.target.value)}
                      />
                    </div>
                  </section>

                  <section className="space-y-4 border-t border-slate-100 pt-6">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm font-bold">2</span>
                      {t.jobContext}
                    </h3>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">Job Description (Paste key parts here)</label>
                      <textarea
                        placeholder="Paste the job description or key requirements here. The AI will tailor your letter to these details."
                        className="input-field enhanced w-full h-40 resize-none"
                        value={data.jobDescription}
                        onChange={(e) => updateField('jobDescription', e.target.value)}
                      />
                    </div>
                  </section>

                  <div className="bg-blue-50 p-4 rounded-xl text-xs text-blue-800 border border-blue-200">
                    <p><strong>Note:</strong> The AI will also use your profile information (Experience, Skills, Name) from the "Resume" tab to build your case.</p>
                  </div>
                </div>
              ) : (
                <>
                  <section className="space-y-5">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">
                        {data.mode === 'cv' ? 'CV Template' : 'Resume Layout'}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {data.mode === 'resume' ? (
                          <>
                            <button
                              onClick={() => updateField('template', 'classic')}
                              className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'classic'
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                              Classic
                            </button>
                            <button
                              onClick={() => updateField('template', 'modern')}
                              className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'modern'
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                              Modern (2-Col)
                            </button>
                            <button
                              onClick={() => updateField('template', 'sidebar')}
                              className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'sidebar'
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                              Sidebar
                            </button>
                            <button
                              onClick={() => updateField('template', 'minimalist')}
                              className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'minimalist'
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                              Executive
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => updateField('template', 'cv-corporate')}
                              className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'cv-corporate'
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                              Corporate (Photo)
                            </button>
                            <button
                              onClick={() => updateField('template', 'cv-executive')}
                              className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'cv-executive'
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                              Executive
                            </button>
                            <button
                              onClick={() => updateField('template', 'cv-academic')}
                              className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'cv-academic'
                                ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                }`}
                            >
                              Academic
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-3">{t.accentColor}</label>
                      <div className="flex flex-wrap gap-4">
                        {COLORS.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => updateField('themeColor', color.hex)}
                            className={`w-10 h-10 rounded-full shadow-md border-2 transition-all flex items-center justify-center hover:scale-110 ${data.themeColor === color.hex ? 'border-slate-900 scale-110' : 'border-transparent'
                              }`}
                            style={{ backgroundColor: color.hex }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </section>

                  <section>
                    <label className="block text-sm font-semibold text-slate-700 mb-3">Target Job Role / Niche</label>
                    <select
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white hover:border-slate-400"
                      value={data.targetRole}
                      onChange={(e) => updateField('targetRole', e.target.value)}
                    >
                      <option value="" disabled>Select a niche...</option>
                      {ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </section>

                  <section className="space-y-4">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
                      {t.personalInfo}
                    </h3>

                    <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
                      <div className="relative w-20 h-20 rounded-full overflow-hidden bg-slate-200 shrink-0 border-2 border-white shadow-md">
                        {data.photo ? (
                          <img src={data.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Profile Photo</label>
                        <div className="flex gap-3">
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="text-sm bg-white border border-blue-300 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-50 transition-all hover:scale-105"
                          >
                            Upload
                          </button>
                          {data.photo && (
                            <button
                              onClick={removePhoto}
                              className="text-sm text-red-600 hover:text-red-800 px-3 py-2 transition-colors"
                            >
                              Remove
                            </button>
                          )}
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handlePhotoUpload}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2">Recommended for CVs. Square crop works best.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" placeholder="Full Name" className="input-field enhanced" value={data.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
                      <input type="email" placeholder="Email" className="input-field enhanced" value={data.email} onChange={(e) => updateField('email', e.target.value)} />
                      <input type="text" placeholder="Phone" className="input-field enhanced" value={data.phone} onChange={(e) => updateField('phone', e.target.value)} />
                      <input type="text" placeholder="City, Country" className="input-field enhanced" value={data.location} onChange={(e) => updateField('location', e.target.value)} />
                      <input type="text" placeholder="LinkedIn URL" className="input-field enhanced" value={data.linkedin} onChange={(e) => updateField('linkedin', e.target.value)} />
                      <input type="text" placeholder="Portfolio / Website" className="input-field enhanced" value={data.website} onChange={(e) => updateField('website', e.target.value)} />
                    </div>
                  </section>

                  <section className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
                        {t.workExperience}
                      </h3>
                      <button onClick={() => addItem('experience')} className="flex items-center gap-1.5 px-4 py-2 text-blue-600 text-sm font-medium bg-blue-50 hover:bg-blue-100 rounded-lg transition-all hover:scale-105">
                        <PlusIcon className="w-4 h-4" /> {t.addJob}
                      </button>
                    </div>

                    {data.experience.map((exp) => (
                      <div key={exp.id} className="p-5 bg-gradient-to-r from-slate-50 to-blue-50 rounded-xl border border-slate-200 space-y-4 relative group hover:shadow-md transition-shadow">
                        <button onClick={() => removeItem('experience', exp.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-white rounded">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input type="text" placeholder="Job Title" className="input-field enhanced" value={exp.role} onChange={(e) => updateItemField('experience', exp.id, 'role', e.target.value)} />
                          <input type="text" placeholder="Company" className="input-field enhanced" value={exp.company} onChange={(e) => updateItemField('experience', exp.id, 'company', e.target.value)} />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          <div className="flex-1 w-full sm:w-auto">
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Start Date</label>
                            <input
                              type="month"
                              className="input-field enhanced w-full"
                              value={exp.startDate || ''}
                              onChange={(e) => updateDateRange('experience', exp.id, 'startDate', e.target.value)}
                            />
                          </div>

                          {!exp.isCurrent && (
                            <div className="flex-1 w-full sm:w-auto">
                              <label className="text-xs font-medium text-slate-500 mb-1 block">End Date</label>
                              <input
                                type="month"
                                className="input-field enhanced w-full"
                                value={exp.endDate || ''}
                                onChange={(e) => updateDateRange('experience', exp.id, 'endDate', e.target.value)}
                              />
                            </div>
                          )}

                          <div className="flex items-center pt-4 pl-1">
                            <input
                              type="checkbox"
                              id={`current-exp-${exp.id}`}
                              checked={exp.isCurrent || false}
                              onChange={(e) => updateDateRange('experience', exp.id, 'isCurrent', e.target.checked)}
                              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                            />
                            <label htmlFor={`current-exp-${exp.id}`} className="ml-2 text-sm text-slate-700">Current</label>
                          </div>
                        </div>

                        <textarea
                          placeholder="Rough notes (e.g. 'Managed 5 people, used React')."
                          className="input-field enhanced w-full h-24 resize-none"
                          value={exp.description}
                          onChange={(e) => updateItemField('experience', exp.id, 'description', e.target.value)}
                        />
                      </div>
                    ))}
                  </section>

                  <section className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-sm font-bold">2b</span>
                        {t.internships}
                      </h3>
                      <button onClick={() => addItem('internships')} className="flex items-center gap-1.5 px-4 py-2 text-teal-600 text-sm font-medium bg-teal-50 hover:bg-teal-100 rounded-lg transition-all hover:scale-105">
                        <PlusIcon className="w-4 h-4" /> {t.addInternship}
                      </button>
                    </div>

                    {data.internships.map((int) => (
                      <div key={int.id} className="p-5 bg-gradient-to-r from-teal-50 to-cyan-50 rounded-xl border border-teal-200 space-y-4 relative group hover:shadow-md transition-shadow">
                        <button onClick={() => removeItem('internships', int.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-white rounded">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input type="text" placeholder="Intern Title" className="input-field enhanced" value={int.role} onChange={(e) => updateItemField('internships', int.id, 'role', e.target.value)} />
                          <input type="text" placeholder="Company" className="input-field enhanced" value={int.company} onChange={(e) => updateItemField('internships', int.id, 'company', e.target.value)} />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          <div className="flex-1 w-full sm:w-auto">
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Start Date</label>
                            <input
                              type="month"
                              className="input-field enhanced w-full"
                              value={int.startDate || ''}
                              onChange={(e) => updateDateRange('internships', int.id, 'startDate', e.target.value)}
                            />
                          </div>

                          {!int.isCurrent && (
                            <div className="flex-1 w-full sm:w-auto">
                              <label className="text-xs font-medium text-slate-500 mb-1 block">End Date</label>
                              <input
                                type="month"
                                className="input-field enhanced w-full"
                                value={int.endDate || ''}
                                onChange={(e) => updateDateRange('internships', int.id, 'endDate', e.target.value)}
                              />
                            </div>
                          )}
                        </div>

                        <textarea
                          placeholder="What did you learn? What did you build?"
                          className="input-field enhanced w-full h-20 resize-none"
                          value={int.description}
                          onChange={(e) => updateItemField('internships', int.id, 'description', e.target.value)}
                        />
                      </div>
                    ))}
                  </section>

                  <section className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm font-bold">2c</span>
                        {t.volunteering}
                      </h3>
                      <button onClick={() => addItem('volunteering')} className="flex items-center gap-1.5 px-4 py-2 text-orange-600 text-sm font-medium bg-orange-50 hover:bg-orange-100 rounded-lg transition-all hover:scale-105">
                        <PlusIcon className="w-4 h-4" /> {t.addVolunteering}
                      </button>
                    </div>

                    {data.volunteering.map((vol) => (
                      <div key={vol.id} className="p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-200 space-y-4 relative group hover:shadow-md transition-shadow">
                        <button onClick={() => removeItem('volunteering', vol.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-white rounded">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input type="text" placeholder="Role" className="input-field enhanced" value={vol.role} onChange={(e) => updateItemField('volunteering', vol.id, 'role', e.target.value)} />
                          <input type="text" placeholder="Organization" className="input-field enhanced" value={vol.company} onChange={(e) => updateItemField('volunteering', vol.id, 'company', e.target.value)} />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          <div className="flex-1 w-full sm:w-auto">
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Start Date</label>
                            <input
                              type="month"
                              className="input-field enhanced w-full"
                              value={vol.startDate || ''}
                              onChange={(e) => updateDateRange('volunteering', vol.id, 'startDate', e.target.value)}
                            />
                          </div>

                          {!vol.isCurrent && (
                            <div className="flex-1 w-full sm:w-auto">
                              <label className="text-xs font-medium text-slate-500 mb-1 block">End Date</label>
                              <input
                                type="month"
                                className="input-field enhanced w-full"
                                value={vol.endDate || ''}
                                onChange={(e) => updateDateRange('volunteering', vol.id, 'endDate', e.target.value)}
                              />
                            </div>
                          )}
                        </div>

                        <textarea
                          placeholder="Impact, community service, leadership..."
                          className="input-field enhanced w-full h-20 resize-none"
                          value={vol.description}
                          onChange={(e) => updateItemField('volunteering', vol.id, 'description', e.target.value)}
                        />
                      </div>
                    ))}
                  </section>

                  <section className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">3</span>
                        {t.education}
                      </h3>
                      <button onClick={() => addItem('education')} className="flex items-center gap-1.5 px-4 py-2 text-blue-600 text-sm font-medium bg-blue-50 hover:bg-blue-100 rounded-lg transition-all hover:scale-105">
                        <PlusIcon className="w-4 h-4" /> {t.addSchool}
                      </button>
                    </div>
                    {data.education.map((edu) => (
                      <div key={edu.id} className="p-5 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200 space-y-4 relative group hover:shadow-md transition-shadow">
                        <button onClick={() => removeItem('education', edu.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-white rounded">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <input type="text" placeholder="School / University" className="input-field enhanced w-full" value={edu.school} onChange={(e) => updateItemField('education', edu.id, 'school', e.target.value)} />
                        <input type="text" placeholder="Degree / Major" className="input-field enhanced w-full" value={edu.degree} onChange={(e) => updateItemField('education', edu.id, 'degree', e.target.value)} />

                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          <div className="flex-1 w-full sm:w-auto">
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Start Date</label>
                            <input
                              type="month"
                              className="input-field enhanced w-full"
                              value={edu.startDate || ''}
                              onChange={(e) => updateDateRange('education', edu.id, 'startDate', e.target.value)}
                            />
                          </div>

                          {!edu.isCurrent && (
                            <div className="flex-1 w-full sm:w-auto">
                              <label className="text-xs font-medium text-slate-500 mb-1 block">End/Grad Date</label>
                              <input
                                type="month"
                                className="input-field enhanced w-full"
                                value={edu.endDate || ''}
                                onChange={(e) => updateDateRange('education', edu.id, 'endDate', e.target.value)}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </section>

                  <section className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">4</span>
                        {data.mode === 'cv' ? t.projectsResearch : t.projects}
                      </h3>
                      <button onClick={() => addItem('projects')} className="flex items-center gap-1.5 px-4 py-2 text-blue-600 text-sm font-medium bg-blue-50 hover:bg-blue-100 rounded-lg transition-all hover:scale-105">
                        <PlusIcon className="w-4 h-4" /> {data.mode === 'cv' ? t.addEntry : t.addProject}
                      </button>
                    </div>
                    {data.projects.map((proj) => (
                      <div key={proj.id} className="p-5 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200 space-y-4 relative group hover:shadow-md transition-shadow">
                        <button onClick={() => removeItem('projects', proj.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-white rounded">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input type="text" placeholder="Name / Title" className="input-field enhanced" value={proj.name} onChange={(e) => updateItemField('projects', proj.id, 'name', e.target.value)} />
                          <input type="text" placeholder="Link (optional)" className="input-field enhanced" value={proj.link} onChange={(e) => updateItemField('projects', proj.id, 'link', e.target.value)} />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                          <div className="flex-1 w-full sm:w-auto">
                            <label className="text-xs font-medium text-slate-500 mb-1 block">Start Date</label>
                            <input
                              type="month"
                              className="input-field enhanced w-full"
                              value={proj.startDate || ''}
                              onChange={(e) => updateDateRange('projects', proj.id, 'startDate', e.target.value)}
                            />
                          </div>

                          {!proj.isCurrent && (
                            <div className="flex-1 w-full sm:w-auto">
                              <label className="text-xs font-medium text-slate-500 mb-1 block">End Date</label>
                              <input
                                type="month"
                                className="input-field enhanced w-full"
                                value={proj.endDate || ''}
                                onChange={(e) => updateDateRange('projects', proj.id, 'endDate', e.target.value)}
                              />
                            </div>
                          )}
                        </div>

                        <textarea
                          placeholder="Description, key findings, or details."
                          className="input-field enhanced w-full h-20 resize-none"
                          value={proj.description}
                          onChange={(e) => updateItemField('projects', proj.id, 'description', e.target.value)}
                        />
                      </div>
                    ))}
                  </section>

                  <section className="space-y-5">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-3">
                      <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">5</span>
                      {t.skillsExtra}
                    </h3>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">Skills (comma separated)</label>
                      <textarea
                        placeholder="Python, Leadership, SEO, Project Management..."
                        className="input-field enhanced w-full h-24 resize-none"
                        value={data.skills}
                        onChange={(e) => updateField('skills', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">Languages</label>
                      <textarea
                        placeholder="English (Native), Spanish (Conversational)..."
                        className="input-field enhanced w-full h-20 resize-none"
                        value={data.languages}
                        onChange={(e) => updateField('languages', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">Achievements (One per line)</label>
                      <textarea
                        placeholder="Winner of Hackathon 2023&#10;Dean's List 2020"
                        className="input-field enhanced w-full h-24 resize-none"
                        value={data.achievements}
                        onChange={(e) => updateField('achievements', e.target.value)}
                      />
                    </div>

                    {data.mode === 'cv' && (
                      <>
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="block text-xs font-medium text-slate-500 mb-2">Publications (One per line)</label>
                          <textarea
                            placeholder="Title of Paper, Journal, Date...&#10;Book Chapter Title, Publisher..."
                            className="input-field enhanced w-full h-24 resize-none"
                            value={data.publications}
                            onChange={(e) => updateField('publications', e.target.value)}
                          />
                        </div>
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="block text-xs font-medium text-slate-500 mb-2">Certifications & Licenses (One per line)</label>
                          <textarea
                            placeholder="AWS Certified Solutions Architect&#10;Project Management Professional (PMP)"
                            className="input-field enhanced w-full h-24 resize-none"
                            value={data.certifications}
                            onChange={(e) => updateField('certifications', e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-2">Summary Notes (Optional)</label>
                      <textarea
                        placeholder="Any specific career goals or highlights for the summary..."
                        className="input-field enhanced w-full h-24 resize-none"
                        value={data.summary}
                        onChange={(e) => updateField('summary', e.target.value)}
                      />
                    </div>
                  </section>
                </>
              )}
            </div>

            <div className="p-6 border-t border-slate-200 bg-gradient-to-r from-slate-50 to-white sticky bottom-0 z-10">
              <button
                onClick={handleAiGenerate}
                disabled={isGenerating || !data.targetRole}
                className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98] ${isGenerating
                  ? 'bg-blue-400 cursor-wait'
                  : !data.targetRole
                    ? 'bg-slate-300 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-xl'
                  }`}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {data.mode === 'cover-letter' ? t.generating : t.polishing}
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    {t.generate} {data.mode === 'cover-letter' ? t.coverLetter : data.mode === 'cv' ? t.cv : t.resume}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className={`flex-1 flex justify-center transition-opacity duration-300 ${activeTab === 'preview' ? 'block opacity-100' : 'hidden lg:block lg:w-2/3'} print:block print:w-full print:static`}>
          <div className="sticky top-24 w-full print:static print:max-w-none print:w-full flex flex-col items-center">
            {activeTab === 'preview' && !aiOutput && !aiCoverLetter && !isGenerating && (
              <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-800 rounded-xl text-sm print:hidden w-full max-w-lg">
                {data.language === 'fr'
                  ? "L'aperçu montre actuellement les données brutes. Cliquez sur « Générer » pour laisser l'IA les réécrire professionnellement."
                  : "The preview currently shows raw data. Click \"Generate\" to let AI rewrite it professionally."
                }
              </div>
            )}

            <div className="w-full overflow-hidden flex justify-center print:overflow-visible">
              <div className="transform origin-top scale-[0.45] sm:scale-[0.65] md:scale-[0.85] xl:scale-100">
                <ResumePreview ref={printRef} raw={data} aiContent={aiOutput} aiCoverLetter={aiCoverLetter} />
              </div>
            </div>
          </div>
        </div>
      </main>

      {showSuccessAnimation && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg animate-bounce">
            <div className="flex items-center gap-2">
              <CheckIcon className="w-5 h-5" />
              <span className="font-semibold">{t.success}</span>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .input-field.enhanced {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 0.75rem;
          border: 2px solid #e2e8f0;
          font-size: 0.875rem;
          outline: none;
          transition: all 0.2s ease;
          background: white;
        }
        .input-field.enhanced:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          transform: translateY(-1px);
        }
        .input-field.enhanced:hover {
          border-color: #cbd5e1;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .animate-in {
          animation: slideIn 0.3s ease-out;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
