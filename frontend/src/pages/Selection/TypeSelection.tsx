import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useResume } from '../../context/ResumeContext';
import { Logo } from '../../components/Logo';

export const TypeSelection: React.FC = () => {
    const navigate = useNavigate();
    const { setData } = useResume();

    const handleSelect = (mode: 'resume' | 'cv' | 'cover-letter' | 'motivation-letter' | 'internship-letter' | 'visa-letter' | 'business-plan' | 'legal-agreement') => {
        setData(prev => ({ ...prev, mode }));
        // Only Resume and CV go through TemplateGallery, others go to Edit
        if (mode === 'resume' || mode === 'cv') {
            navigate(`/select-template?type=${mode}`);
        } else {
            navigate('/edit');
        }
    };

    const documentTypes = [
        {
            id: 'resume',
            title: 'Resume',
            emoji: '🚀',
            bgEmoji: '📄',
            color: 'teal',
            description: 'Best for private sector jobs. Concise (1-2 pages), focused on specific achievements and skills.'
        },
        {
            id: 'cv',
            title: 'Curriculum Vitae (CV)',
            emoji: '🏛️',
            bgEmoji: '🎓',
            color: 'coral',
            description: 'Comprehensive document for academic, research, or medical positions. Focuses on total career history.'
        },
        {
            id: 'cover-letter',
            title: 'Cover Letter',
            emoji: '✉️',
            bgEmoji: '📝',
            color: 'blue-500',
            description: 'A professional letter introducing yourself and explaining why you are the best fit for a specific role.'
        },
        {
            id: 'motivation-letter',
            title: 'Motivation Letter',
            emoji: '🎯',
            bgEmoji: '🌟',
            color: 'purple-500',
            description: 'Focuses on your passion and drive. Ideal for university applications or non-profit volunteer roles.'
        },
        {
            id: 'internship-letter',
            title: 'Internship Application',
            emoji: '🎓',
            bgEmoji: '💼',
            color: 'emerald-500',
            description: 'Tailored for students and recent grads seeking practical experience in their field of study.'
        },
        {
            id: 'visa-letter',
            title: 'Visa Cover Letter',
            emoji: '✈️',
            bgEmoji: '🌍',
            color: 'amber-500',
            description: 'Formal letter to embassies explaining the purpose of travel and assuring compliance with visa rules.'
        },
        {
            id: 'business-plan',
            title: 'Business Plan',
            emoji: '📈',
            bgEmoji: '🏢',
            color: 'indigo-500',
            description: 'Structured strategy document outlining business goals, target markets, and financial projections.'
        },
        {
            id: 'legal-agreement',
            title: 'Legal Template',
            emoji: '⚖️',
            bgEmoji: '📜',
            color: 'rose-500',
            description: 'Ready-to-use templates for common agreements like leases, sales, and partnerships.'
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy to-[#111827] text-white font-body flex flex-col">
            {/* Navigation */}
            <nav className="p-6">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="cursor-pointer" onClick={() => navigate('/')}>
                        <Logo variant="dark" className="h-8" textClassName="text-white" />
                    </div>
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        ← Back to Home
                    </button>
                </div>
            </nav>

            <div className="flex-1 flex items-center justify-center p-6 py-12">
                <div className="max-w-6xl w-full">
                    <div className="text-center mb-12 animate-fade-in">
                        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
                            What are you <span className="landing-gradient-text">building</span> today?
                        </h1>
                        <p className="text-xl text-gray-400">
                            Choose the format that best fits your current goal.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {documentTypes.map((type) => (
                            <div
                                key={type.id}
                                onClick={() => handleSelect(type.id as any)}
                                className="group relative bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 cursor-pointer hover:border-white/30 transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                    <span className="text-6xl">{type.bgEmoji}</span>
                                </div>
                                <div className="relative z-10">
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors`} style={{ backgroundColor: `${type.color}20` }}>
                                        <span className="text-2xl">{type.emoji}</span>
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 group-hover:text-white transition-colors">{type.title}</h3>
                                    <p className="text-gray-400 text-sm mb-4 leading-relaxed group-hover:text-gray-300">
                                        {type.description}
                                    </p>
                                    <div className="flex items-center text-sm font-semibold opacity-60 group-hover:opacity-100 transition-opacity" style={{ color: type.color === 'teal' || type.color === 'coral' ? type.color : 'inherit' }}>
                                        Start Building <span className="ml-2 group-hover:translate-x-2 transition-transform">→</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center text-sm text-gray-500">
                        <p>All documents are AI-powered and ATS-friendly.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
