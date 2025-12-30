import React, { useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useResume } from '../../context/ResumeContext';
import { Logo } from '../../components/Logo';
import { TEMPLATES } from '../../constants';

const ASSETS_MAPPING: Record<string, string> = {
    // Resume Photos
    'resume-ats': '/photos_resume/ats optimized.jpeg',
    'resume-creative': '/photos_resume/creative.jpeg',
    'resume-entry': '/photos_resume/entry level.jpeg',
    'resume-executive': '/photos_resume/executive.jpeg',
    'modern': '/photos_resume/modern.jpeg',
    'classic': '/photos_resume/resume_clasic.jpeg',
    'sidebar': '/photos_resume/sidebar.jpeg',
    'resume-technical': '/photos_resume/technicalIT.jpeg',

    // CV Photos
    'cv-classic': '/photos_cv/classic.jpeg',
    'cv-corporate': '/photos_cv/corporate.jpeg',
    'cv-faculty': '/photos_cv/faculty.jpeg',
    'cv-international': '/photos_cv/international.jpeg',
    'cv-medical': '/photos_cv/medical.jpeg',
    'cv-professional': '/photos_cv/professional dark.jpeg',
    'cv-research': '/photos_cv/research.jpeg',
    'cv-scientific': '/photos_cv/scientific.jpeg',
    'cv-academic': '/photos_cv/research.jpeg', // Fallback
    'cv-executive': '/photos_cv/corporate.jpeg', // Fallback
};

export const TemplateGallery: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { data, setData } = useResume();

    const type = (searchParams.get('type') as 'resume' | 'cv') || data.mode || 'resume';
    const forceTemplate = searchParams.get('template');

    React.useEffect(() => {
        if (forceTemplate && TEMPLATES[forceTemplate as keyof typeof TEMPLATES]) {
            setData(prev => ({
                ...prev,
                mode: type,
                template: forceTemplate as any
            }));
            navigate('/edit');
        }
    }, [forceTemplate, type, setData, navigate]);

    const filteredTemplates = useMemo(() => {
        return Object.entries(TEMPLATES).filter(([key]) => {
            if (type === 'resume') {
                return !key.startsWith('cv-') && !key.startsWith('legal-');
            } else {
                return key.startsWith('cv-');
            }
        });
    }, [type]);

    const handleSelect = (templateKey: string) => {
        setData(prev => ({
            ...prev,
            mode: type,
            template: templateKey as any
        }));
        navigate('/edit');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy to-[#111827] text-white font-body">
            {/* Navigation */}
            <nav className="sticky top-0 z-50 glassmorphism border-b border-white/10 px-6 py-4">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-8">
                        <div className="cursor-pointer" onClick={() => navigate('/')}>
                            <Logo variant="dark" className="h-8" textClassName="text-white" />
                        </div>
                        <div className="hidden md:flex space-x-1 bg-white/5 p-1 rounded-xl">
                            <button
                                onClick={() => navigate('/select-template?type=resume')}
                                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'resume' ? 'bg-teal text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Resumes
                            </button>
                            <button
                                onClick={() => navigate('/select-template?type=cv')}
                                className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all ${type === 'cv' ? 'bg-teal text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                CVs
                            </button>
                        </div>
                    </div>
                    <button
                        onClick={() => navigate('/select-type')}
                        className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        ← Change Type
                    </button>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
                    <div className="animate-slide-in-up">
                        <h1 className="text-4xl font-display font-bold mb-3">
                            Choose your <span className="landing-gradient-text">Template</span>
                        </h1>
                        <p className="text-gray-400 max-w-xl">
                            Select a professional design tailored for your {type === 'resume' ? 'industry' : 'academic background'}. You can always change it later.
                        </p>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <span className="flex items-center"><span className="w-2 h-2 bg-teal rounded-full mr-2"></span> ATS Friendly</span>
                        <span className="flex items-center"><span className="w-2 h-2 bg-sage rounded-full mr-2"></span> Customizable</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {filteredTemplates.map(([key, info], index) => (
                        <div
                            key={key}
                            className="group animate-fade-in"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="relative bg-white/5 rounded-2xl overflow-hidden border border-white/10 hover-lift transition-all duration-500 group-hover:border-teal/30 group-hover:shadow-2xl group-hover:shadow-teal/5">
                                {/* Template Preview */}
                                <div className="aspect-[210/297] bg-navy/50 relative overflow-hidden">
                                    <img
                                        src={ASSETS_MAPPING[key] || `https://placehold.co/400x600/1e293b/4a9b8e?text=${info.name}`}
                                        alt={info.name}
                                        className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-110"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = `https://placehold.co/400x600/1e293b/4a9b8e?text=${info.name}`;
                                        }}
                                    />

                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-navy/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-6">
                                        <button
                                            onClick={() => handleSelect(key)}
                                            className="bg-white text-navy px-6 py-3 rounded-xl font-bold transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300"
                                        >
                                            Use Template
                                        </button>
                                    </div>
                                </div>

                                <div className="p-5 border-t border-white/5">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-lg group-hover:text-teal transition-colors">{info.name}</h3>
                                        {key.includes('ats') && <span className="text-[10px] bg-teal/20 text-teal px-2 py-0.5 rounded font-bold">ATS+</span>}
                                    </div>
                                    <p className="text-gray-400 text-sm line-clamp-2">{info.desc}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
