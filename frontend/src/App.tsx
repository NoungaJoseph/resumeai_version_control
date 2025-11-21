import React, { useState, useRef, useEffect } from 'react';
import { SparklesIcon, PlusIcon, TrashIcon, DownloadIcon } from './components/Icons';
import ResumePreview from './components/ResumePreview';
import { generateProfessionalResume, generateCoverLetter } from './services/geminiService';
import { ResumeData, AIResumeOutput, AICoverLetterOutput } from './types';
import { PaymentModal } from './components/PaymentModal';

// Utility for ID generation
const generateId = () => Math.random().toString(36).substring(2, 9);

// Helper to format YYYY-MM to "Mon YYYY"
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

const COLORS = [
  { name: "Navy Blue", hex: "#1e3a8a", class: "bg-blue-900" },
  { name: "Dark Teal", hex: "#0f766e", class: "bg-teal-700" },
  { name: "Forest Green", hex: "#166534", class: "bg-green-800" },
  { name: "Charcoal Gray", hex: "#374151", class: "bg-gray-700" },
  { name: "Royal Blue", hex: "#2563eb", class: "bg-blue-600" },
  { name: "Black", hex: "#000000", class: "bg-black" },
  { name: "Burgundy", hex: "#7f1d1d", class: "bg-red-900" },
];

const INITIAL_DATA: ResumeData = {
  mode: 'resume',
  template: 'modern',
  themeColor: '#1e3a8a',
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
  // Cover Letter
  recipientName: '',
  recipientRole: '',
  companyName: '',
  companyAddress: '',
  jobDescription: '',
  coverLetterBody: '',
  // Payment
  isPaid: false,
  paymentReference: ''
};

const SAMPLE_DATA: ResumeData = {
  mode: 'resume',
  template: 'modern',
  themeColor: '#1e3a8a',
  fullName: 'Rahul Kumar',
  email: 'rahulkumar2207@gmail.com',
  phone: '+91 8117244114',
  location: 'Bangalore, India',
  linkedin: 'linkedin.com/in/rahul-kumar',
  website: 'rahul.dev',
  photo: '',
  targetRole: 'Software Engineer',
  summary: 'Full Stack Developer specializing in MERN stack with experience in scalable web applications. Passionate about clean code and performance optimization.',
  skills: 'C/C++, Python, Javascript, Java, Scala, React.js, Django, Vue.js, Springboot, Flink, Spark, Postgres, MS-SQL, MySql, AWS Services, Docker, Kubernetes',
  languages: 'English (Professional), Hindi (Native)',
  achievements: 'AIR 756 in JEE Advance 2019\nWinner of Smart India Hackathon 2022\nPublished paper on Distributed Systems',
  publications: 'Distributed Graph Processing at Scale (IEEE 2022)',
  certifications: 'AWS Certified Solutions Architect\nOracle Certified Java Associate',
  experience: [
    {
      id: 'exp1',
      company: 'TechSolve Solutions',
      role: 'Software Development Engineer 1',
      dates: 'July 2024 - Present',
      startDate: '2024-07',
      endDate: '',
      isCurrent: true,
      description: 'Developed a responsive web application using React.js and TailwindCSS. Collaborated with team to implement RESTful API using Node.js. Optimized MongoDB queries.'
    }
  ],
  internships: [
    {
      id: 'int1',
      company: 'Google Summer of Code',
      role: 'Student Developer',
      dates: 'May 2023 - Aug 2023',
      startDate: '2023-05',
      endDate: '2023-08',
      isCurrent: false,
      description: 'Contributed to open source organization. Implemented new features for data visualization library.'
    }
  ],
  volunteering: [
    {
      id: 'vol1',
      company: 'Code for Good',
      role: 'Mentor',
      dates: '2022 - 2023',
      startDate: '2022-01',
      endDate: '2023-01',
      isCurrent: false,
      description: 'Mentored 50+ students in web development fundamentals.'
    }
  ],
  projects: [
    {
      id: 'proj1',
      name: 'TaskManager Pro',
      link: 'https://github.com/example/taskmanager',
      dates: '2019 - 2020',
      startDate: '2019-01',
      endDate: '2020-01',
      isCurrent: false,
      description: 'Developed TaskManager Pro, a task management web app. Implemented user authentication with JWT. Built using React.js, Node.js, MongoDB.'
    },
    {
      id: 'proj2',
      name: 'Portfolio Builder',
      link: '',
      dates: '2020 - 2021',
      startDate: '2020-01',
      endDate: '2021-01',
      isCurrent: false,
      description: 'Dynamic web app enabling users to create portfolios. Integrated drag-and-drop features using React.js. Deployed on AWS S3.'
    }
  ],
  education: [
    {
      id: 'edu1',
      school: 'IIT Kharagpur',
      degree: 'Integrated Dual Degree (Btech+Mtech)',
      dates: '2019 - 2024',
      startDate: '2019-08',
      endDate: '2024-05',
      isCurrent: false
    }
  ],
  // Sample Cover Letter Data
  recipientName: 'Sarah Jenkins',
  recipientRole: 'Hiring Manager',
  companyName: 'InnovateTech Corp',
  companyAddress: '123 Tech Park, Cyber City',
  jobDescription: 'Looking for a skilled Software Engineer with React and Node.js experience to join our fast-paced team working on cloud-native solutions.',
  isPaid: false // Sample data is not paid by default
};

