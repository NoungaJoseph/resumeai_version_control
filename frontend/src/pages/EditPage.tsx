import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SparklesIcon, PlusIcon, TrashIcon, CheckIcon } from '../components/Icons';
import { useResume } from '../context/ResumeContext';
import { generateProfessionalResume, generateCoverLetter, enhanceText } from '../services/geminiService';
import { UI, ROLES, COLORS } from '../constants';
import { generateId, formatDate } from '../utils';
import { ResumeData } from '../types';

export const EditPage: React.FC = () => {
    const navigate = useNavigate();
    const { data, setData, setAiOutput, setAiCoverLetter } = useResume();
    const [isGenerating, setIsGenerating] = useState(false);
    const [enhancingField, setEnhancingField] = useState<string | null>(null);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const t = UI;

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
            setShowSuccessAnimation(true);
            setTimeout(() => {
                setShowSuccessAnimation(false);
                navigate('/preview');
            }, 2000);
        } catch (error) {
            alert("Failed to generate. Please ensure your API key is valid and try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleEnhanceContent = async (field: keyof ResumeData, context: string, type: string = 'formal') => {
        const currentText = data[field] as string;
        if (!currentText || currentText.length < 5) {
            alert("Please provide some initial text to enhance.");
            return;
        }

        setEnhancingField(String(field));
        try {
            const result = await enhanceText(currentText, context, type);
            updateField(field, result);
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

    const switchMode = (mode: 'resume' | 'cv' | 'cover-letter') => {
        if (mode !== data.mode) {
            let defaultTemplate = data.template;
            if (mode === 'cv' && !data.template.startsWith('cv')) defaultTemplate = 'cv-professional';
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

            alert("Please ensure this is a passport-style photo (face clearly visible, plain background).");

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
        <div className="min-h-screen flex flex-col bg-slate-50">
            {/* Navigation */}
            <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: data.themeColor }}>
                            <SparklesIcon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl text-slate-800 group-hover:text-slate-600 transition-colors">ResumeAI</span>
                    </div>

                    {/* Center: Mode Switcher */}
                    <div className="flex items-center mx-2 sm:mx-8">
                        <select
                            value={data.mode}
                            onChange={(e) => switchMode(e.target.value as any)}
                            className="px-4 py-2 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-100 transition-all cursor-pointer"
                        >
                            <option value="resume">{t.resume}</option>
                            <option value="cv">{t.cv}</option>
                            <option value="cover-letter">{t.coverLetter}</option>
                            <option value="motivation-letter">Motivation Letter</option>
                            <option value="internship-letter">Internship Application</option>
                            <option value="visa-letter">Visa Cover Letter</option>
                            <option value="business-plan">Business Plan</option>
                            <option value="legal-agreement">Legal Template</option>
                        </select>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadSampleData}
                            className="text-xs text-slate-500 hover:text-slate-700 underline px-2"
                            title="Load Sample Data for Testing"
                        >
                            Load Sample
                        </button>
                        <button
                            onClick={() => navigate('/preview')}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-all flex items-center gap-2 shadow-lg shadow-slate-900/20"
                        >
                            <span>{t.preview}</span>
                            <span className="hidden sm:inline">→</span>
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200/50 overflow-hidden">
                    <div className="p-6 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">
                                {data.mode === 'cv' ? t.cvDetails :
                                    data.mode === 'resume' ? t.resumeDetails :
                                        data.mode === 'business-plan' ? 'Business Plan Details' :
                                            data.mode === 'legal-agreement' ? 'Legal Document Details' :
                                                t.letterDetails}
                            </h2>
                            <p className="text-sm text-slate-600 mt-1">
                                {data.mode === 'business-plan' ? 'Structure your business strategy.' :
                                    data.mode === 'legal-agreement' ? 'Generate legal contracts.' :
                                        data.mode.endsWith('letter') ? t.craftLetter : t.buildProfile}
                            </p>
                        </div>
                    </div>

                    <div className="p-6 space-y-8">
                        {(data.mode === 'cover-letter' || data.mode === 'motivation-letter' || data.mode === 'internship-letter' || data.mode === 'visa-letter') && (
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
                                        <option value="cv-professional">Professional CV</option>
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
                                        <option value="" disabled>Select role/purpose...</option>
                                        {data.mode === 'cover-letter' ? ROLES.map(role => (
                                            <option key={role} value={role}>{role}</option>
                                        )) : (
                                            <option value="custom">General Purpose</option>
                                        )}
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
                            </div>
                        )}

                        {(data.mode === 'resume' || data.mode === 'cv') && (
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
                                                    <button
                                                        onClick={() => updateField('template', 'resume-ats')}
                                                        className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'resume-ats'
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        ATS Optimized
                                                    </button>
                                                    <button
                                                        onClick={() => updateField('template', 'resume-executive')}
                                                        className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'resume-executive'
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        Senior Executive
                                                    </button>
                                                    <button
                                                        onClick={() => updateField('template', 'resume-creative')}
                                                        className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'resume-creative'
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        Creative
                                                    </button>
                                                    <button
                                                        onClick={() => updateField('template', 'resume-technical')}
                                                        className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'resume-technical'
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        Technical/IT
                                                    </button>
                                                    <button
                                                        onClick={() => updateField('template', 'resume-entry')}
                                                        className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'resume-entry'
                                                            ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                            : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                            }`}
                                                    >
                                                        Entry Level
                                                    </button>
                                                </>
                                            ) : data.mode === 'cv' ? (
                                                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                                    <section>
                                                        <label className="block text-sm font-semibold text-slate-700 mb-3"></label>
                                                        <div className="grid grid-cols-1 gap-3">
                                                            <button
                                                                onClick={() => updateField('template', 'cv-professional')}
                                                                className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'cv-professional'
                                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                Professional (Dark)
                                                            </button>
                                                            <button
                                                                onClick={() => updateField('template', 'cv-corporate')}
                                                                className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'cv-corporate'
                                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                Corporate (Gray)
                                                            </button>
                                                            <button
                                                                onClick={() => updateField('template', 'cv-classic')}
                                                                className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'cv-classic'
                                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                Classic (Border)
                                                            </button>
                                                            <button
                                                                onClick={() => updateField('template', 'cv-research')}
                                                                className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'cv-research'
                                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                Research
                                                            </button>
                                                            <button
                                                                onClick={() => updateField('template', 'cv-medical')}
                                                                className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'cv-medical'
                                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                Medical
                                                            </button>
                                                            <button
                                                                onClick={() => updateField('template', 'cv-faculty')}
                                                                className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'cv-faculty'
                                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                Faculty/Prof
                                                            </button>
                                                            <button
                                                                onClick={() => updateField('template', 'cv-scientific')}
                                                                className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'cv-scientific'
                                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                Scientific
                                                            </button>
                                                            <button
                                                                onClick={() => updateField('template', 'cv-international')}
                                                                className={`p-4 rounded-xl border-2 text-sm font-semibold transition-all ${data.template === 'cv-international'
                                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                                                                    : 'border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                International
                                                            </button>
                                                        </div>
                                                    </section>
                                                </div>
                                            ) : null}
                                        </div>

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
                                    </div>

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

                                    <section className="space-y-6 border-t border-slate-100 pt-6">
                                        <h3 className="font-semibold text-slate-800 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">1</span>
                                            {t.personalInfo}
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <div className="sm:col-span-2 flex items-center gap-4">
                                                <div className="relative group">
                                                    <div className="w-24 h-24 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden hover:border-blue-400 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                        {data.photo ? (
                                                            <img src={data.photo} alt="Profile" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="text-center">
                                                                <span className="text-xs text-slate-400 font-medium">Add Photo</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {data.photo && (
                                                        <button onClick={(e) => { e.stopPropagation(); removePhoto(); }} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors">
                                                            <TrashIcon className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                    <input
                                                        type="file"
                                                        ref={fileInputRef}
                                                        className="hidden"
                                                        accept="image/*"
                                                        onChange={handlePhotoUpload}
                                                    />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-slate-700">Profile Photo</p>
                                                    <p className="text-xs text-slate-500">Recommended: Square, passport-style.</p>
                                                </div>
                                            </div>

                                            <input type="text" placeholder={t.fullName} className="input-field enhanced" value={data.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
                                            <input type="email" placeholder={t.email} className="input-field enhanced" value={data.email} onChange={(e) => updateField('email', e.target.value)} />
                                            <input type="tel" placeholder={t.phone} className="input-field enhanced" value={data.phone} onChange={(e) => updateField('phone', e.target.value)} />
                                            <input type="text" placeholder={t.location} className="input-field enhanced" value={data.location} onChange={(e) => updateField('location', e.target.value)} />
                                            <input type="text" placeholder={t.linkedin} className="input-field enhanced" value={data.linkedin} onChange={(e) => updateField('linkedin', e.target.value)} />
                                            <input type="text" placeholder={t.website} className="input-field enhanced" value={data.website} onChange={(e) => updateField('website', e.target.value)} />
                                        </div>
                                    </section>

                                    <section className="space-y-6 border-t border-slate-100 pt-6">
                                        <h3 className="font-semibold text-slate-800 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">2</span>
                                            {t.addExperience}
                                        </h3>
                                        {data.experience.map((exp) => (
                                            <div key={exp.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative group hover:border-blue-300 transition-colors">
                                                <button onClick={() => removeItem('experience', exp.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <input type="text" placeholder={t.company} className="input-field" value={exp.company} onChange={(e) => updateItemField('experience', exp.id, 'company', e.target.value)} />
                                                    <input type="text" placeholder={t.role} className="input-field" value={exp.role} onChange={(e) => updateItemField('experience', exp.id, 'role', e.target.value)} />
                                                </div>
                                                <div className="flex flex-wrap gap-3 items-center">
                                                    <input type="date" className="input-field w-auto" value={exp.startDate} onChange={(e) => updateDateRange('experience', exp.id, 'startDate', e.target.value)} />
                                                    <span className="text-slate-400">-</span>
                                                    {!exp.isCurrent && (
                                                        <input type="date" className="input-field w-auto" value={exp.endDate} onChange={(e) => updateDateRange('experience', exp.id, 'endDate', e.target.value)} />
                                                    )}
                                                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                                                        <input type="checkbox" checked={exp.isCurrent} onChange={(e) => updateDateRange('experience', exp.id, 'isCurrent', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                                        Current
                                                    </label>
                                                </div>
                                                <textarea placeholder={t.description} className="input-field h-24 resize-none" value={exp.description} onChange={(e) => updateItemField('experience', exp.id, 'description', e.target.value)} />
                                            </div>
                                        ))}
                                        <button onClick={() => addItem('experience')} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                                            <PlusIcon className="w-4 h-4" /> {t.addExperience}
                                        </button>
                                    </section>

                                    <section className="space-y-6 border-t border-slate-100 pt-6">
                                        <h3 className="font-semibold text-slate-800 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">3</span>
                                            {t.education}
                                        </h3>
                                        {data.education.map((edu) => (
                                            <div key={edu.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative group hover:border-blue-300 transition-colors">
                                                <button onClick={() => removeItem('education', edu.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition-colors">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <input type="text" placeholder={t.school} className="input-field" value={edu.school} onChange={(e) => updateItemField('education', edu.id, 'school', e.target.value)} />
                                                    <input type="text" placeholder={t.degree} className="input-field" value={edu.degree} onChange={(e) => updateItemField('education', edu.id, 'degree', e.target.value)} />
                                                </div>
                                                <div className="flex flex-wrap gap-3 items-center">
                                                    <input type="date" className="input-field w-auto" value={edu.startDate} onChange={(e) => updateDateRange('education', edu.id, 'startDate', e.target.value)} />
                                                    <span className="text-slate-400">-</span>
                                                    {!edu.isCurrent && (
                                                        <input type="date" className="input-field w-auto" value={edu.endDate} onChange={(e) => updateDateRange('education', edu.id, 'endDate', e.target.value)} />
                                                    )}
                                                    <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                                                        <input type="checkbox" checked={edu.isCurrent} onChange={(e) => updateDateRange('education', edu.id, 'isCurrent', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                                        Current
                                                    </label>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={() => addItem('education')} className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors">
                                            <PlusIcon className="w-4 h-4" /> {t.addEducation}
                                        </button>
                                    </section>

                                    <section className="space-y-6 border-t border-slate-100 pt-6">
                                        <h3 className="font-semibold text-slate-800 flex items-center gap-3">
                                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold">4</span>
                                            {t.skills}
                                        </h3>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-2">Comma separated (e.g. React, Node.js, Design)</label>
                                            <textarea
                                                placeholder={t.skillsPlaceholder}
                                                className="input-field enhanced w-full h-24 resize-none"
                                                value={data.skills}
                                                onChange={(e) => updateField('skills', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-slate-500 mb-2">Languages (e.g. English, French)</label>
                                            <input
                                                type="text"
                                                placeholder="English, French..."
                                                className="input-field enhanced"
                                                value={data.languages}
                                                onChange={(e) => updateField('languages', e.target.value)}
                                            />
                                        </div>
                                        {data.mode === 'cv' && (
                                            <>
                                                <div>
                                                    <label className="block text-xs font-medium text-slate-500 mb-2">Certifications</label>
                                                    <textarea
                                                        placeholder="List your certifications..."
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
                                </section>
                            </>
                        )}

                        {/* Motivation Letter Form */}
                        {data.mode === 'motivation-letter' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                <section>
                                    <h3 className="font-semibold text-slate-800 mb-4">Motivation Letter Details</h3>
                                    <div className="grid grid-cols-1 gap-4">
                                        <input type="text" placeholder="Organization Name" className="input-field enhanced" value={data.organizationName || ''} onChange={(e) => updateField('organizationName', e.target.value)} />
                                        <input type="text" placeholder="Position or Opportunity" className="input-field enhanced" value={data.positionApplied || ''} onChange={(e) => updateField('positionApplied', e.target.value)} />

                                        <div className="flex justify-between items-center mt-2">
                                            <label className="block text-sm font-semibold text-slate-700">Motivation Text</label>
                                            <button
                                                onClick={() => handleEnhanceContent('motivationText', `Motivation letter for ${data.positionApplied} at ${data.organizationName}`, 'persuasive')}
                                                disabled={enhancingField === 'motivationText'}
                                                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors flex items-center gap-1"
                                            >
                                                <SparklesIcon className="w-3 h-3" /> {enhancingField === 'motivationText' ? 'Enhancing...' : 'Enhance with AI'}
                                            </button>
                                        </div>
                                        <textarea placeholder="Why are you applying? (The AI can enhance this)" className="input-field enhanced h-40" value={data.motivationText || ''} onChange={(e) => updateField('motivationText', e.target.value)} />

                                        <label className="block text-sm font-semibold text-slate-700 mt-2">Skills Summary</label>
                                        <textarea placeholder="Relevant skills..." className="input-field enhanced h-24" value={data.skills || ''} onChange={(e) => updateField('skills', e.target.value)} />

                                        <label className="block text-sm font-semibold text-slate-700 mt-2">Experience Summary</label>
                                        <textarea placeholder="Relevant experience..." className="input-field enhanced h-24" value={data.summary || ''} onChange={(e) => updateField('summary', e.target.value)} />
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Internship Letter Form */}
                        {data.mode === 'internship-letter' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                <section>
                                    <h3 className="font-semibold text-slate-800 mb-4">Internship Application</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input type="text" placeholder="Full Name" className="input-field enhanced" value={data.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
                                        <input type="email" placeholder="Email" className="input-field enhanced" value={data.email} onChange={(e) => updateField('email', e.target.value)} />
                                        <input type="tel" placeholder="Phone" className="input-field enhanced" value={data.phone} onChange={(e) => updateField('phone', e.target.value)} />
                                        <input type="text" placeholder="Address" className="input-field enhanced" value={data.location} onChange={(e) => updateField('location', e.target.value)} />

                                        <input type="text" placeholder="School/University Name" className="input-field enhanced" value={data.schoolName || ''} onChange={(e) => updateField('schoolName', e.target.value)} />
                                        <input type="text" placeholder="Program / Field of Study" className="input-field enhanced" value={data.program || ''} onChange={(e) => updateField('program', e.target.value)} />
                                        <input type="text" placeholder="Level (BTS, Degree...)" className="input-field enhanced" value={data.educationLevel || ''} onChange={(e) => updateField('educationLevel', e.target.value)} />
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                        <div>
                                            <label className="text-xs text-slate-500">Internship Start Date</label>
                                            <input type="date" className="input-field enhanced" value={data.internshipStartDate || ''} onChange={(e) => updateField('internshipStartDate', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500">Internship End Date</label>
                                            <input type="date" className="input-field enhanced" value={data.internshipEndDate || ''} onChange={(e) => updateField('internshipEndDate', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="mt-4 space-y-4">
                                        <input type="text" placeholder="Target Company Name" className="input-field enhanced" value={data.companyName || ''} onChange={(e) => updateField('companyName', e.target.value)} />
                                        <input type="text" placeholder="Supervisor Name (Optional)" className="input-field enhanced" value={data.supervisorName || ''} onChange={(e) => updateField('supervisorName', e.target.value)} />

                                        <div className="flex justify-between items-center">
                                            <label className="text-sm font-semibold text-slate-700">Motivation</label>
                                            <button
                                                onClick={() => handleEnhanceContent('motivationText', `Internship application for ${data.program} student at ${data.companyName}`, 'formal')}
                                                disabled={enhancingField === 'motivationText'}
                                                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors flex items-center gap-1"
                                            >
                                                <SparklesIcon className="w-3 h-3" /> {enhancingField === 'motivationText' ? 'Enhancing...' : 'Enhance'}
                                            </button>
                                        </div>
                                        <textarea placeholder="Motivation for this internship..." className="input-field enhanced h-32" value={data.motivationText || ''} onChange={(e) => updateField('motivationText', e.target.value)} />
                                        <textarea placeholder="Skills offered..." className="input-field enhanced h-24" value={data.skills || ''} onChange={(e) => updateField('skills', e.target.value)} />
                                        <textarea placeholder="Expected learning outcomes..." className="input-field enhanced h-24" value={data.expectedOutcomes || ''} onChange={(e) => updateField('expectedOutcomes', e.target.value)} />
                                    </div>
                                </section>
                            </div>
                        )}

                        {/* Visa Letter Form */}
                        {data.mode === 'visa-letter' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                <section>
                                    <h3 className="font-semibold text-slate-800 mb-4">Visa Application Details</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input type="text" placeholder="Full Name (as in Passport)" className="input-field enhanced" value={data.fullName} onChange={(e) => updateField('fullName', e.target.value)} />
                                        <input type="date" placeholder="Date of Birth" className="input-field enhanced" value={data.dob || ''} onChange={(e) => updateField('dob', e.target.value)} />
                                        <input type="text" placeholder="Passport Number" className="input-field enhanced" value={data.passportNumber || ''} onChange={(e) => updateField('passportNumber', e.target.value)} />
                                        <input type="text" placeholder="Nationality" className="input-field enhanced" value={data.nationality || ''} onChange={(e) => updateField('nationality', e.target.value)} />

                                        <div>
                                            <label className="text-xs text-slate-500">Passport Issue Date</label>
                                            <input type="date" className="input-field enhanced" value={data.passportIssueDate || ''} onChange={(e) => updateField('passportIssueDate', e.target.value)} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500">Passport Expiry Date</label>
                                            <input type="date" className="input-field enhanced" value={data.passportExpiryDate || ''} onChange={(e) => updateField('passportExpiryDate', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        <h4 className="text-sm font-semibold text-slate-700">Trip Details</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <input type="text" placeholder="Destination Country" className="input-field enhanced" value={data.destinationCountry || ''} onChange={(e) => updateField('destinationCountry', e.target.value)} />
                                            <input type="text" placeholder="Embassy Name/Address" className="input-field enhanced" value={data.embassyDetails || ''} onChange={(e) => updateField('embassyDetails', e.target.value)} />
                                            <div>
                                                <label className="text-xs text-slate-500">Travel Start Date</label>
                                                <input type="date" className="input-field enhanced" value={data.travelStartDate || ''} onChange={(e) => updateField('travelStartDate', e.target.value)} />
                                            </div>
                                            <div>
                                                <label className="text-xs text-slate-500">Travel End Date</label>
                                                <input type="date" className="input-field enhanced" value={data.travelEndDate || ''} onChange={(e) => updateField('travelEndDate', e.target.value)} />
                                            </div>
                                        </div>


                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-sm font-semibold text-slate-700">Purpose of Travel</label>
                                            <button
                                                onClick={() => handleEnhanceContent('travelPurpose', `Visa application purpose for ${data.destinationCountry}`, 'formal')}
                                                disabled={enhancingField === 'travelPurpose'}
                                                className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded hover:bg-purple-200 transition-colors flex items-center gap-1"
                                            >
                                                <SparklesIcon className="w-3 h-3" /> {enhancingField === 'travelPurpose' ? 'Enhancing...' : 'Enhance'}
                                            </button>
                                        </div>
                                        <textarea placeholder="Purpose of Travel (Be specific)" className="input-field enhanced h-24" value={data.travelPurpose || ''} onChange={(e) => updateField('travelPurpose', e.target.value)} />
                                    </div>

                                    <div className="mt-6 space-y-4">
                                        <h4 className="text-sm font-semibold text-slate-700">Sponsorship & Accommodation</h4>
                                        <select
                                            className="w-full input-field enhanced"
                                            value={data.sponsorshipType || 'self'}
                                            onChange={(e) => updateField('sponsorshipType', e.target.value)}
                                        >
                                            <option value="self">Self-Sponsored</option>
                                            <option value="sponsor">Sponsored by Other</option>
                                        </select>

                                        {data.sponsorshipType === 'sponsor' && (
                                            <textarea placeholder="Sponsor Details (Name, Relationship, Financial proof...)" className="input-field enhanced h-24" value={data.sponsorDetails || ''} onChange={(e) => updateField('sponsorDetails', e.target.value)} />
                                        )}

                                        <textarea placeholder="Accommodation Details (Hotel name, Address...)" className="input-field enhanced h-24" value={data.accommodationDetails || ''} onChange={(e) => updateField('accommodationDetails', e.target.value)} />
                                        <textarea placeholder="Return Assurance (Reasons you will return home - Job, Family, Property...)" className="input-field enhanced h-24" value={data.returnAssurance || ''} onChange={(e) => updateField('returnAssurance', e.target.value)} />
                                        <textarea placeholder="List of Supporting Documents (Bank statements, Invitation letter...)" className="input-field enhanced h-24" value={data.supportingDocuments || ''} onChange={(e) => updateField('supportingDocuments', e.target.value)} />
                                    </div>
                                </section>
                            </div>
                        )
                        }

                        {/* Business Plan Form */}
                        {
                            data.mode === 'business-plan' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                    <section>
                                        <h3 className="font-semibold text-slate-800 mb-4">Business Plan Details</h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            <input type="text" placeholder="Business Name" className="input-field enhanced" value={data.businessName || ''} onChange={(e) => updateField('businessName', e.target.value)} />
                                            <input type="text" placeholder="Owner Name" className="input-field enhanced" value={data.ownerName || ''} onChange={(e) => updateField('ownerName', e.target.value)} />
                                            <input type="text" placeholder="Business Location" className="input-field enhanced" value={data.location || ''} onChange={(e) => updateField('location', e.target.value)} />
                                            <input type="text" placeholder="Business Sector" className="input-field enhanced" value={data.businessSector || ''} onChange={(e) => updateField('businessSector', e.target.value)} />
                                        </div>

                                        <div className="space-y-4 mt-4">
                                            <textarea placeholder="Problem Statement" className="input-field enhanced h-24" value={data.problemStatement || ''} onChange={(e) => updateField('problemStatement', e.target.value)} />
                                            <textarea placeholder="Solution Overview" className="input-field enhanced h-24" value={data.solutionOverview || ''} onChange={(e) => updateField('solutionOverview', e.target.value)} />
                                            <textarea placeholder="Target Customers" className="input-field enhanced h-24" value={data.targetCustomers || ''} onChange={(e) => updateField('targetCustomers', e.target.value)} />
                                            <textarea placeholder="Competitors" className="input-field enhanced h-24" value={data.competitors || ''} onChange={(e) => updateField('competitors', e.target.value)} />
                                            <textarea placeholder="Unique Advantage (USP)" className="input-field enhanced h-24" value={data.uniqueAdvantage || ''} onChange={(e) => updateField('uniqueAdvantage', e.target.value)} />
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                                            <input type="text" placeholder="Startup Costs" className="input-field enhanced" value={data.startupCosts || ''} onChange={(e) => updateField('startupCosts', e.target.value)} />
                                            <input type="text" placeholder="Monthly Operating Costs" className="input-field enhanced" value={data.operatingCosts || ''} onChange={(e) => updateField('operatingCosts', e.target.value)} />
                                            <input type="text" placeholder="Expected Monthly Revenue" className="input-field enhanced" value={data.expectedRevenue || ''} onChange={(e) => updateField('expectedRevenue', e.target.value)} />
                                            <input type="text" placeholder="Revenue Model (e.g. Sales, Subscription)" className="input-field enhanced" value={data.revenueModel || ''} onChange={(e) => updateField('revenueModel', e.target.value)} />
                                        </div>

                                        <div className="space-y-4 mt-4">
                                            <textarea placeholder="Marketing Strategy" className="input-field enhanced h-24" value={data.marketingStrategy || ''} onChange={(e) => updateField('marketingStrategy', e.target.value)} />
                                            <textarea placeholder="Long Term Vision" className="input-field enhanced h-24" value={data.longTermVision || ''} onChange={(e) => updateField('longTermVision', e.target.value)} />
                                        </div>
                                    </section>
                                </div>
                            )
                        }

                        {/* Legal Agreement Form */}
                        {
                            data.mode === 'legal-agreement' && (
                                <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                                    <section>
                                        <h3 className="font-semibold text-slate-800 mb-4">Legal Document Details</h3>

                                        <label className="block text-sm font-semibold text-slate-700 mb-2">Template Type</label>
                                        <select
                                            className="w-full input-field enhanced mb-4"
                                            value={data.template.startsWith('legal-') ? data.template : 'legal-lease'}
                                            onChange={(e) => updateField('template', e.target.value)}
                                        >
                                            <option value="legal-lease">Lease Agreement</option>
                                            <option value="legal-partnership">Partnership Agreement</option>
                                            <option value="legal-sale">Sale Agreement</option>
                                        </select>

                                        <div className="grid grid-cols-1 gap-4">
                                            <input type="text" placeholder="Party A Name (e.g. Landlord/Seller)" className="input-field enhanced" value={data.legalPartyA || ''} onChange={(e) => updateField('legalPartyA', e.target.value)} />
                                            <input type="text" placeholder="Party B Name (e.g. Tenant/Buyer)" className="input-field enhanced" value={data.legalPartyB || ''} onChange={(e) => updateField('legalPartyB', e.target.value)} />
                                            <input type="date" placeholder="Agreement Date" className="input-field enhanced" value={data.agreementDate || ''} onChange={(e) => updateField('agreementDate', e.target.value)} />
                                            <input type="text" placeholder="Financial Value (e.g. Rent Amount)" className="input-field enhanced" value={data.financialValue || ''} onChange={(e) => updateField('financialValue', e.target.value)} />

                                            <label className="block text-sm font-semibold text-slate-700 mt-2">Specific Terms & Conditions</label>
                                            <textarea placeholder="Enter specific terms..." className="input-field enhanced h-48" value={data.agreementTerms || ''} onChange={(e) => updateField('agreementTerms', e.target.value)} />
                                        </div>

                                        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                                            <strong>Disclaimer:</strong> This is a generic template generator. It does not constitute legal advice. Please consult a qualified attorney for legal matters.
                                        </div>
                                    </section>
                                </div>
                            )
                        }
                    </div >

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
                </div >
            </main >

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
        </div >
    );
};
