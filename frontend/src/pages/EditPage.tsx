import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, PlusIcon, TrashIcon, CheckIcon, PaletteIcon, LayoutIcon, TypeIcon } from '../components/Icons';
import { useResume } from '../context/ResumeContext';
import ResumePreview from '../components/ResumePreview';
import CustomizePanel from '../components/CustomizePanel';
import { generateProfessionalResume, generateCoverLetter, enhanceText } from '../services/geminiService';
import { UI, ROLES, COLORS } from '../constants';
import { generateId, formatDate } from '../utils';
import { ResumeData } from '../types';
import { Logo } from '../components/Logo';
import { XIcon } from '../components/Icons';

export const EditPage: React.FC = () => {
    const navigate = useNavigate();
    const { data, setData, aiOutput, aiCoverLetter, setAiOutput, setAiCoverLetter } = useResume();
    const [enhancingField, setEnhancingField] = useState<string | null>(null);
    const [lastSaved, setLastSaved] = useState<string | null>(null);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const [activeTab, setActiveTab] = useState<'edit' | 'customize'>('edit');
    const [templateFilter, setTemplateFilter] = useState('all');
    const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const printRef = useRef<any>(null);
    const t = UI;

    const handleChange = (field: keyof ResumeData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const addAchievement = () => {
        const newItem = { id: generateId(), title: '', description: '' };
        handleChange('achievements', [...(data.achievements || []), newItem]);
    };

    const updateAchievement = (id: string, field: string, value: string) => {
        const updated = (data.achievements || []).map(item => item.id === id ? { ...item, [field]: value } : item);
        handleChange('achievements', updated);
    };

    const removeAchievement = (id: string) => {
        handleChange('achievements', (data.achievements || []).filter(item => item.id !== id));
    };

    const addCertification = () => {
        const newItem = { id: generateId(), name: '', issuer: '', date: '' };
        handleChange('certifications', [...(data.certifications || []), newItem]);
    };

    const updateCertification = (id: string, field: string, value: string) => {
        const updated = (data.certifications || []).map(item => item.id === id ? { ...item, [field]: value } : item);
        handleChange('certifications', updated);
    };

    const removeCertification = (id: string) => {
        handleChange('certifications', (data.certifications || []).filter(item => item.id !== id));
    };

    const handleLogoClick = () => {
        if (confirm("Any unsaved changes might be lost. Go back to home?")) {
            navigate('/');
        }
    };

    const handleEnhanceSummary = async () => {
        if (!data.summary) return;
        setEnhancingField('summary');
        try {
            const enhanced = await enhanceText(data.summary, `Targeting: ${data.targetRole}`, "professional");
            handleChange('summary', enhanced);
        } catch (error) {
            console.error(error);
        } finally {
            setEnhancingField(null);
        }
    };

    const addExperience = () => {
        const newItem = { id: generateId(), company: '', role: '', dates: '', description: '' };
        handleChange('experience', [...data.experience, newItem]);
    };

    const updateExperience = (id: string, field: string, value: string) => {
        const updated = data.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp);
        handleChange('experience', updated);
    };

    const removeExperience = (id: string) => {
        handleChange('experience', data.experience.filter(exp => exp.id !== id));
    };

    const addEducation = () => {
        const newItem = { id: generateId(), school: '', degree: '', dates: '' };
        handleChange('education', [...data.education, newItem]);
    };

    const updateEducation = (id: string, field: string, value: string) => {
        const updated = data.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu);
        handleChange('education', updated);
    };

    const removeEducation = (id: string) => {
        handleChange('education', data.education.filter(edu => edu.id !== id));
    };

    const addProject = () => {
        const newItem = { id: generateId(), name: '', dates: '', description: '' };
        handleChange('projects', [...data.projects, newItem]);
    };

    const updateProject = (id: string, field: string, value: string) => {
        const updated = data.projects.map(p => p.id === id ? { ...p, [field]: value } : p);
        handleChange('projects', updated);
    };

    const removeProject = (id: string) => {
        handleChange('projects', data.projects.filter(p => p.id !== id));
    };

    const handleAiGenerate = async () => {
        if (!data.targetRole && !['business-plan', 'legal-agreement'].includes(data.mode)) {
            alert("Please provide the target role or purpose first.");
            return;
        }

        setIsGenerating(true);
        try {
            if (data.mode === 'resume' || data.mode === 'cv') {
                const result = await generateProfessionalResume(data);
                setAiOutput(result);
            } else {
                const result = await generateCoverLetter(data);
                setAiCoverLetter(result);
            }
            setShowSuccessAnimation(true);
            setTimeout(() => {
                setShowSuccessAnimation(false);
                navigate('/preview');
            }, 2000);
        } catch (error) {
            alert("Failed to generate. Please ensure your API key is valid and try again.");
            console.error(error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEnhanceContent = async (field: keyof ResumeData, context: string, type: string = 'professional') => {
        const currentText = data[field] as string;
        if (!currentText || currentText.length < 5) {
            alert("Please provide some initial text to enhance.");
            return;
        }

        setEnhancingField(String(field));
        try {
            const result = await enhanceText(currentText, context, type);
            handleChange(field, result);
        } catch (error) {
            alert("Failed to enhance text.");
        } finally {
            setEnhancingField(null);
        }
    };

    const loadSampleData = () => {
        if (confirm("This will replace your current data with sample data. Continue?")) {
            import('../data/sampleData').then(module => {
                switch (data.mode) {
                    case 'motivation-letter':
                        setData(module.SAMPLE_MOTIVATION_DATA);
                        break;
                    case 'internship-letter':
                        setData(module.SAMPLE_INTERNSHIP_DATA);
                        break;
                    case 'visa-letter':
                        setData(module.SAMPLE_VISA_DATA);
                        break;
                    case 'business-plan':
                        setData(module.SAMPLE_BUSINESS_PLAN_DATA);
                        break;
                    case 'legal-agreement':
                        setData(module.SAMPLE_LEGAL_DATA);
                        break;
                    default:
                        setData(module.SAMPLE_RESUME_DATA);
                }
            });
        }
    };

    const switchMode = (mode: ResumeData['mode']) => {
        if (mode !== data.mode) {
            let defaultTemplate = data.template;
            if (mode === 'cv' && !data.template.startsWith('cv')) defaultTemplate = 'cv-professional';
            if (mode === 'resume' && data.template.startsWith('cv')) defaultTemplate = 'modern';

            setData(prev => ({ ...prev, mode, template: defaultTemplate }));
        }
    };

    // Auto-save simulation
    useEffect(() => {
        const saver = setInterval(() => {
            setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        }, 30000);
        return () => clearInterval(saver);
    }, []);

    // Scroll listener for sticky header effects
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleChange('photo', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col">
            {/* Navigation */}
            <nav className={`bg-white border-b border-slate-200 sticky top-0 z-50 transition-all ${isScrolled ? 'h-14' : 'h-16'} flex items-center`}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Logo
                            className="cursor-pointer"
                            onClick={handleLogoClick}
                        />

                        {/* Edit / Customize Toggle */}
                        <div className="flex bg-slate-100 p-1 rounded-xl">
                            <button
                                onClick={() => setActiveTab('edit')}
                                className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'edit' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Edit
                            </button>
                            <button
                                onClick={() => setActiveTab('customize')}
                                className={`px-6 py-1.5 rounded-lg text-sm font-bold transition-all ${activeTab === 'customize' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                Customize
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {activeTab === 'edit' && (
                            <select
                                value={data.mode}
                                onChange={(e) => switchMode(e.target.value as any)}
                                className="hidden md:block px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-600 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                            >
                                <option value="resume">Resume</option>
                                <option value="cv">CV</option>
                                <option value="cover-letter">Cover Letter</option>
                                <option value="motivation-letter">Motivation Letter</option>
                                <option value="internship-letter">Internship</option>
                                <option value="visa-letter">Visa Letter</option>
                                <option value="business-plan">Business Plan</option>
                                <option value="legal-agreement">Legal</option>
                            </select>
                        )}

                        <button
                            onClick={loadSampleData}
                            className="text-[10px] font-bold text-slate-400 hover:text-blue-600 uppercase tracking-wider transition-colors hidden sm:block"
                        >
                            Sample Data
                        </button>

                        <button
                            onClick={() => navigate('/preview')}
                            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-all flex items-center gap-2"
                        >
                            <span>Preview</span>
                            <div className="w-5 h-5 bg-white/20 rounded flex items-center justify-center text-[10px]">P</div>
                        </button>
                    </div>
                </div>
            </nav>

            {activeTab === 'edit' ? (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        <div className="lg:col-span-8 space-y-6">
                            {/* Personal Details */}
                            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
                                <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-sm">1</span>
                                    Personal Details
                                </h2>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            value={data.fullName}
                                            onChange={(e) => handleChange('fullName', e.target.value)}
                                            className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Role</label>
                                        <input
                                            type="text"
                                            value={data.targetRole}
                                            onChange={(e) => handleChange('targetRole', e.target.value)}
                                            className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                            placeholder="Software Engineer"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
                                        <input
                                            type="email"
                                            value={data.email}
                                            onChange={(e) => handleChange('email', e.target.value)}
                                            className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Phone</label>
                                        <input
                                            type="tel"
                                            value={data.phone}
                                            onChange={(e) => handleChange('phone', e.target.value)}
                                            className="w-full p-3 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                                            placeholder="+237 ..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Summary */}
                            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center text-sm">2</span>
                                        Professional Summary
                                    </h2>
                                    <button
                                        onClick={handleEnhanceSummary}
                                        disabled={enhancingField === 'summary' || !data.summary}
                                        className="flex items-center gap-2 text-purple-600 font-bold text-sm bg-purple-50 px-4 py-2 rounded-xl hover:bg-purple-100 transition-all disabled:opacity-50"
                                    >
                                        <SparklesIcon className={`w-4 h-4 ${enhancingField === 'summary' ? 'animate-spin' : ''}`} />
                                        AI Enhance
                                    </button>
                                </div>
                                <textarea
                                    value={data.summary}
                                    onChange={(e) => handleChange('summary', e.target.value)}
                                    className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none min-h-[120px] text-slate-700"
                                    placeholder="Describe your professional background..."
                                />
                            </div>

                            {/* Conditional Rendering based on Mode */}
                            {(data.mode === 'resume' || data.mode === 'cv') && (
                                <>
                                    {/* Experience */}
                                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm">3</span>
                                                Experience
                                            </h2>
                                            <button onClick={addExperience} className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all">
                                                <PlusIcon className="w-4 h-4" /> Add
                                            </button>
                                        </div>
                                        <div className="space-y-6">
                                            {Array.isArray(data.experience) && data.experience.map((exp) => (
                                                <div key={exp.id} className="p-6 rounded-2xl bg-slate-50 relative group">
                                                    <button onClick={() => removeExperience(exp.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                                        <input
                                                            className="bg-white p-3 rounded-lg border-none text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Company Name"
                                                            value={exp.company}
                                                            onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                                        />
                                                        <input
                                                            className="bg-white p-3 rounded-lg border-none text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Role / Title"
                                                            value={exp.role}
                                                            onChange={(e) => updateExperience(exp.id, 'role', e.target.value)}
                                                        />
                                                        <input
                                                            className="bg-white p-3 rounded-lg border-none text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Dates (e.g. 2020 - Present)"
                                                            value={exp.dates}
                                                            onChange={(e) => updateExperience(exp.id, 'dates', e.target.value)}
                                                        />
                                                    </div>
                                                    <textarea
                                                        className="w-full bg-white p-3 rounded-lg border-none text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                                                        placeholder="Job description or rough notes..."
                                                        value={exp.description}
                                                        onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Education */}
                                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">4</span>
                                                Education
                                            </h2>
                                            <button onClick={addEducation} className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all">
                                                <PlusIcon className="w-4 h-4" /> Add
                                            </button>
                                        </div>
                                        <div className="space-y-6">
                                            {Array.isArray(data.education) && data.education.map((edu) => (
                                                <div key={edu.id} className="p-6 rounded-2xl bg-slate-50 relative group">
                                                    <button onClick={() => removeEducation(edu.id)} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                                        <TrashIcon className="w-5 h-5" />
                                                    </button>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <input
                                                            className="bg-white p-3 rounded-lg border-none text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="School / University"
                                                            value={edu.school}
                                                            onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                                        />
                                                        <input
                                                            className="bg-white p-3 rounded-lg border-none text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Degree / Certificate"
                                                            value={edu.degree}
                                                            onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                                        />
                                                        <input
                                                            className="bg-white p-3 rounded-lg border-none text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Dates"
                                                            value={edu.dates}
                                                            onChange={(e) => updateEducation(edu.id, 'dates', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Skills */}
                                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
                                        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                            <span className="w-8 h-8 rounded-lg bg-pink-50 text-pink-600 flex items-center justify-center text-sm">5</span>
                                            Skills
                                        </h2>
                                        <textarea
                                            value={data.skills}
                                            onChange={(e) => handleChange('skills', e.target.value)}
                                            className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 transition-all outline-none min-h-[100px] text-slate-700"
                                            placeholder="React, TypeScript, Node.js, Project Management..."
                                        />
                                    </div>

                                    {/* Achievements */}
                                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-lg bg-yellow-50 text-yellow-600 flex items-center justify-center text-sm">7</span>
                                                Achievements
                                            </h2>
                                            <button onClick={addAchievement} className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all">
                                                <PlusIcon className="w-4 h-4" /> Add
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {Array.isArray(data.achievements) && data.achievements.map((ach) => (
                                                <div key={ach.id} className="p-4 rounded-xl bg-slate-50 relative group border border-slate-100 transition-all hover:border-blue-200">
                                                    <button onClick={() => removeAchievement(ach.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                    <div className="grid grid-cols-1 gap-3">
                                                        <input
                                                            className="bg-white p-2.5 rounded-lg border-none text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 w-full"
                                                            placeholder="Achievement Title (e.g. Employee of the Month)"
                                                            value={ach.title}
                                                            onChange={(e) => updateAchievement(ach.id, 'title', e.target.value)}
                                                        />
                                                        <textarea
                                                            className="w-full bg-white p-2.5 rounded-lg border-none text-sm outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]"
                                                            placeholder="Brief description or impact..."
                                                            value={ach.description}
                                                            onChange={(e) => updateAchievement(ach.id, 'description', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Certifications */}
                                    <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100">
                                        <div className="flex items-center justify-between mb-6">
                                            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-sm">8</span>
                                                Certifications
                                            </h2>
                                            <button onClick={addCertification} className="flex items-center gap-2 text-blue-600 font-bold text-sm bg-blue-50 px-4 py-2 rounded-xl hover:bg-blue-100 transition-all">
                                                <PlusIcon className="w-4 h-4" /> Add
                                            </button>
                                        </div>
                                        <div className="space-y-4">
                                            {Array.isArray(data.certifications) && data.certifications.map((cert) => (
                                                <div key={cert.id} className="p-4 rounded-xl bg-slate-50 relative group border border-slate-100 transition-all hover:border-blue-200">
                                                    <button onClick={() => removeCertification(cert.id)} className="absolute top-2 right-2 text-slate-300 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100">
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        <input
                                                            className="bg-white p-2.5 rounded-lg border-none text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Certification Name"
                                                            value={cert.name}
                                                            onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                                                        />
                                                        <input
                                                            className="bg-white p-2.5 rounded-lg border-none text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                                            placeholder="Issuer (e.g. AWS, Google)"
                                                            value={cert.issuer}
                                                            onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {/* Letter Forms */}
                            {(data.mode === 'cover-letter' || data.mode === 'motivation-letter' || data.mode === 'internship-letter' || data.mode === 'visa-letter') && (
                                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-8">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center text-sm">3</span>
                                        {data.mode === 'visa-letter' ? 'Visa Details' : 'Recipient & Context'}
                                    </h2>

                                    {data.mode === 'visa-letter' ? (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="Passport Number" value={data.passportNumber} onChange={(e) => handleChange('passportNumber', e.target.value)} />
                                            <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="Destination Country" value={data.destinationCountry} onChange={(e) => handleChange('destinationCountry', e.target.value)} />
                                            <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="Travel Purpose" value={data.travelPurpose} onChange={(e) => handleChange('travelPurpose', e.target.value)} />
                                            <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="Embassy Details" value={data.embassyDetails} onChange={(e) => handleChange('embassyDetails', e.target.value)} />
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="Recipient Name / Hiring Manager" value={data.recipientName} onChange={(e) => handleChange('recipientName', e.target.value)} />
                                            <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="Company / Organization" value={data.companyName} onChange={(e) => handleChange('companyName', e.target.value)} />
                                            {data.mode === 'internship-letter' && (
                                                <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500 sm:col-span-2" placeholder="Program / Field of Study" value={data.program} onChange={(e) => handleChange('program', e.target.value)} />
                                            )}
                                        </div>
                                    )}

                                    <div>
                                        <div className="flex items-center justify-between mb-2">
                                            <label className="text-xs font-bold text-slate-500 uppercase">{data.mode === 'visa-letter' ? 'Assurances & Support' : 'Job / Position Description'}</label>
                                            <button onClick={() => handleEnhanceContent(data.mode === 'visa-letter' ? 'returnAssurance' : 'jobDescription', 'Professional tone improvement')} className="text-blue-600 text-[10px] font-bold uppercase hover:underline">Enhance Draft</button>
                                        </div>
                                        <textarea
                                            className="w-full p-4 rounded-xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px] text-slate-700"
                                            placeholder={data.mode === 'visa-letter' ? "List supporting documents and return assurances..." : "Paste the job requirements or your rough motivation notes here..."}
                                            value={data.mode === 'visa-letter' ? data.returnAssurance : data.jobDescription}
                                            onChange={(e) => handleChange(data.mode === 'visa-letter' ? 'returnAssurance' : 'jobDescription', e.target.value)}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Business Plan Form */}
                            {data.mode === 'business-plan' && (
                                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-8">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-sm">3</span>
                                        Business Overview
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Business Name</label>
                                            <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" value={data.businessName} onChange={(e) => handleChange('businessName', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Sector / Industry</label>
                                            <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" value={data.businessSector} onChange={(e) => handleChange('businessSector', e.target.value)} />
                                        </div>
                                    </div>

                                    {/* Executive Summary Section */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">The Problem</label>
                                            <textarea className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" value={data.problemStatement} onChange={(e) => handleChange('problemStatement', e.target.value)} placeholder="What pain point are you solving?" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Your Solution</label>
                                            <textarea className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]" value={data.solutionOverview} onChange={(e) => handleChange('solutionOverview', e.target.value)} placeholder="Describe your product or service..." />
                                        </div>
                                    </div>

                                    {/* Market Analysis Section */}
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Market Analysis</h3>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Target Audience</label>
                                            <textarea className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" value={data.targetCustomers} onChange={(e) => handleChange('targetCustomers', e.target.value)} placeholder="Who are your customers?" />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Competition</label>
                                                <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" value={data.competitors} onChange={(e) => handleChange('competitors', e.target.value)} placeholder="Major competitors..." />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Unique Selling Proposition (USP)</label>
                                                <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" value={data.uniqueAdvantage} onChange={(e) => handleChange('uniqueAdvantage', e.target.value)} placeholder="What makes you different?" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Strategy Section */}
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Strategy & Vision</h3>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Marketing Plan</label>
                                            <textarea className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" value={data.marketingStrategy} onChange={(e) => handleChange('marketingStrategy', e.target.value)} placeholder="How will you reach customers?" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Long-Term Vision</label>
                                            <textarea className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500 min-h-[60px]" value={data.longTermVision} onChange={(e) => handleChange('longTermVision', e.target.value)} placeholder="Where do you see the business in 5-10 years?" />
                                        </div>
                                    </div>

                                    {/* Financials Section */}
                                    <div className="space-y-4 pt-4 border-t border-slate-100">
                                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Financial Overview</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Startup Cost</label>
                                                <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" value={data.startupCosts} onChange={(e) => handleChange('startupCosts', e.target.value)} placeholder="e.g. 5,000,000 XAF" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Expected Revenue</label>
                                                <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" value={data.expectedRevenue} onChange={(e) => handleChange('expectedRevenue', e.target.value)} placeholder="e.g. 2,000,000 XAF/month" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Revenue Model</label>
                                                <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" value={data.revenueModel} onChange={(e) => handleChange('revenueModel', e.target.value)} placeholder="e.g. Commission, Subscription..." />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Monthly OpEx (Operating Expenses)</label>
                                                <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" value={data.operatingCosts} onChange={(e) => handleChange('operatingCosts', e.target.value)} placeholder="e.g. 500,000 XAF/month" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}


                            {/* Legal Agreement Form */}
                            {data.mode === 'legal-agreement' && (
                                <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-100 space-y-8">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center text-sm">3</span>
                                        Agreement Parties
                                    </h2>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="First Party (e.g. Landlord)" value={data.legalPartyA} onChange={(e) => handleChange('legalPartyA', e.target.value)} />
                                        <input className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500" placeholder="Second Party (e.g. Tenant)" value={data.legalPartyB} onChange={(e) => handleChange('legalPartyB', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Primary Terms / Clauses</label>
                                        <textarea className="w-full p-3 rounded-xl bg-slate-50 border-none outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]" placeholder="Rental amount, duration, obligations..." value={data.agreementTerms} onChange={(e) => handleChange('agreementTerms', e.target.value)} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Sidebar / Tips */}
                        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24 h-fit">
                            <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-100 relative overflow-hidden group">
                                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5 text-blue-600" />
                                    Smart Editor
                                </h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-6">
                                    Fields are saved automatically. Complete the required sections to generate your document.
                                </p>
                                <div className="space-y-4">
                                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase mb-1">Status</div>
                                        <div className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                                            <CheckIcon className="w-3 h-3" /> Ready to Generate
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Tips */}
                            <div className="bg-slate-900 rounded-2xl p-8 text-white shadow-xl">
                                <h3 className="text-sm font-bold mb-4 uppercase tracking-widest text-slate-500">Writing Tip</h3>
                                <p className="text-slate-200 text-sm italic">
                                    "Focus on quantifiable achievements rather than just tasks. Use 'Led a team of 5' instead of 'Team management'."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                /* Customize Mode - Split Screen View */
                <div className="flex-1 flex flex-col md:flex-row h-[calc(100vh-64px)] overflow-hidden bg-slate-100">
                    {/* Left Panel: Customization Controls */}
                    <div className="w-full md:w-[450px] bg-white border-r border-slate-200 flex flex-col overflow-hidden">
                        <CustomizePanel
                            data={data}
                            setData={setData}
                            templateFilter={templateFilter}
                            setTemplateFilter={setTemplateFilter}
                        />
                    </div>

                    {/* Right Panel: Live Preview */}
                    <div className={`flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-slate-100/50 ${isMobilePreviewOpen ? 'fixed inset-0 z-[60] bg-white' : 'hidden md:flex'}`}>
                        {isMobilePreviewOpen && (
                            <button
                                onClick={() => setIsMobilePreviewOpen(false)}
                                className="fixed top-4 right-4 z-[70] bg-slate-900 text-white w-10 h-10 rounded-full flex items-center justify-center shadow-xl"
                            >
                                <XIcon className="w-6 h-6" />
                            </button>
                        )}
                        <div className={`preview-wrapper shadow-2xl origin-top transition-transform duration-300 ${isMobilePreviewOpen ? 'scale-100 mt-12' : 'scale-[0.6] sm:scale-[0.8] lg:scale-100'}`}>
                            <ResumePreview ref={printRef} raw={data} aiContent={data.mode === 'resume' || data.mode === 'cv' ? aiOutput : null} aiCoverLetter={aiCoverLetter} />
                        </div>
                    </div>

                    {/* Mobile Preview Toggle Button */}
                    {!isMobilePreviewOpen && (
                        <button
                            onClick={() => setIsMobilePreviewOpen(true)}
                            className="md:hidden fixed bottom-24 right-6 z-50 bg-blue-600 text-white px-6 py-3 rounded-full font-bold shadow-2xl flex items-center gap-2 animate-bounce"
                        >
                            <SparklesIcon className="w-5 h-5" />
                            Live Preview
                        </button>
                    )}
                </div>
            )}

            {/* Bottom Generation Toolbar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-slate-200 p-4 z-40 transform transition-all duration-500 animate-slide-up">
                <div className="max-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${data.fullName && (data.targetRole || data.businessName) ? 'bg-emerald-500 animate-pulse' : 'bg-orange-400'}`} />
                        <span className="text-slate-600 text-sm font-medium">
                            {data.fullName && (data.targetRole || data.businessName)
                                ? 'Perfect! You are ready to generate.'
                                : 'Complete basic details to unlock generation.'}
                        </span>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button
                            onClick={handleAiGenerate}
                            disabled={isGenerating || !data.fullName}
                            className={`flex-1 sm:flex-none relative overflow-hidden group bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-slate-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isGenerating ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>AI Magician Working...</span>
                                </div>
                            ) : (
                                <div className="flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    <span>Generate {data.mode.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')}</span>
                                </div>
                            )}

                            {showSuccessAnimation && (
                                <div className="absolute inset-0 bg-emerald-500 flex items-center justify-center animate-fade-in">
                                    <CheckIcon className="w-6 h-6 text-white animate-bounce" />
                                </div>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Injected Spacing for for the fixed footer */}
            <div className="h-24" />
        </div>
    );
};