export default function App() {
  // 1. Initialize state from localStorage if available
  const [data, setData] = useState<ResumeData>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('resumeData');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved resume data');
        }
      }
    }
    return INITIAL_DATA;
  });

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
  
  const printRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 2. Persist data changes to localStorage
  useEffect(() => {
    localStorage.setItem('resumeData', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    if (aiOutput) localStorage.setItem('aiOutput', JSON.stringify(aiOutput));
  }, [aiOutput]);

  useEffect(() => {
    if (aiCoverLetter) localStorage.setItem('aiCoverLetter', JSON.stringify(aiCoverLetter));
  }, [aiCoverLetter]);


  const resetData = () => {
     if (confirm("This will clear your current data. Are you sure?")) {
         setData(INITIAL_DATA);
         setAiOutput(null);
         setAiCoverLetter(null);
         localStorage.removeItem('resumeData');
         localStorage.removeItem('aiOutput');
         localStorage.removeItem('aiCoverLetter');
     }
  };

  const handleDownloadClick = () => {
    if (!data.isPaid) {
        setIsPaymentModalOpen(true);
        return;
    }
    executeDownload();
  };

  const handlePaymentSuccess = () => {
    setData(prev => ({ ...prev, isPaid: true }));
    setIsPaymentModalOpen(false);
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
    } catch (error) {
      alert("Failed to generate. Please ensure your API key is valid and try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const loadSampleData = () => {
    if (confirm("This will replace your current data with sample data. Continue?")) {
      setData({ ...SAMPLE_DATA, mode: data.mode, isPaid: false });
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

  const updateField = (field: keyof ResumeData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      const maxSizeMB = 2;
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      
      if (file.size > maxSizeBytes) {
        alert(`Image is too large. Maximum size is ${maxSizeMB}MB. Current size: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
        return;
      }

      // Validate file type
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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 print:bg-white print:h-auto print:overflow-visible">
      {/* Navbar - Hidden during print */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={resetData}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <SparklesIcon className="w-5 h-5" />
            </div>
            <span className="font-bold text-xl text-slate-800 hidden sm:block">ResumeAI</span>
          </div>
          
          {/* Mode Switcher */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg mx-4 overflow-x-auto">
             <button
                onClick={() => switchMode('resume')}
                className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${data.mode === 'resume' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Resume
              </button>
              <button
                onClick={() => switchMode('cv')}
                className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${data.mode === 'cv' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Professional CV
              </button>
              <button
                onClick={() => switchMode('cover-letter')}
                className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap ${data.mode === 'cover-letter' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Cover Letter
              </button>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={loadSampleData}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 underline mr-2 hidden sm:block"
            >
              Sample
            </button>

            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('edit')}
                className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'edit' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Editor
              </button>
              <button
                onClick={() => setActiveTab('preview')}
                className={`px-3 sm:px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === 'preview' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Preview
              </button>
            </div>
            
            <button
              onClick={handleDownloadClick}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer
                ${data.isPaid 
                    ? 'bg-green-600 text-white hover:bg-green-700' 
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              title={data.isPaid ? "Download PDF" : "Unlock Download"}
            >
              {data.isPaid ? (
                  <>
                    <DownloadIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">Download</span>
                  </>
              ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                    </svg>
                    <span className="hidden sm:inline">Unlock ($2)</span>
                  </>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen} 
        onClose={() => setIsPaymentModalOpen(false)}
        onSuccess={handlePaymentSuccess}
        amountXAF={1200}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:px-6 lg:px-8 py-8 flex gap-8 items-start print:p-0 print:m-0 print:max-w-none print:block">
        
        {/* Editor Panel - Hidden during print */}
        <div className={`flex-1 w-full transition-opacity duration-300 ${activeTab === 'edit' ? 'block opacity-100' : 'hidden lg:block lg:w-1/3 lg:flex-none'} print:hidden`}>
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {data.mode === 'cv' ? 'Curriculum Vitae Details' : data.mode === 'cover-letter' ? 'Cover Letter Details' : 'Resume Details'}
                </h2>
                <p className="text-sm text-slate-500">
                  {data.mode === 'cover-letter' ? 'Tailor a persuasive letter for your application.' : 'Draft your professional profile.'}
                </p>
              </div>
              <button onClick={loadSampleData} className="sm:hidden text-xs text-blue-600 font-medium">
                Load Sample
              </button>
            </div>

            <div className="p-6 space-y-8 h-[calc(100vh-250px)] overflow-y-auto">
              
              {/* COVER LETTER SPECIFIC FIELDS */}
              {data.mode === 'cover-letter' ? (
                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                   {/* Template & Design Reuse */}
                   <section>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Matching Style</label>
                      <p className="text-xs text-slate-500 mb-3">Select the template style to match your Resume/CV.</p>
                      <select 
                        className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
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
                      
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-700 mb-2">Accent Color</label>
                        <div className="flex flex-wrap gap-3">
                          {COLORS.map((color) => (
                            <button
                              key={color.name}
                              onClick={() => updateField('themeColor', color.hex)}
                              className={`w-8 h-8 rounded-full shadow-sm border-2 transition-all flex items-center justify-center
                                ${data.themeColor === color.hex ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-110'}
                              `}
                              style={{ backgroundColor: color.hex }}
                            />
                          ))}
                        </div>
                      </div>
                   </section>

                   {/* Target Role - Critical for AI */}
                   <section>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Target Job Role</label>
                    <select 
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={data.targetRole}
                      onChange={(e) => updateField('targetRole', e.target.value)}
                    >
                      <option value="" disabled>Select role...</option>
                      {ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </section>

                   <section className="space-y-4 border-t border-slate-100 pt-4">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">1</span>
                        Recipient Details
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                         <input 
                          type="text" 
                          placeholder="Company Name" 
                          className="input-field" 
                          value={data.companyName} 
                          onChange={(e) => updateField('companyName', e.target.value)} 
                        />
                         <input 
                          type="text" 
                          placeholder="Hiring Manager Name (Optional)" 
                          className="input-field" 
                          value={data.recipientName} 
                          onChange={(e) => updateField('recipientName', e.target.value)} 
                        />
                         <input 
                          type="text" 
                          placeholder="Recipient Role (e.g. HR Manager)" 
                          className="input-field" 
                          value={data.recipientRole} 
                          onChange={(e) => updateField('recipientRole', e.target.value)} 
                        />
                        <input 
                          type="text" 
                          placeholder="Company Address (Optional)" 
                          className="input-field" 
                          value={data.companyAddress} 
                          onChange={(e) => updateField('companyAddress', e.target.value)} 
                        />
                      </div>
                   </section>

                   <section className="space-y-4 border-t border-slate-100 pt-4">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">2</span>
                        Job Context
                      </h3>
                      <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Job Description (Paste key parts here)</label>
                        <textarea 
                          placeholder="Paste the job description or key requirements here. The AI will tailor your letter to these details." 
                          className="input-field w-full h-40"
                          value={data.jobDescription}
                          onChange={(e) => updateField('jobDescription', e.target.value)}
                        />
                      </div>
                   </section>

                   <div className="bg-blue-50 p-4 rounded-lg text-xs text-blue-800">
                     <p><strong>Note:</strong> The AI will also use your profile information (Experience, Skills, Name) from the "Resume" tab to build your case.</p>
                   </div>
                </div>
              ) : (
                /* RESUME / CV FIELDS (Original Editor) */
                <>
                  {/* Template & Color Selection */}
                  <section className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        {data.mode === 'cv' ? 'CV Template' : 'Resume Layout'}
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {data.mode === 'resume' ? (
                          <>
                            <button 
                              onClick={() => updateField('template', 'classic')}
                              className={`p-3 rounded-lg border text-sm font-medium transition-all ${data.template === 'classic' ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                              Classic
                            </button>
                            <button 
                              onClick={() => updateField('template', 'modern')}
                              className={`p-3 rounded-lg border text-sm font-medium transition-all ${data.template === 'modern' ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                              Modern (2-Col)
                            </button>
                            <button 
                              onClick={() => updateField('template', 'sidebar')}
                              className={`p-3 rounded-lg border text-sm font-medium transition-all ${data.template === 'sidebar' ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                              Sidebar
                            </button>
                            <button 
                              onClick={() => updateField('template', 'minimalist')}
                              className={`p-3 rounded-lg border text-sm font-medium transition-all ${data.template === 'minimalist' ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                              Executive
                            </button>
                          </>
                        ) : (
                          <>
                            <button 
                              onClick={() => updateField('template', 'cv-corporate')}
                              className={`p-3 rounded-lg border text-sm font-medium transition-all ${data.template === 'cv-corporate' ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                              Corporate (Photo)
                            </button>
                            <button 
                              onClick={() => updateField('template', 'cv-executive')}
                              className={`p-3 rounded-lg border text-sm font-medium transition-all ${data.template === 'cv-executive' ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                              Executive
                            </button>
                            <button 
                              onClick={() => updateField('template', 'cv-academic')}
                              className={`p-3 rounded-lg border text-sm font-medium transition-all ${data.template === 'cv-academic' ? 'border-blue-600 bg-blue-50 text-blue-700 ring-1 ring-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                            >
                              Academic
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Accent Color</label>
                      <div className="flex flex-wrap gap-3">
                        {COLORS.map((color) => (
                          <button
                            key={color.name}
                            onClick={() => updateField('themeColor', color.hex)}
                            className={`w-8 h-8 rounded-full shadow-sm border-2 transition-all flex items-center justify-center
                              ${data.themeColor === color.hex ? 'border-slate-900 scale-110' : 'border-transparent hover:scale-110'}
                            `}
                            style={{ backgroundColor: color.hex }}
                          />
                        ))}
                      </div>
                    </div>
                  </section>

                  {/* Target Role Section */}
                  <section>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Target Job Role / Niche</label>
                    <select 
                      className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
                      value={data.targetRole}
                      onChange={(e) => updateField('targetRole', e.target.value)}
                    >
                      <option value="" disabled>Select a niche...</option>
                      {ROLES.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </section>

                  {/* Personal Info */}
                  <section className="space-y-4">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">1</span>
                      Personal Information
                    </h3>
                    
                    {/* Photo Upload */}
                    <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                      <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-200 shrink-0 border border-slate-300">
                        {data.photo ? (
                          <img src={data.photo} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-slate-700 mb-1">Profile Photo</label>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="text-xs bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded hover:bg-slate-50"
                          >
                            Upload
                          </button>
                          {data.photo && (
                            <button 
                              onClick={removePhoto}
                              className="text-xs text-red-600 hover:text-red-800 px-2"
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
                        <p className="text-[10px] text-slate-500 mt-1">Recommended for CVs. Square crop works best.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input type="text" placeholder="Full Name" className="input-field" value={data.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
                      <input type="email" placeholder="Email" className="input-field" value={data.email} onChange={(e) => updateField('email', e.target.value)} />
                      <input type="text" placeholder="Phone" className="input-field" value={data.phone} onChange={(e) => updateField('phone', e.target.value)} />
                      <input type="text" placeholder="City, Country" className="input-field" value={data.location} onChange={(e) => updateField('location', e.target.value)} />
                      <input type="text" placeholder="LinkedIn URL" className="input-field" value={data.linkedin} onChange={(e) => updateField('linkedin', e.target.value)} />
                      <input type="text" placeholder="Portfolio / Website" className="input-field" value={data.website} onChange={(e) => updateField('website', e.target.value)} />
                    </div>
                  </section>

                  {/* Experience */}
                  <section className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">2</span>
                        Work Experience
                      </h3>
                      <button onClick={() => addItem('experience')} className="text-blue-600 text-sm font-medium flex items-center hover:underline">
                        <PlusIcon className="w-4 h-4 mr-1" /> Add Job
                      </button>
                    </div>
                    
                    {data.experience.map((exp) => (
                      <div key={exp.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 relative group">
                        <button onClick={() => removeItem('experience', exp.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" placeholder="Job Title" className="input-field" value={exp.role} onChange={(e) => updateItemField('experience', exp.id, 'role', e.target.value)} />
                          <input type="text" placeholder="Company" className="input-field" value={exp.company} onChange={(e) => updateItemField('experience', exp.id, 'company', e.target.value)} />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <div className="flex-1 w-full sm:w-auto">
                            <label className="text-xs text-slate-500 ml-1">Start Date</label>
                            <input 
                              type="month" 
                              className="input-field w-full" 
                              value={exp.startDate || ''} 
                              onChange={(e) => updateDateRange('experience', exp.id, 'startDate', e.target.value)} 
                            />
                          </div>
                          
                          {!exp.isCurrent && (
                            <div className="flex-1 w-full sm:w-auto">
                              <label className="text-xs text-slate-500 ml-1">End Date</label>
                              <input 
                                type="month" 
                                className="input-field w-full" 
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
                              className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                            />
                            <label htmlFor={`current-exp-${exp.id}`} className="ml-2 text-sm text-slate-700">Current</label>
                          </div>
                        </div>

                        <textarea 
                          placeholder="Rough notes (e.g. 'Managed 5 people, used React')." 
                          className="input-field w-full h-24 resize-none"
                          value={exp.description}
                          onChange={(e) => updateItemField('experience', exp.id, 'description', e.target.value)}
                        />
                      </div>
                    ))}
                  </section>

                  {/* Internships */}
                  <section className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-xs">2b</span>
                        Internships
                      </h3>
                      <button onClick={() => addItem('internships')} className="text-blue-600 text-sm font-medium flex items-center hover:underline">
                        <PlusIcon className="w-4 h-4 mr-1" /> Add Internship
                      </button>
                    </div>
                    
                    {data.internships.map((int) => (
                      <div key={int.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 relative group">
                        <button onClick={() => removeItem('internships', int.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" placeholder="Intern Title" className="input-field" value={int.role} onChange={(e) => updateItemField('internships', int.id, 'role', e.target.value)} />
                          <input type="text" placeholder="Company" className="input-field" value={int.company} onChange={(e) => updateItemField('internships', int.id, 'company', e.target.value)} />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <div className="flex-1 w-full sm:w-auto">
                            <label className="text-xs text-slate-500 ml-1">Start Date</label>
                            <input 
                              type="month" 
                              className="input-field w-full" 
                              value={int.startDate || ''} 
                              onChange={(e) => updateDateRange('internships', int.id, 'startDate', e.target.value)} 
                            />
                          </div>
                          
                          {!int.isCurrent && (
                            <div className="flex-1 w-full sm:w-auto">
                              <label className="text-xs text-slate-500 ml-1">End Date</label>
                              <input 
                                type="month" 
                                className="input-field w-full" 
                                value={int.endDate || ''} 
                                onChange={(e) => updateDateRange('internships', int.id, 'endDate', e.target.value)} 
                              />
                            </div>
                          )}
                        </div>

                        <textarea 
                          placeholder="What did you learn? What did you build?" 
                          className="input-field w-full h-20 resize-none"
                          value={int.description}
                          onChange={(e) => updateItemField('internships', int.id, 'description', e.target.value)}
                        />
                      </div>
                    ))}
                  </section>

                  {/* Volunteering */}
                  <section className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-xs">2c</span>
                        Volunteering
                      </h3>
                      <button onClick={() => addItem('volunteering')} className="text-blue-600 text-sm font-medium flex items-center hover:underline">
                        <PlusIcon className="w-4 h-4 mr-1" /> Add Volunteering
                      </button>
                    </div>
                    
                    {data.volunteering.map((vol) => (
                      <div key={vol.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 relative group">
                        <button onClick={() => removeItem('volunteering', vol.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" placeholder="Role" className="input-field" value={vol.role} onChange={(e) => updateItemField('volunteering', vol.id, 'role', e.target.value)} />
                          <input type="text" placeholder="Organization" className="input-field" value={vol.company} onChange={(e) => updateItemField('volunteering', vol.id, 'company', e.target.value)} />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <div className="flex-1 w-full sm:w-auto">
                            <label className="text-xs text-slate-500 ml-1">Start Date</label>
                            <input 
                              type="month" 
                              className="input-field w-full" 
                              value={vol.startDate || ''} 
                              onChange={(e) => updateDateRange('volunteering', vol.id, 'startDate', e.target.value)} 
                            />
                          </div>
                          
                          {!vol.isCurrent && (
                            <div className="flex-1 w-full sm:w-auto">
                              <label className="text-xs text-slate-500 ml-1">End Date</label>
                              <input 
                                type="month" 
                                className="input-field w-full" 
                                value={vol.endDate || ''} 
                                onChange={(e) => updateDateRange('volunteering', vol.id, 'endDate', e.target.value)} 
                              />
                            </div>
                          )}
                        </div>

                        <textarea 
                          placeholder="Impact, community service, leadership..." 
                          className="input-field w-full h-20 resize-none"
                          value={vol.description}
                          onChange={(e) => updateItemField('volunteering', vol.id, 'description', e.target.value)}
                        />
                      </div>
                    ))}
                  </section>

                  {/* Education */}
                  <section className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">3</span>
                        Education
                      </h3>
                      <button onClick={() => addItem('education')} className="text-blue-600 text-sm font-medium flex items-center hover:underline">
                        <PlusIcon className="w-4 h-4 mr-1" /> Add School
                      </button>
                    </div>
                    {data.education.map((edu) => (
                      <div key={edu.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 relative group">
                        <button onClick={() => removeItem('education', edu.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <input type="text" placeholder="School / University" className="input-field w-full" value={edu.school} onChange={(e) => updateItemField('education', edu.id, 'school', e.target.value)} />
                        <input type="text" placeholder="Degree / Major" className="input-field w-full" value={edu.degree} onChange={(e) => updateItemField('education', edu.id, 'degree', e.target.value)} />
                        
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <div className="flex-1 w-full sm:w-auto">
                            <label className="text-xs text-slate-500 ml-1">Start Date</label>
                            <input 
                              type="month" 
                              className="input-field w-full" 
                              value={edu.startDate || ''} 
                              onChange={(e) => updateDateRange('education', edu.id, 'startDate', e.target.value)} 
                            />
                          </div>
                          
                          {!edu.isCurrent && (
                            <div className="flex-1 w-full sm:w-auto">
                              <label className="text-xs text-slate-500 ml-1">End/Grad Date</label>
                              <input 
                                type="month" 
                                className="input-field w-full" 
                                value={edu.endDate || ''} 
                                onChange={(e) => updateDateRange('education', edu.id, 'endDate', e.target.value)} 
                              />
                            </div>
                          )}
                        </div>

                      </div>
                    ))}
                  </section>

                  {/* Projects */}
                  <section className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">4</span>
                        Projects {data.mode === 'cv' && '/ Research'}
                      </h3>
                      <button onClick={() => addItem('projects')} className="text-blue-600 text-sm font-medium flex items-center hover:underline">
                        <PlusIcon className="w-4 h-4 mr-1" /> Add {data.mode === 'cv' ? 'Entry' : 'Project'}
                      </button>
                    </div>
                    {data.projects.map((proj) => (
                      <div key={proj.id} className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 relative group">
                        <button onClick={() => removeItem('projects', proj.id)} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                          <TrashIcon className="w-4 h-4" />
                        </button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input type="text" placeholder="Name / Title" className="input-field" value={proj.name} onChange={(e) => updateItemField('projects', proj.id, 'name', e.target.value)} />
                          <input type="text" placeholder="Link (optional)" className="input-field" value={proj.link} onChange={(e) => updateItemField('projects', proj.id, 'link', e.target.value)} />
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <div className="flex-1 w-full sm:w-auto">
                            <label className="text-xs text-slate-500 ml-1">Start Date</label>
                            <input 
                              type="month" 
                              className="input-field w-full" 
                              value={proj.startDate || ''} 
                              onChange={(e) => updateDateRange('projects', proj.id, 'startDate', e.target.value)} 
                            />
                          </div>
                          
                          {!proj.isCurrent && (
                            <div className="flex-1 w-full sm:w-auto">
                              <label className="text-xs text-slate-500 ml-1">End Date</label>
                              <input 
                                type="month" 
                                className="input-field w-full" 
                                value={proj.endDate || ''} 
                                onChange={(e) => updateDateRange('projects', proj.id, 'endDate', e.target.value)} 
                              />
                            </div>
                          )}
                        </div>
                        
                        <textarea 
                          placeholder="Description, key findings, or details." 
                          className="input-field w-full h-20 resize-none"
                          value={proj.description}
                          onChange={(e) => updateItemField('projects', proj.id, 'description', e.target.value)}
                        />
                      </div>
                    ))}
                  </section>

                  {/* Skills, Achievements & Summary */}
                  <section className="space-y-4">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs">5</span>
                      Skills & Extra
                    </h3>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Skills (comma separated)</label>
                      <textarea 
                        placeholder="Python, Leadership, SEO, Project Management..." 
                        className="input-field w-full h-20"
                        value={data.skills}
                        onChange={(e) => updateField('skills', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Languages</label>
                      <textarea 
                        placeholder="English (Native), Spanish (Intermediate)..." 
                        className="input-field w-full h-16"
                        value={data.languages}
                        onChange={(e) => updateField('languages', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Achievements (One per line)</label>
                      <textarea 
                        placeholder="Winner of Hackathon 2023&#10;Dean's List 2020" 
                        className="input-field w-full h-20"
                        value={data.achievements}
                        onChange={(e) => updateField('achievements', e.target.value)}
                      />
                    </div>
                    
                    {/* CV Specific Fields */}
                    {data.mode === 'cv' && (
                      <>
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Publications (One per line)</label>
                          <textarea 
                            placeholder="Title of Paper, Journal, Date...&#10;Book Chapter Title, Publisher..." 
                            className="input-field w-full h-20"
                            value={data.publications}
                            onChange={(e) => updateField('publications', e.target.value)}
                          />
                        </div>
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                          <label className="block text-xs font-medium text-slate-500 mb-1">Certifications & Licenses (One per line)</label>
                          <textarea 
                            placeholder="AWS Certified Solutions Architect&#10;Project Management Professional (PMP)" 
                            className="input-field w-full h-20"
                            value={data.certifications}
                            onChange={(e) => updateField('certifications', e.target.value)}
                          />
                        </div>
                      </>
                    )}

                    <div>
                      <label className="block text-xs font-medium text-slate-500 mb-1">Summary Notes (Optional)</label>
                      <textarea 
                        placeholder="Any specific career goals or highlights for the summary..." 
                        className="input-field w-full h-20"
                        value={data.summary}
                        onChange={(e) => updateField('summary', e.target.value)}
                      />
                    </div>
                  </section>
                </>
              )}
            </div>
            
            <div className="p-6 border-t border-slate-200 bg-slate-50">
              <button
                onClick={handleAiGenerate}
                disabled={isGenerating || !data.targetRole}
                className={`w-full py-3 rounded-lg font-bold text-white shadow-md flex items-center justify-center gap-2 transition-all
                  ${isGenerating ? 'bg-blue-400 cursor-wait' : !data.targetRole ? 'bg-slate-300 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]'}
                `}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {data.mode === 'cover-letter' ? 'Writing Cover Letter...' : 'Polishing with AI...'}
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-5 h-5" />
                    Generate {data.mode === 'cover-letter' ? 'Cover Letter' : data.mode === 'cv' ? 'CV' : 'Resume'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Preview Panel - FORCE BLOCK during print to ensure it's visible even if tab is hidden */}
        <div className={`flex-1 flex justify-center ${activeTab === 'preview' ? 'block' : 'hidden lg:block'} print:block print:w-full print:static`}>
          <div className="sticky top-24 w-full max-w-[210mm] print:static print:max-w-none print:w-full">
            {activeTab === 'preview' && !aiOutput && !aiCoverLetter && !isGenerating && (
               <div className="mb-4 p-4 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-sm print:hidden">
                 The preview currently shows raw data. Click "Generate" to let AI rewrite it professionally.
               </div>
            )}
            {/* Resume Preview Component */}
            <ResumePreview ref={printRef} raw={data} aiContent={aiOutput} aiCoverLetter={aiCoverLetter} />
          </div>
        </div>

      </main>

      {/* Mobile Helper for Styles */}
      <style>{`
        .input-field {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }
        .input-field:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}