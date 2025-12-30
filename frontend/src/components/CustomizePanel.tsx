import React from 'react';
import { PaletteIcon, LayoutIcon, TypeIcon, CheckIcon } from './Icons';
import { COLORS, TEMPLATES } from '../constants';
import { ResumeData } from '../types';

interface CustomizePanelProps {
    data: ResumeData;
    setData: (data: ResumeData) => void;
    templateFilter: string;
    setTemplateFilter: (filter: string) => void;
}

const getTemplateCategories = (mode: string) => {
    if (mode === 'business-plan') {
        return [
            { id: 'all', name: 'Business Layouts' },
            { id: 'modern', name: 'Modern' },
            { id: 'corporate', name: 'Corporate' }
        ];
    }
    if (mode === 'visa-letter') {
        return [
            { id: 'all', name: 'Formal Letters' }
        ];
    }
    return [
        { id: 'all', name: 'All' },
        { id: 'ats', name: 'ATS Friendly' },
        { id: 'photo', name: 'With Photo' },
        { id: 'two-column', name: 'Two Column' },
        { id: 'modern', name: 'Modern' }
    ];
};

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
    'cv-academic': '/photos_cv/research.jpeg',
    'cv-executive': '/photos_cv/corporate.jpeg',

    'default': '/photos_resume/modern.jpeg'
};

const FONTS = [
    { id: 'Inter', name: 'Inter (Sans)', provider: 'google' },
    { id: 'Roboto', name: 'Roboto', provider: 'google' },
    { id: 'Playfair Display', name: 'Playfair (Serif)', provider: 'google' },
    { id: 'Outfit', name: 'Outfit', provider: 'google' },
    { id: 'Montserrat', name: 'Montserrat', provider: 'google' },
    { id: 'Lora', name: 'Lora (Serif)', provider: 'google' }
];

const FONT_SIZES = [
    { id: 'small', name: 'Compact' },
    { id: 'medium', name: 'Standard' },
    { id: 'large', name: 'Large' }
];

const MARGINS = [
    { id: 'narrow', name: 'Narrow' },
    { id: 'balanced', name: 'Balanced' },
    { id: 'wide', name: 'Wide' }
];

const SPACING = [
    { id: 'compact', name: 'Compact' },
    { id: 'standard', name: 'Standard' },
    { id: 'relaxed', name: 'Relaxed' }
];

