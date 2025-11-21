import React, { forwardRef } from 'react';
import { ResumeData, AIResumeOutput, AICoverLetterOutput } from '../types';
import { MailIcon, PhoneIcon, MapPinIcon, GlobeIcon } from './Icons';

interface ResumePreviewProps {
  raw: ResumeData;
  aiContent: AIResumeOutput | null;
  aiCoverLetter?: AICoverLetterOutput | null;
}

const ResumePreview = forwardRef<HTMLDivElement, ResumePreviewProps>(({ raw, aiContent, aiCoverLetter }, ref) => {
  const themeColor = raw.themeColor || '#1e3a8a'; // Default to Navy if not set

  // --- HEADER RENDERERS FOR COVER LETTER REUSE ---
  
  // 1. CORPORATE HEADER (Photo, Dark bg)
  const renderCorporateHeader = () => (
    <header className="text-white p-10 pb-8 flex items-center justify-between relative overflow-hidden print:p-8 break-inside-avoid" style={{ backgroundColor: themeColor }}>
       {/* Decorative Circle */}
       <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-32 pointer-events-none"></div>
       
       <div className="flex items-center gap-8 relative z-10">
         {raw.photo && (
           <div className="w-24 h-24 rounded-full border-[3px] border-white/30 shadow-xl overflow-hidden shrink-0 bg-white">
              <img src={raw.photo} alt={raw.fullName} className="w-full h-full object-cover" />
           </div>
         )}
         <div>
           <h1 className="text-3xl font-bold uppercase tracking-wide mb-2 text-white">{raw.fullName || "Your Name"}</h1>
           <p className="text-lg font-light text-white/90">{raw.targetRole || "Professional Title"}</p>
         </div>
       </div>
       
       <div className="text-right text-sm font-medium text-white/90 space-y-2 relative z-10 hidden sm:block">
          {raw.email && <div className="flex items-center justify-end gap-3"><span>{raw.email}</span><MailIcon className="w-4 h-4 opacity-80" /></div>}
          {raw.phone && <div className="flex items-center justify-end gap-3"><span>{raw.phone}</span><PhoneIcon className="w-4 h-4 opacity-80" /></div>}
          {raw.location && <div className="flex items-center justify-end gap-3"><span>{raw.location}</span><MapPinIcon className="w-4 h-4 opacity-80" /></div>}
          {raw.linkedin && <div className="flex items-center justify-end gap-3"><span>{raw.linkedin.replace(/^https?:\/\//, '')}</span><GlobeIcon className="w-4 h-4 opacity-80" /></div>}
          {raw.website && <div className="flex items-center justify-end gap-3"><span>{raw.website.replace(/^https?:\/\//, '')}</span><GlobeIcon className="w-4 h-4 opacity-80" /></div>}
       </div>
    </header>
  );

  // 2. MODERN/SIDEBAR HEADER (Simple, Color text)
  const renderModernHeader = () => (
    <div className="p-10 pb-6 border-b break-inside-avoid" style={{ borderColor: themeColor }}>
      <h1 className="text-4xl font-bold mb-2" style={{ color: themeColor }}>{raw.fullName || "Your Name"}</h1>
      <div className="text-sm text-slate-600 flex flex-wrap gap-x-4 items-center">
         {raw.location && <span>{raw.location}</span>}
         {raw.email && <span>• {raw.email}</span>}
         {raw.phone && <span>• {raw.phone}</span>}
         {raw.linkedin && <span>• {raw.linkedin.replace(/^https?:\/\//, '')}</span>}
         {raw.website && (
           <span className="flex items-center">
             • 
             <a 
               href={raw.website.startsWith('http') ? raw.website : `https://${raw.website}`} 
               target="_blank" 
               rel="noreferrer"
               className="ml-2 font-bold px-1 rounded transition-all hover:bg-slate-50 border-b-2"
               style={{ color: themeColor, borderColor: `${themeColor}60` }}
             >
               {raw.website.replace(/^https?:\/\//, '')}
             </a>
           </span>
         )}
      </div>
    </div>
  );

  // 3. CLASSIC HEADER (Centered, Serif/Sans)
  const renderClassicHeader = () => (
    <header className="border-b-2 pb-6 mb-6 break-inside-avoid" style={{ borderColor: themeColor }}>
      <h1 className="text-4xl font-serif font-bold uppercase tracking-wide mb-2" style={{ color: themeColor }}>
        {raw.fullName || "Your Name"}
      </h1>
      <div className="text-sm text-slate-600 flex flex-wrap gap-x-4 gap-y-1 items-center">
        {raw.location && <span>{raw.location}</span>}
        {raw.email && <span>• {raw.email}</span>}
        {raw.phone && <span>• {raw.phone}</span>}
        {raw.linkedin && <span>• {raw.linkedin.replace(/^https?:\/\//, '')}</span>}
        {raw.website && (
           <span className="flex items-center">
             • 
             <a 
               href={raw.website.startsWith('http') ? raw.website : `https://${raw.website}`} 
               target="_blank" 
               rel="noreferrer"
               className="ml-2 font-bold underline decoration-2 underline-offset-2 hover:opacity-80 transition-opacity"
               style={{ color: themeColor, textDecorationColor: `${themeColor}80` }}
             >
               {raw.website.replace(/^https?:\/\//, '')}
             </a>
           </span>
         )}
      </div>
    </header>
  );

  // 4. EXECUTIVE HEADER
  const renderExecutiveHeader = () => (
    <header className="flex justify-between items-start border-b-4 pb-6 mb-10 break-inside-avoid" style={{ borderColor: themeColor }}>
      <div className="flex items-start gap-6">
        {raw.photo && (
           <div className="w-20 h-20 rounded-full overflow-hidden shrink-0 border-2 border-slate-100">
              <img src={raw.photo} alt="Profile" className="w-full h-full object-cover" />
           </div>
        )}
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tight mb-2 text-slate-900">
            {raw.fullName || "Your Name"}
          </h1>
          <p className="text-lg font-medium text-slate-500">{raw.targetRole || "Senior Professional"}</p>
        </div>
      </div>
      <div className="text-right text-sm text-slate-600 space-y-1">
         {raw.email && <div>{raw.email}</div>}
         {raw.phone && <div>{raw.phone}</div>}
         {raw.location && <div>{raw.location}</div>}
         {raw.website && <div className="font-medium" style={{ color: themeColor }}>{raw.website.replace(/^https?:\/\//, '')}</div>}
      </div>
    </header>
  );

  // --- COVER LETTER RENDERER ---
  if (raw.mode === 'cover-letter') {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
           <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-800 mx-auto box-border flex flex-col print:w-full print:min-h-0 print:h-auto print:overflow-visible">
              
              {/* Dynamic Header based on selection */}
              {raw.template === 'cv-corporate' && renderCorporateHeader()}
              {(raw.template === 'modern' || raw.template === 'sidebar') && renderModernHeader()}
              {(raw.template === 'classic' || raw.template === 'cv-academic') && <div className="p-[15mm] pb-0">{renderClassicHeader()}</div>}
              {(raw.template === 'minimalist' || raw.template === 'cv-executive') && <div className="p-[20mm] pb-0">{renderExecutiveHeader()}</div>}

              <div className="flex-1 p-10 sm:p-14 print:p-12 text-slate-700 leading-relaxed">
                
                {/* Date & Recipient Block */}
                <div className="mb-8 break-inside-avoid">
                  <p className="mb-6 font-medium text-slate-500">{today}</p>
                  
                  <div className="text-slate-900">
                    <p className="font-bold">{raw.recipientName || "Hiring Manager"}</p>
                    {raw.recipientRole && <p>{raw.recipientRole}</p>}
                    <p className="font-bold mt-1">{raw.companyName || "Company Name"}</p>
                    {raw.companyAddress && <p className="text-slate-500 text-sm whitespace-pre-line">{raw.companyAddress}</p>}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4 text-[10.5pt] text-justify">
                   {aiCoverLetter ? (
                      <>
                        <p className="font-bold text-slate-900 mb-4">{aiCoverLetter.subject || `Application for ${raw.targetRole} position`}</p>
                        <p className="mb-4">{aiCoverLetter.salutation}</p>
                        <p className="mb-4">{aiCoverLetter.opening}</p>
                        {aiCoverLetter.bodyParagraphs.map((para, idx) => (
                          <p key={idx} className="mb-4">{para}</p>
                        ))}
                        <p className="mb-8 font-medium">{aiCoverLetter.closing}</p>
                        <div className="mt-8">
                          <p className="mb-2">{aiCoverLetter.signOff}</p>
                          <p className="font-bold text-slate-900 text-lg font-serif">{raw.fullName}</p>
                        </div>
                      </>
                   ) : (
                      <div className="opacity-50 italic space-y-4">
                         <p>Dear Hiring Manager,</p>
                         <p>I am writing to express my strong interest in the {raw.targetRole || "[Job Title]"} position at {raw.companyName || "[Company Name]"}, as advertised.</p>
                         <p>[Generate your cover letter to see a professional, persuasive argument tailored to your profile and the job description here...]</p>
                         <p>Sincerely,</p>
                         <p>{raw.fullName}</p>
                      </div>
                   )}
                </div>
              </div>

              {/* Footer for Corporate/Modern consistency */}
              {(raw.template === 'cv-corporate' || raw.template === 'sidebar') && (
                <div className="h-4 w-full print:hidden" style={{ backgroundColor: themeColor }}></div>
              )}
           </div>
        </div>
      </div>
    );
  }


  // --- STANDARD RESUME/CV DATA PREP ---
  const dataToRender = {
    summary: aiContent?.summary || raw.summary,
    skills: aiContent?.skills || raw.skills.split(',').map(s => s.trim()).filter(Boolean),
    languages: aiContent?.languages || (raw.languages ? raw.languages.split(',').map(s => s.trim()).filter(Boolean) : []),
    experience: aiContent?.experience || raw.experience.map(e => ({
      company: e.company,
      role: e.role,
      dates: e.dates,
      bullets: [e.description]
    })),
    internships: aiContent?.internships || raw.internships.map(e => ({
      company: e.company,
      role: e.role,
      dates: e.dates,
      bullets: [e.description]
    })),
    volunteering: aiContent?.volunteering || raw.volunteering.map(e => ({
      company: e.company,
      role: e.role,
      dates: e.dates,
      bullets: [e.description]
    })),
    projects: aiContent?.projects || raw.projects.map(p => ({
      name: p.name,
      link: p.link,
      dates: p.dates,
      bullets: [p.description]
    })),
    achievements: aiContent?.achievements || raw.achievements.split('\n').map(a => a.trim()).filter(Boolean),
    publications: aiContent?.publications || (raw.publications ? raw.publications.split('\n').map(a => a.trim()).filter(Boolean) : []),
    certifications: aiContent?.certifications || (raw.certifications ? raw.certifications.split('\n').map(a => a.trim()).filter(Boolean) : [])
  };

  const SectionTitle = ({ title, className = '' }: { title: string; className?: string }) => (
    <h2 
      className={`text-sm font-bold uppercase tracking-widest mb-3 border-b pb-1 ${className}`}
      style={{ color: raw.template === 'modern' ? themeColor : '#64748b', borderColor: raw.template === 'modern' ? themeColor : '#e2e8f0' }}
    >
      {title}
    </h2>
  );

  // --- TEMPLATE: CORPORATE CV (Top-Tier, Shaded Sidebar, Photo) ---
  if (raw.template === 'cv-corporate') {
    return (
       <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-800 mx-auto box-border flex flex-col print:w-full print:min-h-0 print:h-auto print:overflow-visible">
            
            {/* Header Area */}
            {renderCorporateHeader()}

            <div className="flex flex-1 min-h-0 print:block">
               {/* Left Column (Main) */}
               <div className="flex-[2.2] p-10 pr-8 print:p-8 print:w-full">
                  {dataToRender.summary && (
                    <section className="mb-10 break-inside-avoid">
                      <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-3" style={{ color: themeColor }}>
                         <span className="w-8 h-0.5 bg-slate-300"></span>
                         Professional Profile
                      </h2>
                      <p className="text-sm leading-7 text-slate-700 text-justify">{dataToRender.summary}</p>
                    </section>
                  )}

                  {dataToRender.experience.length > 0 && (
                    <section className="mb-10">
                       <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3" style={{ color: themeColor }}>
                         <span className="w-8 h-0.5 bg-slate-300"></span>
                         Experience
                      </h2>
                      <div className="space-y-8">
                        {dataToRender.experience.map((exp, idx) => (
                          <div key={idx} className="break-inside-avoid">
                            <div className="flex justify-between items-baseline mb-1">
                              <h3 className="font-bold text-slate-900 text-base">{exp.role}</h3>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{exp.dates}</span>
                            </div>
                            <div className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                              {exp.company}
                            </div>
                            <ul className="list-disc list-outside ml-4 space-y-1.5">
                              {exp.bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1 text-justify">{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {dataToRender.internships.length > 0 && (
                    <section className="mb-10">
                       <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3" style={{ color: themeColor }}>
                         <span className="w-8 h-0.5 bg-slate-300"></span>
                         Internships
                      </h2>
                      <div className="space-y-8">
                        {dataToRender.internships.map((exp, idx) => (
                          <div key={idx} className="break-inside-avoid">
                            <div className="flex justify-between items-baseline mb-1">
                              <h3 className="font-bold text-slate-900 text-base">{exp.role}</h3>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{exp.dates}</span>
                            </div>
                            <div className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                              {exp.company}
                            </div>
                            <ul className="list-disc list-outside ml-4 space-y-1.5">
                              {exp.bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1 text-justify">{bullet}</li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {dataToRender.projects.length > 0 && (
                    <section className="mb-10">
                       <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3" style={{ color: themeColor }}>
                         <span className="w-8 h-0.5 bg-slate-300"></span>
                         Key Projects
                      </h2>
                      <div className="space-y-6">
                         {dataToRender.projects.map((proj, idx) => (
                           <div key={idx} className="break-inside-avoid">
                             <h3 className="font-bold text-slate-900 text-sm flex justify-between items-center mb-1">
                               <span>{proj.name}</span>
                               <span className="text-slate-400 font-medium text-xs">{proj.dates}</span>
                             </h3>
                             {proj.link && <a href={proj.link} className="text-xs text-blue-600 hover:underline mb-2 block">{proj.link}</a>}
                             <ul className="list-disc list-outside ml-4 mt-2 space-y-1.5">
                              {proj.bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1 text-justify">{bullet}</li>
                              ))}
                            </ul>
                           </div>
                         ))}
                      </div>
                    </section>
                  )}
                  
                  {dataToRender.volunteering.length > 0 && (
                    <section>
                       <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3" style={{ color: themeColor }}>
                         <span className="w-8 h-0.5 bg-slate-300"></span>
                         Volunteering
                      </h2>
                      <div className="space-y-6">
                         {dataToRender.volunteering.map((vol, idx) => (
                           <div key={idx} className="break-inside-avoid">
                             <div className="flex justify-between items-baseline mb-1">
                               <h3 className="font-bold text-slate-900 text-sm">{vol.role}</h3>
                               <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">{vol.dates}</span>
                             </div>
                             <div className="text-sm font-medium text-slate-700 mb-2">{vol.company}</div>
                             <ul className="list-disc list-outside ml-4 space-y-1.5">
                              {vol.bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1 text-justify">{bullet}</li>
                              ))}
                            </ul>
                           </div>
                         ))}
                      </div>
                    </section>
                  )}
               </div>

               {/* Right Column (Sidebar) */}
               <div className="flex-1 bg-slate-50 p-10 pl-6 border-l border-slate-100 print:bg-slate-50 print:p-8 print:pl-8 print:border-l-0 print:border-t print:w-full">
                  {dataToRender.skills.length > 0 && (
                    <section className="mb-8 break-inside-avoid">
                      <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">Competencies</h2>
                      <div className="flex flex-wrap gap-2">
                        {dataToRender.skills.map((skill, idx) => (
                          <span key={idx} className="text-xs font-medium bg-white border border-slate-200 text-slate-700 px-2.5 py-1 rounded-md shadow-sm print:border-slate-300">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {dataToRender.languages && dataToRender.languages.length > 0 && (
                    <section className="mb-8 break-inside-avoid">
                      <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">Languages</h2>
                      <ul className="space-y-2">
                        {dataToRender.languages.map((lang, idx) => (
                          <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400 print:bg-slate-600"></span>
                            {lang}
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {raw.education.length > 0 && (
                    <section className="mb-8 break-inside-avoid">
                      <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">Education</h2>
                      <div className="space-y-5">
                        {raw.education.map((edu, idx) => (
                          <div key={idx}>
                            <div className="font-bold text-slate-900 text-sm leading-tight">{edu.school}</div>
                            <div className="text-xs text-slate-600 mt-1 font-medium">{edu.degree}</div>
                            <div className="text-xs text-slate-400 mt-1 italic">{edu.dates}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                   {dataToRender.certifications && dataToRender.certifications.length > 0 && (
                    <section className="mb-8 break-inside-avoid">
                      <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">Certifications</h2>
                       <ul className="space-y-3">
                        {dataToRender.certifications.map((cert, idx) => (
                          <li key={idx} className="text-xs text-slate-600 leading-relaxed">
                             {cert}
                          </li>
                        ))}
                       </ul>
                    </section>
                  )}
                  
                  {dataToRender.publications && dataToRender.publications.length > 0 && (
                    <section className="mb-8 break-inside-avoid">
                      <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">Publications</h2>
                       <ul className="space-y-3">
                        {dataToRender.publications.map((pub, idx) => (
                          <li key={idx} className="text-xs text-slate-600 leading-relaxed italic">
                             {pub}
                          </li>
                        ))}
                       </ul>
                    </section>
                  )}

                  {dataToRender.achievements && dataToRender.achievements.length > 0 && (
                    <section className="break-inside-avoid">
                      <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">Awards</h2>
                       <ul className="space-y-3">
                        {dataToRender.achievements.map((ach, idx) => (
                          <li key={idx} className="text-xs text-slate-600 leading-relaxed">
                             {ach}
                          </li>
                        ))}
                       </ul>
                    </section>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: ACADEMIC CV ---
  if (raw.template === 'cv-academic') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white p-[20mm] text-slate-900 font-serif mx-auto box-border print:w-full print:min-h-0 print:p-[15mm] print:h-auto print:overflow-visible">
            
            {/* Header - Centered & Formal */}
            <header className="mb-10 text-center border-b-2 border-slate-900 pb-8 relative break-inside-avoid">
               {raw.photo && (
                <div className="absolute top-0 right-0 w-24 h-24 border border-slate-200 p-1 bg-white hidden sm:block print:block">
                   <img src={raw.photo} alt="Profile" className="w-full h-full object-cover grayscale" />
                </div>
              )}
              
              <h1 className="text-3xl font-bold uppercase tracking-wider mb-4 text-slate-900">
                {raw.fullName || "Your Name"}
              </h1>
              
              <div className="text-sm text-slate-700 flex flex-wrap justify-center gap-x-4 gap-y-1 max-w-2xl mx-auto">
                {raw.location && <span>{raw.location}</span>}
                {raw.email && <span>• {raw.email}</span>}
                {raw.phone && <span>• {raw.phone}</span>}
                {raw.website && <span>• {raw.website.replace(/^https?:\/\//, '')}</span>}
                {raw.linkedin && <span>• {raw.linkedin}</span>}
              </div>
            </header>

            {/* Summary */}
            {dataToRender.summary && (
              <section className="mb-8 break-inside-avoid">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">Professional Profile</h2>
                <p className="text-sm leading-relaxed text-slate-800 text-justify">{dataToRender.summary}</p>
              </section>
            )}

            {/* Education - Top Priority for Academic */}
            {raw.education.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">Education</h2>
                <div className="space-y-4">
                  {raw.education.map((edu, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-slate-900 text-base">{edu.school}</h3>
                        <span className="text-sm text-slate-700 font-medium">{edu.dates}</span>
                      </div>
                      <div className="text-sm italic text-slate-800 mt-1">{edu.degree}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Experience */}
            {dataToRender.experience.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">Academic & Professional Experience</h2>
                <div className="space-y-6">
                  {dataToRender.experience.map((exp, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900 text-base">{exp.role}</h3>
                        <span className="text-sm text-slate-700 font-medium">{exp.dates}</span>
                      </div>
                      <div className="text-sm font-bold italic text-slate-800 mb-2">{exp.company}</div>
                      <ul className="list-disc list-outside ml-5 space-y-1.5">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-800 pl-1 text-justify">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Internships */}
            {dataToRender.internships.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">Internships</h2>
                <div className="space-y-6">
                  {dataToRender.internships.map((exp, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900 text-base">{exp.role}</h3>
                        <span className="text-sm text-slate-700 font-medium">{exp.dates}</span>
                      </div>
                      <div className="text-sm font-bold italic text-slate-800 mb-2">{exp.company}</div>
                      <ul className="list-disc list-outside ml-5 space-y-1.5">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-800 pl-1 text-justify">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Publications */}
            {dataToRender.publications && dataToRender.publications.length > 0 && (
              <section className="mb-8 break-inside-avoid">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">Publications & Papers</h2>
                <ul className="list-decimal list-outside ml-5 space-y-3">
                   {dataToRender.publications.map((pub, idx) => (
                     <li key={idx} className="text-sm leading-relaxed text-slate-800 pl-1 text-justify">{pub}</li>
                   ))}
                </ul>
              </section>
            )}

            {/* Research / Projects */}
            {dataToRender.projects.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">Research Projects</h2>
                <div className="space-y-5">
                   {dataToRender.projects.map((proj, idx) => (
                     <div key={idx} className="break-inside-avoid">
                       <div className="flex justify-between items-baseline mb-1">
                         <h3 className="font-bold text-slate-900">
                           {proj.name} {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-xs font-normal underline ml-1 text-slate-600">[Link]</a>}
                         </h3>
                         <span className="text-sm text-slate-700 font-medium">{proj.dates}</span>
                       </div>
                       <ul className="list-disc list-outside ml-5 space-y-1">
                        {proj.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-800 pl-1 text-justify">{bullet}</li>
                        ))}
                      </ul>
                     </div>
                   ))}
                </div>
              </section>
            )}

            {/* Volunteering */}
            {dataToRender.volunteering.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">Service & Volunteering</h2>
                <div className="space-y-6">
                  {dataToRender.volunteering.map((exp, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900 text-base">{exp.role}</h3>
                        <span className="text-sm text-slate-700 font-medium">{exp.dates}</span>
                      </div>
                      <div className="text-sm font-bold italic text-slate-800 mb-2">{exp.company}</div>
                      <ul className="list-disc list-outside ml-5 space-y-1.5">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-800 pl-1 text-justify">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Certifications */}
            {dataToRender.certifications && dataToRender.certifications.length > 0 && (
               <section className="mb-8 break-inside-avoid">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">Certifications</h2>
                <ul className="list-disc list-outside ml-5 space-y-1.5">
                   {dataToRender.certifications.map((cert, idx) => (
                     <li key={idx} className="text-sm leading-relaxed text-slate-800 pl-1">{cert}</li>
                   ))}
                </ul>
              </section>
            )}

            {/* Languages & Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 break-inside-avoid">
                {dataToRender.languages && dataToRender.languages.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">Languages</h2>
                    <ul className="list-none space-y-1">
                      {dataToRender.languages.map((lang, idx) => (
                        <li key={idx} className="text-sm leading-relaxed text-slate-800">{lang}</li>
                      ))}
                    </ul>
                  </section>
                )}
                
                {dataToRender.skills.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">Technical Skills</h2>
                    <p className="text-sm leading-relaxed text-slate-800">
                      {dataToRender.skills.join(' • ')}
                    </p>
                  </section>
                )}
            </div>
            
            {/* Achievements */}
            {dataToRender.achievements && dataToRender.achievements.length > 0 && (
              <section className="mt-8 break-inside-avoid">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">Awards & Honors</h2>
                 <ul className="list-disc list-outside ml-5 space-y-1">
                    {dataToRender.achievements.map((ach, idx) => (
                      <li key={idx} className="text-sm leading-relaxed text-slate-800 pl-1">{ach}</li>
                    ))}
                 </ul>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: EXECUTIVE CV ---
  if (raw.template === 'cv-executive') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white p-[20mm] text-slate-800 mx-auto box-border print:w-full print:min-h-0 print:p-[15mm] print:h-auto print:overflow-visible">
            
            {renderExecutiveHeader()}

            {dataToRender.summary && (
              <section className="mb-10 break-inside-avoid">
                <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-3" style={{ color: themeColor }}>
                   <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></span>
                   Executive Profile
                </h2>
                <p className="text-sm leading-relaxed text-slate-700">{dataToRender.summary}</p>
              </section>
            )}

            <div className="grid grid-cols-3 gap-8">
               {/* Main Column */}
               <div className="col-span-2">
                  {dataToRender.experience.length > 0 && (
                    <section className="mb-10">
                      <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3" style={{ color: themeColor }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></span>
                        Professional Experience
                      </h2>
                      <div className="space-y-8">
                        {dataToRender.experience.map((exp, idx) => (
                          <div key={idx} className="break-inside-avoid">
                            <div className="flex justify-between items-baseline mb-1">
                              <h3 className="font-bold text-slate-900 text-base">{exp.role}</h3>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{exp.dates}</span>
                            </div>
                            <div className="text-sm font-semibold text-slate-600 mb-3">{exp.company}</div>
                            <ul className="list-none space-y-2">
                              {exp.bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="text-sm leading-relaxed text-slate-600 relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-slate-400">
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {dataToRender.internships.length > 0 && (
                    <section className="mb-10">
                      <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3" style={{ color: themeColor }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></span>
                        Internships
                      </h2>
                      <div className="space-y-8">
                        {dataToRender.internships.map((exp, idx) => (
                          <div key={idx} className="break-inside-avoid">
                            <div className="flex justify-between items-baseline mb-1">
                              <h3 className="font-bold text-slate-900 text-base">{exp.role}</h3>
                              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{exp.dates}</span>
                            </div>
                            <div className="text-sm font-semibold text-slate-600 mb-3">{exp.company}</div>
                            <ul className="list-none space-y-2">
                              {exp.bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="text-sm leading-relaxed text-slate-600 relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-slate-400">
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {dataToRender.projects.length > 0 && (
                    <section className="mb-10">
                      <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3" style={{ color: themeColor }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></span>
                        Key Projects
                      </h2>
                      <div className="space-y-6">
                         {dataToRender.projects.map((proj, idx) => (
                           <div key={idx} className="break-inside-avoid">
                             <h3 className="font-bold text-slate-900 text-sm flex justify-between">
                               <span>{proj.name}</span>
                               <span className="text-slate-400 font-normal text-xs">{proj.dates}</span>
                             </h3>
                             {proj.link && <a href={proj.link} className="text-xs text-blue-600 hover:underline mb-2 block">{proj.link}</a>}
                             <ul className="list-none space-y-1 mt-2">
                              {proj.bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="text-sm leading-relaxed text-slate-600 relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-slate-400">{bullet}</li>
                              ))}
                            </ul>
                           </div>
                         ))}
                      </div>
                    </section>
                  )}
                  
                   {dataToRender.volunteering.length > 0 && (
                    <section className="mb-10">
                      <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3" style={{ color: themeColor }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></span>
                        Volunteering
                      </h2>
                      <div className="space-y-6">
                         {dataToRender.volunteering.map((vol, idx) => (
                           <div key={idx} className="break-inside-avoid">
                             <div className="flex justify-between items-baseline mb-1">
                               <h3 className="font-bold text-slate-900 text-sm">{vol.role}</h3>
                               <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{vol.dates}</span>
                             </div>
                             <div className="text-sm font-semibold text-slate-600 mb-2">{vol.company}</div>
                             <ul className="list-none space-y-1 mt-2">
                              {vol.bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="text-sm leading-relaxed text-slate-600 relative pl-4 before:content-['•'] before:absolute before:left-0 before:text-slate-400">{bullet}</li>
                              ))}
                            </ul>
                           </div>
                         ))}
                      </div>
                    </section>
                  )}

                   {dataToRender.publications && dataToRender.publications.length > 0 && (
                    <section className="mb-10 break-inside-avoid">
                      <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-3" style={{ color: themeColor }}>
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></span>
                        Publications
                      </h2>
                       <ul className="list-none space-y-2">
                        {dataToRender.publications.map((pub, idx) => (
                          <li key={idx} className="text-sm leading-relaxed text-slate-600">{pub}</li>
                        ))}
                      </ul>
                    </section>
                  )}
               </div>

               {/* Side Column */}
               <div className="col-span-1 space-y-10">
                  {raw.education.length > 0 && (
                    <section className="break-inside-avoid">
                      <h2 className="text-sm font-bold uppercase tracking-widest mb-4 pb-2 border-b border-slate-200" style={{ color: themeColor }}>Education</h2>
                      <div className="space-y-4">
                        {raw.education.map((edu, idx) => (
                          <div key={idx}>
                            <div className="font-bold text-slate-900 text-sm">{edu.school}</div>
                            <div className="text-sm text-slate-600">{edu.degree}</div>
                            <div className="text-xs text-slate-400 mt-1">{edu.dates}</div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {dataToRender.skills.length > 0 && (
                    <section className="break-inside-avoid">
                      <h2 className="text-sm font-bold uppercase tracking-widest mb-4 pb-2 border-b border-slate-200" style={{ color: themeColor }}>Expertise</h2>
                      <div className="flex flex-col gap-2">
                        {dataToRender.skills.map((skill, idx) => (
                          <span key={idx} className="text-sm text-slate-600 font-medium">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </section>
                  )}

                  {dataToRender.languages && dataToRender.languages.length > 0 && (
                    <section className="break-inside-avoid">
                      <h2 className="text-sm font-bold uppercase tracking-widest mb-4 pb-2 border-b border-slate-200" style={{ color: themeColor }}>Languages</h2>
                      <ul className="space-y-2">
                        {dataToRender.languages.map((lang, idx) => (
                          <li key={idx} className="text-sm text-slate-600">{lang}</li>
                        ))}
                      </ul>
                    </section>
                  )}

                  {dataToRender.certifications && dataToRender.certifications.length > 0 && (
                    <section className="break-inside-avoid">
                      <h2 className="text-sm font-bold uppercase tracking-widest mb-4 pb-2 border-b border-slate-200" style={{ color: themeColor }}>Credentials</h2>
                       <ul className="space-y-2">
                        {dataToRender.certifications.map((cert, idx) => (
                          <li key={idx} className="text-sm text-slate-600">{cert}</li>
                        ))}
                       </ul>
                    </section>
                  )}

                  {dataToRender.achievements && dataToRender.achievements.length > 0 && (
                    <section className="break-inside-avoid">
                      <h2 className="text-sm font-bold uppercase tracking-widest mb-4 pb-2 border-b border-slate-200" style={{ color: themeColor }}>Honors</h2>
                       <ul className="space-y-2">
                        {dataToRender.achievements.map((ach, idx) => (
                          <li key={idx} className="text-sm text-slate-600 italic">"{ach}"</li>
                        ))}
                       </ul>
                    </section>
                  )}
               </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: CLASSIC (Simple Top-Down) ---
  if (raw.template === 'classic') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white p-[15mm] text-slate-800 mx-auto box-border print:w-full print:min-h-0 print:p-[10mm] print:h-auto print:overflow-visible">
            
            {renderClassicHeader()}

            {dataToRender.summary && (
              <section className="mb-6 break-inside-avoid">
                <SectionTitle title="Professional Profile" />
                <p className="text-sm leading-relaxed text-slate-700">{dataToRender.summary}</p>
              </section>
            )}

            {dataToRender.experience.length > 0 && (
              <section className="mb-6">
                <SectionTitle title="Professional Experience" />
                <div className="space-y-5">
                  {dataToRender.experience.map((exp, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900">{exp.role}</h3>
                        <span className="text-sm font-medium text-slate-500 whitespace-nowrap">{exp.dates}</span>
                      </div>
                      <div className="text-slate-700 font-medium mb-2" style={{ color: themeColor }}>{exp.company}</div>
                      <ul className="list-disc list-outside ml-4 space-y-1">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.internships.length > 0 && (
              <section className="mb-6">
                <SectionTitle title="Internships" />
                <div className="space-y-5">
                  {dataToRender.internships.map((exp, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-slate-900">{exp.role}</h3>
                        <span className="text-sm font-medium text-slate-500 whitespace-nowrap">{exp.dates}</span>
                      </div>
                      <div className="text-slate-700 font-medium mb-2" style={{ color: themeColor }}>{exp.company}</div>
                      <ul className="list-disc list-outside ml-4 space-y-1">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {dataToRender.projects.length > 0 && (
              <section className="mb-6">
                <SectionTitle title="Projects" />
                <div className="space-y-4">
                   {dataToRender.projects.map((proj, idx) => (
                     <div key={idx} className="break-inside-avoid">
                       <div className="flex justify-between items-baseline mb-1">
                         <h3 className="font-bold text-slate-900">
                           {proj.name} {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-xs font-normal underline ml-1" style={{ color: themeColor }}>Link ↗</a>}
                         </h3>
                         <span className="text-sm font-medium text-slate-500 whitespace-nowrap">{proj.dates}</span>
                       </div>
                       <ul className="list-disc list-outside ml-4 space-y-1">
                        {proj.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                        ))}
                      </ul>
                     </div>
                   ))}
                </div>
              </section>
            )}
            
            {dataToRender.volunteering.length > 0 && (
              <section className="mb-6">
                <SectionTitle title="Volunteering" />
                <div className="space-y-4">
                   {dataToRender.volunteering.map((vol, idx) => (
                     <div key={idx} className="break-inside-avoid">
                       <div className="flex justify-between items-baseline mb-1">
                         <h3 className="font-bold text-slate-900">{vol.role}</h3>
                         <span className="text-sm font-medium text-slate-500 whitespace-nowrap">{vol.dates}</span>
                       </div>
                       <div className="text-slate-700 font-medium mb-2" style={{ color: themeColor }}>{vol.company}</div>
                       <ul className="list-disc list-outside ml-4 space-y-1">
                        {vol.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                        ))}
                      </ul>
                     </div>
                   ))}
                </div>
              </section>
            )}

            {raw.education.length > 0 && (
              <section className="mb-6 break-inside-avoid">
                <SectionTitle title="Education" />
                <div className="space-y-3">
                  {raw.education.map((edu, idx) => (
                    <div key={idx}>
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-slate-900">{edu.school}</h3>
                        <span className="text-sm text-slate-500 whitespace-nowrap">{edu.dates}</span>
                      </div>
                      <div className="text-sm text-slate-700">{edu.degree}</div>
                    </div>
                  ))}
                </div>
              </section>
            )}

             {dataToRender.achievements && dataToRender.achievements.length > 0 && (
              <section className="mb-6 break-inside-avoid">
                <SectionTitle title="Achievements" />
                 <ul className="list-disc list-outside ml-4 space-y-1">
                    {dataToRender.achievements.map((ach, idx) => (
                      <li key={idx} className="text-sm leading-relaxed text-slate-700 pl-1">{ach}</li>
                    ))}
                 </ul>
              </section>
            )}

            {dataToRender.skills.length > 0 && (
              <section className="break-inside-avoid">
                <SectionTitle title="Skills" />
                <div className="flex flex-wrap gap-2">
                  {dataToRender.skills.map((skill, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-1 rounded text-xs font-medium print:bg-transparent print:p-0 print:text-slate-700 print:after:content-[','] print:last:after:content-none print:mr-1">
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: MODERN (2-Column, Clean) ---
  if (raw.template === 'modern') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white text-slate-800 mx-auto box-border print:w-full print:min-h-0 print:h-auto print:overflow-visible flex flex-col">
            {/* Header */}
            {renderModernHeader()}

            <div className="flex flex-1 print:block">
              {/* Left Column (Main Content) */}
              <div className="flex-[1.6] p-10 pr-6 border-r border-slate-100 print:border-none print:w-full print:p-10">
                {dataToRender.summary && (
                  <div className="mb-8 break-inside-avoid">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-3" style={{ color: themeColor }}>Profile</h2>
                    <p className="text-sm leading-relaxed text-slate-700">{dataToRender.summary}</p>
                  </div>
                )}

                {dataToRender.experience.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: themeColor }}>Experience</h2>
                    <div className="space-y-6">
                      {dataToRender.experience.map((exp, idx) => (
                        <div key={idx} className="break-inside-avoid">
                          <h3 className="font-bold text-slate-900">{exp.role}</h3>
                          <div className="text-slate-600 font-medium text-sm mb-2">{exp.company}</div>
                          <ul className="list-disc list-outside ml-4 space-y-1">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {dataToRender.internships.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: themeColor }}>Internships</h2>
                    <div className="space-y-6">
                      {dataToRender.internships.map((exp, idx) => (
                        <div key={idx} className="break-inside-avoid">
                          <h3 className="font-bold text-slate-900">{exp.role}</h3>
                          <div className="text-slate-600 font-medium text-sm mb-2">{exp.company}</div>
                          <ul className="list-disc list-outside ml-4 space-y-1">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dataToRender.projects.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: themeColor }}>Projects</h2>
                    <div className="space-y-5">
                       {dataToRender.projects.map((proj, idx) => (
                         <div key={idx} className="break-inside-avoid">
                           <h3 className="font-bold text-slate-900 flex items-center gap-2">
                             {proj.name}
                             {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className="text-xs underline opacity-70 hover:opacity-100">Link</a>}
                           </h3>
                           <ul className="list-disc list-outside ml-4 mt-2 space-y-1">
                            {proj.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1">{bullet}</li>
                            ))}
                          </ul>
                         </div>
                       ))}
                    </div>
                  </div>
                )}

                {dataToRender.volunteering.length > 0 && (
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: themeColor }}>Volunteering</h2>
                    <div className="space-y-5">
                       {dataToRender.volunteering.map((vol, idx) => (
                         <div key={idx} className="break-inside-avoid">
                           <h3 className="font-bold text-slate-900">{vol.role}</h3>
                           <div className="text-slate-600 font-medium text-sm mb-2">{vol.company}</div>
                           <ul className="list-disc list-outside ml-4 mt-2 space-y-1">
                            {vol.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1">{bullet}</li>
                            ))}
                          </ul>
                         </div>
                       ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column (Sidebar) */}
              <div className="flex-1 p-10 pl-6 bg-slate-50/30 print:bg-slate-50 print:w-full print:p-10 print:border-t">
                {raw.education.length > 0 && (
                  <div className="mb-8 break-inside-avoid">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: themeColor }}>Education</h2>
                    <div className="space-y-4">
                      {raw.education.map((edu, idx) => (
                        <div key={idx}>
                          <div className="font-bold text-slate-900">{edu.school}</div>
                          <div className="text-sm text-slate-700">{edu.degree}</div>
                          <div className="text-xs text-slate-500 mt-1">{edu.dates}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dataToRender.skills.length > 0 && (
                  <div className="mb-8 break-inside-avoid">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: themeColor }}>Skills</h2>
                    <div className="flex flex-wrap gap-2">
                      {dataToRender.skills.map((skill, idx) => (
                        <div key={idx} className="text-sm text-slate-700 bg-white border border-slate-200 px-2 py-1 rounded">
                          {skill}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {dataToRender.achievements && dataToRender.achievements.length > 0 && (
                  <div className="break-inside-avoid">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: themeColor }}>Achievements</h2>
                    <ul className="list-disc list-outside ml-4 space-y-2">
                      {dataToRender.achievements.map((ach, idx) => (
                        <li key={idx} className="text-sm leading-relaxed text-slate-600 pl-1">{ach}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: MINIMALIST (Executive) ---
  if (raw.template === 'minimalist') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div ref={ref} className="w-[210mm] min-h-[297mm] bg-white p-[15mm] text-slate-800 mx-auto box-border print:w-full print:min-h-0 print:p-[10mm] print:h-auto print:overflow-visible">
            {/* Header */}
            <div className="text-center border-b-2 pb-6 mb-8 break-inside-avoid" style={{ borderColor: themeColor }}>
              <h1 className="text-3xl font-serif font-bold text-slate-900 mb-3 uppercase tracking-wider">
                {raw.fullName || "Your Name"}
              </h1>
              <div className="text-sm text-slate-500 flex flex-wrap justify-center gap-4">
                 {raw.location && <span>{raw.location}</span>}
                 {raw.email && <span>{raw.email}</span>}
                 {raw.phone && <span>{raw.phone}</span>}
                 {raw.linkedin && <span>{raw.linkedin}</span>}
                 {raw.website && <span>{raw.website}</span>}
              </div>
            </div>

            {/* Content */}
            <div className="space-y-8">
               {dataToRender.summary && (
                <div className="text-center max-w-2xl mx-auto break-inside-avoid">
                   <p className="text-sm leading-relaxed text-slate-700 italic">{dataToRender.summary}</p>
                </div>
               )}

               {/* Experience */}
               {dataToRender.experience.length > 0 && (
                 <div>
                    <div className="flex items-center mb-4 break-inside-avoid">
                      <div className="h-px flex-1 bg-slate-200"></div>
                      <h2 className="px-4 text-sm font-bold uppercase tracking-widest text-slate-500">Experience</h2>
                      <div className="h-px flex-1 bg-slate-200"></div>
                    </div>
                    <div className="space-y-6">
                      {dataToRender.experience.map((exp, idx) => (
                        <div key={idx} className="break-inside-avoid">
                          <div className="flex justify-between items-end mb-2">
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg">{exp.role}</h3>
                              <div className="text-sm font-medium" style={{ color: themeColor }}>{exp.company}</div>
                            </div>
                            <span className="text-sm text-slate-500 italic">{exp.dates}</span>
                          </div>
                           <ul className="list-disc list-outside ml-4 space-y-1">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                 </div>
               )}

               {/* Internships */}
               {dataToRender.internships.length > 0 && (
                 <div>
                    <div className="flex items-center mb-4 break-inside-avoid">
                      <div className="h-px flex-1 bg-slate-200"></div>
                      <h2 className="px-4 text-sm font-bold uppercase tracking-widest text-slate-500">Internships</h2>
                      <div className="h-px flex-1 bg-slate-200"></div>
                    </div>
                    <div className="space-y-6">
                      {dataToRender.internships.map((exp, idx) => (
                        <div key={idx} className="break-inside-avoid">
                          <div className="flex justify-between items-end mb-2">
                            <div>
                              <h3 className="font-bold text-slate-900 text-lg">{exp.role}</h3>
                              <div className="text-sm font-medium" style={{ color: themeColor }}>{exp.company}</div>
                            </div>
                            <span className="text-sm text-slate-500 italic">{exp.dates}</span>
                          </div>
                           <ul className="list-disc list-outside ml-4 space-y-1">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                 </div>
               )}

               {/* Projects */}
               {dataToRender.projects.length > 0 && (
                 <div>
                    <div className="flex items-center mb-4 break-inside-avoid">
                      <div className="h-px flex-1 bg-slate-200"></div>
                      <h2 className="px-4 text-sm font-bold uppercase tracking-widest text-slate-500">Projects</h2>
                      <div className="h-px flex-1 bg-slate-200"></div>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                       {dataToRender.projects.map((proj, idx) => (
                         <div key={idx} className="break-inside-avoid">
                            <div className="flex justify-between items-baseline mb-1">
                              <h3 className="font-bold text-slate-900">{proj.name}</h3>
                              <span className="text-sm text-slate-500">{proj.dates}</span>
                            </div>
                            <p className="text-xs text-blue-600 mb-2">{proj.link}</p>
                             <ul className="list-disc list-outside ml-4 space-y-1">
                              {proj.bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                              ))}
                            </ul>
                         </div>
                       ))}
                    </div>
                 </div>
               )}
               
               {/* Volunteering */}
               {dataToRender.volunteering.length > 0 && (
                 <div>
                    <div className="flex items-center mb-4 break-inside-avoid">
                      <div className="h-px flex-1 bg-slate-200"></div>
                      <h2 className="px-4 text-sm font-bold uppercase tracking-widest text-slate-500">Volunteering</h2>
                      <div className="h-px flex-1 bg-slate-200"></div>
                    </div>
                    <div className="grid grid-cols-1 gap-6">
                       {dataToRender.volunteering.map((vol, idx) => (
                         <div key={idx} className="break-inside-avoid">
                            <div className="flex justify-between items-baseline mb-1">
                              <h3 className="font-bold text-slate-900">{vol.role}</h3>
                              <span className="text-sm text-slate-500">{vol.dates}</span>
                            </div>
                            <div className="text-sm font-medium" style={{ color: themeColor }}>{vol.company}</div>
                             <ul className="list-disc list-outside ml-4 space-y-1">
                              {vol.bullets.map((bullet, bIdx) => (
                                <li key={bIdx} className="text-sm leading-relaxed text-slate-700 pl-1">{bullet}</li>
                              ))}
                            </ul>
                         </div>
                       ))}
                    </div>
                 </div>
               )}

               {/* Education & Skills Row */}
               <div className="grid grid-cols-2 gap-8 break-inside-avoid">
                 {raw.education.length > 0 && (
                   <div>
                      <h2 className="text-center text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 pb-1 border-b border-slate-100">Education</h2>
                      <div className="space-y-4">
                        {raw.education.map((edu, idx) => (
                          <div key={idx} className="text-center">
                            <div className="font-bold text-slate-900">{edu.school}</div>
                            <div className="text-sm text-slate-700">{edu.degree}</div>
                            <div className="text-xs text-slate-500 mt-1">{edu.dates}</div>
                          </div>
                        ))}
                      </div>
                   </div>
                 )}
                 
                 {dataToRender.skills.length > 0 && (
                   <div>
                      <h2 className="text-center text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 pb-1 border-b border-slate-100">Skills</h2>
                      <div className="flex flex-wrap justify-center gap-2">
                         {dataToRender.skills.map((skill, idx) => (
                            <span key={idx} className="text-sm text-slate-700 font-medium border-b border-slate-200 pb-0.5">{skill}</span>
                         ))}
                      </div>
                   </div>
                 )}
               </div>

                 {dataToRender.achievements && dataToRender.achievements.length > 0 && (
                  <div className="break-inside-avoid">
                     <h2 className="text-center text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 pb-1 border-b border-slate-100">Achievements</h2>
                     <ul className="list-none text-center space-y-1">
                        {dataToRender.achievements.map((ach, idx) => (
                          <li key={idx} className="text-sm text-slate-700">{ach}</li>
                        ))}
                     </ul>
                  </div>
                 )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: SIDEBAR (Colored Left Col) ---
  return (
    <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
      <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
        <div 
          ref={ref}
          className="w-[210mm] min-h-[297mm] bg-white text-slate-800 relative mx-auto box-border flex flex-col print:w-full print:min-h-0 print:h-auto print:overflow-visible"
        >
          <div className="break-inside-avoid">
            <div className="p-8 pb-4">
              <h1 className="text-4xl font-bold text-slate-900 mb-2" style={{ color: themeColor }}>{raw.fullName || "Your Name"}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                 {raw.email && <span>{raw.email}</span>}
                 {raw.phone && <span>{raw.phone}</span>}
                 {raw.location && <span>{raw.location}</span>}
                 {raw.linkedin && <span>{raw.linkedin.replace(/^https?:\/\//, '')}</span>}
              </div>
            </div>
            {/* Color Separator */}
            <div className="w-full h-1 mb-0" style={{ backgroundColor: themeColor }}></div>
          </div>

          <div className="flex flex-col w-full">
            {dataToRender.summary && (
              <div className="flex break-inside-avoid">
                <div className="w-[160px] text-white p-4 pt-6 text-xs font-bold tracking-widest uppercase text-right shrink-0" style={{ backgroundColor: themeColor }}>
                  Summary
                </div>
                <div className="flex-1 p-6 border-b border-slate-100">
                  <p className="text-sm text-slate-700 leading-relaxed">{dataToRender.summary}</p>
                </div>
              </div>
            )}

             {dataToRender.experience.length > 0 && (
              <div className="flex">
                <div className="w-[160px] text-white p-4 pt-6 text-xs font-bold tracking-widest uppercase text-right shrink-0" style={{ backgroundColor: themeColor }}>
                  Work<br/>Experience
                </div>
                <div className="flex-1 p-6 border-b border-slate-100 space-y-6">
                  {dataToRender.experience.map((exp, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <div className="font-bold text-slate-900">{exp.company}</div>
                      <div className="flex justify-between items-baseline text-sm mb-2">
                        <span className="text-slate-700 italic">{exp.role}</span>
                        <span className="text-slate-500 font-medium">{exp.dates}</span>
                      </div>
                      <ul className="list-disc list-outside ml-4 space-y-1">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
             )}

             {dataToRender.internships.length > 0 && (
              <div className="flex">
                <div className="w-[160px] text-white p-4 pt-6 text-xs font-bold tracking-widest uppercase text-right shrink-0" style={{ backgroundColor: themeColor }}>
                  Internships
                </div>
                <div className="flex-1 p-6 border-b border-slate-100 space-y-6">
                  {dataToRender.internships.map((exp, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <div className="font-bold text-slate-900">{exp.company}</div>
                      <div className="flex justify-between items-baseline text-sm mb-2">
                        <span className="text-slate-700 italic">{exp.role}</span>
                        <span className="text-slate-500 font-medium">{exp.dates}</span>
                      </div>
                      <ul className="list-disc list-outside ml-4 space-y-1">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
             )}

             {raw.education.length > 0 && (
               <div className="flex break-inside-avoid">
                <div className="w-[160px] text-white p-4 pt-6 text-xs font-bold tracking-widest uppercase text-right shrink-0" style={{ backgroundColor: themeColor }}>
                  Education
                </div>
                <div className="flex-1 p-6 border-b border-slate-100 space-y-4">
                  {raw.education.map((edu, idx) => (
                    <div key={idx}>
                      <div className="font-bold text-slate-900">{edu.school}</div>
                      <div className="text-sm text-slate-700">{edu.degree}</div>
                      <div className="text-sm text-slate-500 mt-1">{edu.dates}</div>
                    </div>
                  ))}
                </div>
              </div>
             )}

             {dataToRender.projects.length > 0 && (
               <div className="flex">
                <div className="w-[160px] text-white p-4 pt-6 text-xs font-bold tracking-widest uppercase text-right shrink-0" style={{ backgroundColor: themeColor }}>
                  Project
                </div>
                <div className="flex-1 p-6 border-b border-slate-100 space-y-4">
                  {dataToRender.projects.map((proj, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {proj.name} 
                        </div>
                        <span className="text-sm text-slate-500">{proj.dates}</span>
                      </div>
                      <ul className="list-disc list-outside ml-4 mt-2 space-y-1">
                        {proj.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
             )}

             {dataToRender.volunteering.length > 0 && (
               <div className="flex">
                <div className="w-[160px] text-white p-4 pt-6 text-xs font-bold tracking-widest uppercase text-right shrink-0" style={{ backgroundColor: themeColor }}>
                  Volunteer
                </div>
                <div className="flex-1 p-6 border-b border-slate-100 space-y-4">
                  {dataToRender.volunteering.map((vol, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline">
                        <div className="font-bold text-slate-900 flex items-center gap-2">
                          {vol.role} 
                        </div>
                        <span className="text-sm text-slate-500">{vol.dates}</span>
                      </div>
                      <div className="text-slate-700 text-sm mb-1">{vol.company}</div>
                      <ul className="list-disc list-outside ml-4 mt-2 space-y-1">
                        {vol.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-sm leading-relaxed text-slate-600 pl-1">{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
             )}

              {dataToRender.skills.length > 0 && (
               <div className="flex break-inside-avoid">
                <div className="w-[160px] text-white p-4 pt-6 text-xs font-bold tracking-widest uppercase text-right shrink-0" style={{ backgroundColor: themeColor }}>
                  Skills
                </div>
                <div className="flex-1 p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                     {dataToRender.skills.map((skill, idx) => (
                       <div key={idx} className="text-sm text-slate-700 font-medium flex items-center">
                         <span className="w-1.5 h-1.5 rounded-full mr-2 opacity-60" style={{ backgroundColor: themeColor }}></span>
                         {skill}
                       </div>
                     ))}
                  </div>
                </div>
              </div>
             )}

              {dataToRender.achievements && dataToRender.achievements.length > 0 && (
               <div className="flex flex-1 break-inside-avoid">
                <div className="w-[160px] text-white p-4 pt-6 text-xs font-bold tracking-widest uppercase text-right shrink-0" style={{ backgroundColor: themeColor }}>
                  Achievement
                </div>
                <div className="flex-1 p-6">
                   <ul className="list-disc list-outside ml-4 space-y-2">
                    {dataToRender.achievements.map((ach, idx) => (
                      <li key={idx} className="text-sm leading-relaxed text-slate-600 pl-1">{ach}</li>
                    ))}
                  </ul>
                </div>
              </div>
             )}
             
             {/* Fill remaining height with colored sidebar if needed */}
             <div className="flex flex-1 min-h-[20mm] print:hidden">
               <div className="w-[160px] shrink-0" style={{ backgroundColor: themeColor }}></div>
               <div className="flex-1 bg-white"></div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ResumePreview.displayName = 'ResumePreview';
export default ResumePreview;