const CustomizePanel: React.FC<CustomizePanelProps> = ({ data, setData, templateFilter, setTemplateFilter }) => {
    const [activeSection, setActiveSection] = React.useState<'template' | 'text' | 'layout'>('template');

    const updateData = (updates: Partial<ResumeData>) => {
        setData({ ...data, ...updates });
    };

    const categories = getTemplateCategories(data.mode);

    const filteredTemplates = Object.entries(TEMPLATES).filter(([id]) => {
        // Filter based on mode first
        if (data.mode === 'business-plan') {
            return id.startsWith('business-') || id === 'modern'; // Default modern as fallback
        }
        if (data.mode === 'visa-letter') {
            return id === 'visa-official' || id === 'classic';
        }
        if (data.mode === 'cv') {
            return id.startsWith('cv-');
        }
        if (data.mode === 'resume') {
            return id.startsWith('resume-') || id === 'modern' || id === 'classic' || id === 'sidebar' || id === 'minimalist';
        }

        // Then apply sub-filters within the mode if applicable
        if (templateFilter === 'all') return true;
        if (templateFilter === 'ats') return id.includes('ats');
        if (templateFilter === 'photo') return id === 'sidebar' || id === 'cv-international';
        if (templateFilter === 'two-column') return id === 'sidebar' || id === 'modern';
        return true;
    });

    return (
        <div className="flex flex-col h-full bg-white border-r">
            {/* Secondary Tabs */}
            <div className="flex border-b border-slate-100 sticky top-0 bg-white z-10">
                <button
                    onClick={() => setActiveSection('template')}
                    className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1 transition-all ${activeSection === 'template' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <PaletteIcon className="w-5 h-5" />
                    Template
                </button>
                <button
                    onClick={() => setActiveSection('text')}
                    className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1 transition-all ${activeSection === 'text' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <TypeIcon className="w-5 h-5" />
                    Typography
                </button>
                <button
                    onClick={() => setActiveSection('layout')}
                    className={`flex-1 py-4 text-xs font-bold flex flex-col items-center gap-1 transition-all ${activeSection === 'layout' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30' : 'text-slate-400 hover:text-slate-600'}`}
                >
                    <LayoutIcon className="w-5 h-5" />
                    Layout
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                {activeSection === 'template' && (
                    <>
                        {/* Main Color Selection */}
                        <section>
                            <h3 className="text-sm font-bold text-slate-900 mb-4">Theme Color</h3>
                            <div className="flex flex-wrap gap-3">
                                {COLORS.map((color) => (
                                    <button
                                        key={color.hex}
                                        onClick={() => updateData({ themeColor: color.hex })}
                                        className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center ${data.themeColor === color.hex ? 'border-blue-500 scale-110 shadow-lg' : 'border-transparent hover:scale-105 hover:border-slate-200'}`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    >
                                        {data.themeColor === color.hex && <CheckIcon className="w-4 h-4 text-white" />}
                                    </button>
                                ))}
                                <div className="relative group">
                                    <input
                                        type="color"
                                        value={data.themeColor}
                                        onChange={(e) => updateData({ themeColor: e.target.value })}
                                        className="w-9 h-9 rounded-full border border-slate-200 cursor-pointer overflow-hidden p-0 bg-transparent"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Template Filter */}
                        <section>
                            <h3 className="text-sm font-bold text-slate-900 mb-4">Templates</h3>
                            <div className="flex gap-2 min-w-0 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setTemplateFilter(cat.id)}
                                        className={`px-4 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-all flex-shrink-0 ${templateFilter === cat.id ? 'bg-slate-900 text-white shadow-md' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {filteredTemplates.map(([id, template]) => (
                                    <button
                                        key={id}
                                        onClick={() => updateData({ template: id as any })}
                                        className={`relative rounded-xl border-2 transition-all overflow-hidden group aspect-[3/4] ${data.template === id ? 'border-blue-500 ring-4 ring-blue-50' : 'border-slate-100 hover:border-slate-300'}`}
                                    >
                                        <img
                                            src={ASSETS_MAPPING[id] || ASSETS_MAPPING['default']}
                                            alt={template.name}
                                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-[10px] text-white font-bold">{template.name}</p>
                                        </div>
                                        {data.template === id && (
                                            <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white shadow-lg">
                                                <CheckIcon className="w-4 h-4" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </>
                )}

                {activeSection === 'text' && (
                    <div className="space-y-8">
                        <section>
                            <h3 className="text-sm font-bold text-slate-900 mb-4">Font Family</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {FONTS.map((font) => (
                                    <button
                                        key={font.id}
                                        onClick={() => updateData({ fontFamily: font.id })}
                                        className={`w-full p-3 rounded-xl border-2 text-left transition-all flex items-center justify-between ${data.fontFamily === font.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                        style={{ fontFamily: font.id }}
                                    >
                                        <span className="font-medium text-slate-900">{font.name}</span>
                                        {data.fontFamily === font.id && <CheckIcon className="w-5 h-5 text-blue-500" />}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-slate-900 mb-4">Font Size</h3>
                            <div className="flex p-1 bg-slate-100 rounded-lg">
                                {FONT_SIZES.map((size) => (
                                    <button
                                        key={size.id}
                                        onClick={() => updateData({ fontSize: size.id as any })}
                                        className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${data.fontSize === size.id ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        {size.name}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                )}

                {activeSection === 'layout' && (
                    <div className="space-y-8">
                        <section>
                            <h3 className="text-sm font-bold text-slate-900 mb-4">Document Margins</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {MARGINS.map((margin) => (
                                    <button
                                        key={margin.id}
                                        onClick={() => updateData({ margins: margin.id as any })}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${data.margins === margin.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{margin.name}</span>
                                            <span className="text-[10px] text-slate-500 lowercase">Adjust white space on edges</span>
                                        </div>
                                        {data.margins === margin.id && <CheckIcon className="w-5 h-5 text-blue-500" />}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <h3 className="text-sm font-bold text-slate-900 mb-4">Section Spacing</h3>
                            <div className="grid grid-cols-1 gap-2">
                                {SPACING.map((s) => (
                                    <button
                                        key={s.id}
                                        onClick={() => updateData({ sectionSpacing: s.id as any })}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${data.sectionSpacing === s.id ? 'border-blue-500 bg-blue-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                    >
                                        <div className="flex flex-col">
                                            <span className="font-bold text-slate-900">{s.name}</span>
                                            <span className="text-[10px] text-slate-500 lowercase">Vertical gap between components</span>
                                        </div>
                                        {data.sectionSpacing === s.id && <CheckIcon className="w-5 h-5 text-blue-500" />}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CustomizePanel;
