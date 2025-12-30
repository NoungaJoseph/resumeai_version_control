
import React, { forwardRef, useRef, useImperativeHandle, useLayoutEffect, useState, useEffect } from 'react';
import html2pdf from 'html2pdf.js';

import { ResumeData, AIResumeOutput, AICoverLetterOutput } from '../types';
import { MailIcon, PhoneIcon, MapPinIcon, GlobeIcon } from './Icons';

interface ResumePreviewProps {
  raw: ResumeData;
  aiContent: AIResumeOutput | null;
  aiCoverLetter?: AICoverLetterOutput | null;
}

// Hardcoded English Labels
const t = {
  profile: "Professional Profile",
  experience: "Professional Experience",
  education: "Education",
  skills: "Skills",
  competencies: "Competencies",
  expertise: "Expertise",
  languages: "Languages",
  projects: "Projects",
  internships: "Internships",
  volunteering: "Volunteering",
  awards: "Awards",
  honors: "Honors",
  certifications: "Certifications",
  publications: "Publications",
  credentials: "Credentials",
  keyProjects: "Key Projects",
  academicExp: "Academic & Professional Experience",
  research: "Research Projects"
};

const ResumePreview = forwardRef((props: ResumePreviewProps, ref: React.Ref<HTMLDivElement>) => {
  const { raw, aiContent, aiCoverLetter } = props;
  const themeColor = raw.themeColor || '#1e3a8a'; // Default to Navy if not set

  const containerRef = useRef<HTMLDivElement>(null);

  // Dynamic Font Loader
  useEffect(() => {
    if (raw.fontFamily) {
      const link = document.createElement('link');
      link.href = `https://fonts.googleapis.com/css2?family=${raw.fontFamily.replace(/\s+/g, '+')}:wght@300;400;500;700;900&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [raw.fontFamily]);

  // Style Mappings
  const FONT_SIZE_MAP = {
    small: 'text-[0.8rem] leading-relaxed',
    medium: 'text-[0.95rem] leading-relaxed',
    large: 'text-[1.1rem] leading-relaxed'
  };

  const MARGIN_MAP = {
    narrow: 'p-[10mm]',
    balanced: 'p-[20mm]',
    wide: 'p-[30mm]'
  };

  const SPACING_MAP = {
    compact: 'space-y-4',
    standard: 'space-y-6',
    relaxed: 'space-y-8'
  };

  const getCustomStyles = () => {
    return {
      fontFamily: raw.fontFamily || 'Inter, sans-serif',
      fontSize: 'inherit' // Controlled by classes
    };
  };

  /* 
   * PDF GENERATION via html2pdf.js
   * - Direct download (no print dialog)
   * - Respects CSS page breaks
   */
  const downloadAsPDF = async () => {
    if (!containerRef.current) return;

    // Use user's full name for filename, sanitized
    const safeName = (raw.fullName || 'resume')
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/\s+/g, '_')
      .toLowerCase();

    const element = containerRef.current;

    const opt = {
      margin: 0,
      filename: `${safeName}.pdf`,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
      pagebreak: { mode: ['css', 'legacy'] }
    };

    // Force visible overflow for capture
    const originalOverflow = element.style.overflow;
    const originalHeight = element.style.height;
    element.style.overflow = 'visible';
    element.style.height = 'auto';

    try {
      // Check if Web Share API is supported (typical for mobile)
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

      if (isMobile && navigator.share) {
        try {
          // Generate PDF as Blob
          const pdfBlob = await html2pdf().set(opt).from(element).output('blob');
          const file = new File([pdfBlob], `${safeName}.pdf`, { type: 'application/pdf' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Resume',
              text: 'Here is my resume.'
            });
            return; // Success, exit
          }
        } catch (shareErr) {
          console.warn("Share API failed, falling back to download", shareErr);
          // If share fails (e.g. user cancelled), we might want to fall back to download or just stop.
          // Usually if user cancels share, we don't auto-download. 
          // But if generation failed, it goes to outer catch.
          // If share API throws (not supported file type etc), we fall back.
        }
      }

      // Fallback: Direct download
      await html2pdf().set(opt).from(element).save();

    } catch (err) {
      console.error("PDF generation failed", err);
      try {
        // Fallback retry
        await html2pdf().set(opt).from(element).save();
      } catch (e) {
        alert("Failed to generate PDF. Please try again.");
      }
    } finally {
      // Restore styles
      element.style.overflow = originalOverflow;
      element.style.height = originalHeight;
    }
  };

  useImperativeHandle(ref, () => ({
    getElement: () => containerRef.current,
    downloadAsPDF
  }) as any);

  // Scaling Logic
  // Scaling Logic Removed - Allowing multi-page flow

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
          <h1 className="text-4xl font-bold uppercase tracking-wide mb-2 text-white">{raw.fullName || "Your Name"}</h1>
          <p className="text-xl font-light text-white/90">{raw.targetRole || "Professional Title"}</p>
        </div>
      </div>

      <div className="text-right text-base font-medium text-white/90 space-y-2 relative z-10 hidden sm:block">
        {raw.email && <div className="flex items-center justify-end gap-3"><span>{raw.email}</span><MailIcon className="w-5 h-5 opacity-80" /></div>}
        {raw.phone && <div className="flex items-center justify-end gap-3"><span>{raw.phone}</span><PhoneIcon className="w-5 h-5 opacity-80" /></div>}
        {raw.location && <div className="flex items-center justify-end gap-3"><span>{raw.location}</span><MapPinIcon className="w-5 h-5 opacity-80" /></div>}
        {raw.linkedin && <div className="flex items-center justify-end gap-3"><span>{raw.linkedin.replace(/^https?:\/\//, '')}</span><GlobeIcon className="w-5 h-5 opacity-80" /></div>}
        {raw.website && <div className="flex items-center justify-end gap-3"><span>{raw.website.replace(/^https?:\/\//, '')}</span><GlobeIcon className="w-5 h-5 opacity-80" /></div>}
      </div>
    </header>
  );

  // 2. MODERN/SIDEBAR HEADER (Simple, Color text)
  const renderModernHeader = () => (
    <div className="p-10 pb-6 border-b break-inside-avoid" style={{ borderColor: themeColor }}>
      <h1 className="text-5xl font-bold mb-2" style={{ color: themeColor }}>{raw.fullName || "Your Name"}</h1>
      <div className="text-base text-slate-600 flex flex-wrap gap-x-4 items-center">
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
      <h1 className="text-5xl font-serif font-bold uppercase tracking-wide mb-2" style={{ color: themeColor }}>
        {raw.fullName || "Your Name"}
      </h1>
      <div className="text-base text-slate-600 flex flex-wrap gap-x-4 gap-y-1 items-center">
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
          <h1 className="text-4xl font-bold uppercase tracking-tight mb-2 text-slate-900">
            {raw.fullName || "Your Name"}
          </h1>
          <p className="text-xl font-medium text-slate-500">{raw.targetRole || "Senior Professional"}</p>
        </div>
      </div>
      <div className="text-right text-base text-slate-600 space-y-1">
        {raw.email && <div>{raw.email}</div>}
        {raw.phone && <div>{raw.phone}</div>}
        {raw.location && <div>{raw.location}</div>}
        {raw.website && <div className="font-medium" style={{ color: themeColor }}>{raw.website.replace(/^https?:\/\//, '')}</div>}
      </div>
    </header>
  );

  // --- COVER LETTER FIX ---
  if (raw.mode === 'cover-letter') {
    const dateOptions: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', dateOptions);

    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] max-h-[594mm] bg-white text-slate-800 mx-auto box-border flex flex-col print:w-full print:min-h-0 print:h-auto print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']}`}
            style={getCustomStyles()}
          >

            {/* Header matching selected template */}
            {(raw.template === 'cv-executive' || raw.template === 'cv-corporate') && (
              <div className="bg-slate-800 text-white p-6 pb-5 break-inside-avoid">
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold uppercase tracking-wide mb-1">
                      {raw.fullName || "Your Name"}
                    </h1>
                    <p className="text-sm text-slate-200">{raw.targetRole || "Professional Title"}</p>
                  </div>
                  {raw.photo && (
                    <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-white/30 shrink-0 bg-white">
                      <img src={raw.photo} alt={raw.fullName} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-200">
                  {raw.email && <span>✉️ {raw.email}</span>}
                  {raw.phone && <span>📱 {raw.phone}</span>}
                  {raw.location && <span>📍 {raw.location}</span>}
                  {raw.linkedin && <span>🔗 {raw.linkedin.replace(/^https?:\/\//, '')}</span>}
                </div>
              </div>
            )}

            {(raw.template === 'classic' || raw.template === 'cv-executive') && (
              <div className="p-6 pb-0 border-b-2 border-slate-800">
                <div className="flex items-start gap-4">
                  {raw.photo && (
                    <div className="w-20 h-20 rounded-lg overflow-hidden border border-slate-300 shrink-0">
                      <img src={raw.photo} alt="Profile" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1">
                    <h1 className="text-2xl font-bold text-slate-900 mb-1">{raw.fullName || "Your Name"}</h1>
                    <div className="text-xs text-slate-600 flex flex-wrap gap-3">
                      {raw.location && <span>{raw.location}</span>}
                      {raw.email && <span>• {raw.email}</span>}
                      {raw.phone && <span>• {raw.phone}</span>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Letter Content - COMPACT FOR 1-2 PAGES MAX */}
            <div className="flex-1 p-8 text-slate-700 leading-normal space-y-4">

              {/* Date & Recipient */}
              <div className="mb-6 break-inside-avoid">
                <p className="text-sm text-slate-500 mb-4">{today}</p>
                <div className="text-base">
                  <p className="font-bold text-slate-900">{raw.recipientName || "Hiring Manager"}</p>
                  {raw.recipientRole && <p className="text-slate-700">{raw.recipientRole}</p>}
                  <p className="font-semibold text-slate-900 mt-1">{raw.companyName || "Company Name"}</p>
                  {raw.companyAddress && <p className="text-sm text-slate-600 whitespace-pre-line mt-0.5">{raw.companyAddress}</p>}
                </div>
              </div>

              {/* Letter Body - REDUCED SPACING */}
              <div className="space-y-3 text-sm leading-relaxed">
                {aiCoverLetter ? (
                  <>
                    {aiCoverLetter.subject && (
                      <p className="font-bold text-slate-900 text-base mb-3">{aiCoverLetter.subject}</p>
                    )}
                    <p>{aiCoverLetter.salutation}</p>
                    <p>{aiCoverLetter.opening}</p>
                    {aiCoverLetter.bodyParagraphs.slice(0, 2).map((para, idx) => (
                      <p key={idx}>{para}</p>
                    ))}
                    <p className="font-medium">{aiCoverLetter.closing}</p>
                    <div className="mt-8">
                      <p className="mb-1">{aiCoverLetter.signOff}</p>
                      <p className="font-bold text-slate-900 text-lg">{raw.fullName}</p>
                    </div>
                  </>
                ) : (
                  <div className="opacity-50 italic space-y-3">
                    <p>Dear Hiring Manager,</p>
                    <p>I am writing to express my strong interest in the {raw.targetRole || "[Job Title]"} position at {raw.companyName || "[Company Name]"}.</p>
                    <p>[Generate your cover letter to see professional content here...]</p>
                    <p className="mt-8">Sincerely,</p>
                    <p className="font-bold">{raw.fullName}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {(raw.template === 'cv-professional' || raw.template === 'cv-corporate') && (
              <div className="h-3 w-full bg-slate-800 print:h-2"></div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- MOTIVATION LETTER ---
  if (raw.mode === 'motivation-letter') {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-800 mx-auto box-border print:w-full print:min-h-0 print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']} ${MARGIN_MAP[raw.margins || 'balanced']}`}
            style={getCustomStyles()}
          >
            <h1 className="text-3xl font-bold mb-2 text-center text-slate-900 border-b-2 border-slate-900 pb-4">{raw.fullName}</h1>
            <div className="mb-8 flex justify-between text-sm text-slate-600">
              <div className="space-y-1">
                <p>{raw.email}</p>
                <p>{raw.phone}</p>
                <p>{raw.location}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900">{today}</p>
              </div>
            </div>

            <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200 break-inside-avoid">
              <p className="font-bold text-slate-900">To: {raw.organizationName || "[Organization Name]"}</p>
              <p className="text-slate-700">Re: Motivation Statement for {raw.positionApplied || "[Position/Opportunity]"}</p>
            </div>

            <div className="space-y-6 text-justify leading-relaxed text-slate-800">
              <p>Dear Selection Committee,</p>
              <p className="whitespace-pre-line">{raw.motivationText || "[Your motivation text will appear here...]"}</p>

              {raw.skills && (
                <div className="mt-4 break-inside-avoid">
                  <h3 className="font-bold border-b border-slate-300 mb-2 uppercase text-sm tracking-wide">Key Competencies</h3>
                  <p className="whitespace-pre-line">{raw.skills}</p>
                </div>
              )}
              {raw.summary && (
                <div className="mt-4 break-inside-avoid">
                  <h3 className="font-bold border-b border-slate-300 mb-2 uppercase text-sm tracking-wide">Relevant Background</h3>
                  <p className="whitespace-pre-line">{raw.summary}</p>
                </div>
              )}

              <div className="mt-12 break-inside-avoid">
                <p className="mb-4">Sincerely,</p>
                <p className="font-bold text-lg border-t border-slate-900 inline-block pt-2 min-w-[200px]">{raw.fullName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- INTERNSHIP APPLICATION ---
  if (raw.mode === 'internship-letter') {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-800 mx-auto box-border print:w-full print:min-h-0 print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']} ${MARGIN_MAP[raw.margins || 'balanced']}`}
            style={getCustomStyles()}
          >
            <header className="border-b-4 border-blue-900 pb-6 mb-8 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold uppercase text-blue-900 tracking-wider mb-1">{raw.fullName}</h1>
                <p className="text-lg font-medium text-slate-500">{raw.program} Student | {raw.educationLevel}</p>
              </div>
              <div className="text-right text-sm text-slate-600">
                <p>{raw.schoolName}</p>
                <p>{raw.email}</p>
                <p>{raw.phone}</p>
              </div>
            </header>

            <div className="mb-8">
              <p className="font-bold text-slate-900">{today}</p>
              <br />
              <p>Hiring Manager / Internship Coordinator</p>
              <p className="font-bold text-slate-900">{raw.companyName || "[Company Name]"}</p>
              {raw.supervisorName && <p>Attn: {raw.supervisorName}</p>}
            </div>

            <div className="mb-6 font-bold underline decoration-blue-900 decoration-2 underline-offset-4">
              SUBJECT: INTERNSHIP APPLICATION ({raw.internshipStartDate} - {raw.internshipEndDate})
            </div>

            <div className="space-y-4 text-justify leading-relaxed">
              <p>Dear Sir/Madam,</p>
              <p className="whitespace-pre-line">{raw.motivationText || "[Motivation...]"}</p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                {raw.skills && (
                  <div className="bg-slate-50 p-4 border-l-4 border-blue-600 break-inside-avoid">
                    <h3 className="font-bold text-blue-900 mb-2">Skills Offered</h3>
                    <p className="text-sm whitespace-pre-line">{raw.skills}</p>
                  </div>
                )}
                {raw.expectedOutcomes && (
                  <div className="bg-slate-50 p-4 border-l-4 border-slate-500 break-inside-avoid">
                    <h3 className="font-bold text-slate-900 mb-2">Learning Objectives</h3>
                    <p className="text-sm whitespace-pre-line">{raw.expectedOutcomes}</p>
                  </div>
                )}
              </div>

              <p>I am eager to contribute to {raw.companyName} and look forward to the possibility of discussing this opportunity.</p>

              <div className="mt-12 break-inside-avoid">
                <p>Respectfully,</p>
                <p className="font-bold text-lg mt-2">{raw.fullName}</p>
                <p className="text-sm text-slate-500">{raw.phone}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- VISA COVER LETTER ---
  if (raw.mode === 'visa-letter') {
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-900 mx-auto box-border print:w-full print:min-h-0 print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']} ${MARGIN_MAP[raw.margins || 'balanced']}`}
            style={getCustomStyles()}
          >

            {/* Formal Header */}
            <div className="text-center border-b border-black pb-4 mb-6">
              <h1 className="font-bold uppercase tracking-widest text-xl">Visa Application Cover Letter</h1>
            </div>

            <div className="flex justify-between items-start mb-8 text-sm">
              <div>
                <p className="font-bold">{raw.fullName}</p>
                <p>Passport No: {raw.passportNumber}</p>
                <p>{raw.nationality} Citizen</p>
                <p>{raw.location}</p>
                <p>{raw.phone}</p>
                <p>{raw.email}</p>
              </div>
              <div className="text-right">
                <p className="font-bold">Date: {today}</p>
                <div className="mt-4 text-left border border-black p-2 min-w-[200px]">
                  <p className="font-bold text-xs uppercase text-slate-500">To The Visa Officer</p>
                  <p className="font-bold">{raw.embassyDetails || "[Embassy Name & Address]"}</p>
                </div>
              </div>
            </div>

            <div className="mb-6 font-bold uppercase text-center bg-slate-100 py-1 border-y border-slate-300">
              Subject: Application for Visitor Visa to {raw.destinationCountry}
            </div>

            <div className="space-y-4 leading-relaxed text-justify">
              <p>Dear Honorable Consul,</p>
              <p>I, <strong>{raw.fullName}</strong> (DOB: {raw.dob}, Passport: {raw.passportNumber}), formally request a visa to visit {raw.destinationCountry} from <strong>{raw.travelStartDate}</strong> to <strong>{raw.travelEndDate}</strong>.</p>

              {/* Purpose */}
              <div className="break-inside-avoid">
                <h3 className="font-bold underline mb-1">Purpose of Travel</h3>
                <p className="whitespace-pre-line">{raw.travelPurpose}</p>
              </div>

              {/* Financials */}
              <div className="break-inside-avoid">
                <h3 className="font-bold underline mb-1">Financial Means & Sponsorship</h3>
                <p>
                  {raw.sponsorshipType === 'self'
                    ? "I am self-sponsoring this trip and have attached proof of sufficient funds to cover all travel, accommodation, and daily expenses."
                    : raw.sponsorDetails}
                </p>
              </div>

              {/* Accommodation */}
              <div className="break-inside-avoid">
                <h3 className="font-bold underline mb-1">Accommodation</h3>
                <p className="whitespace-pre-line">{raw.accommodationDetails}</p>
              </div>

              {/* Return Assurance */}
              <div className="break-inside-avoid">
                <h3 className="font-bold underline mb-1">Ties to Home Country</h3>
                <p className="whitespace-pre-line">{raw.returnAssurance}</p>
                <p className="mt-1">I strictly intend to return to my home country before my visa expires.</p>
              </div>

              {/* Documents List */}
              <div className="break-inside-avoid mt-4">
                <p className="font-bold mb-2">Please find enclosed the following supporting documents:</p>
                <ul className="list-disc list-inside space-y-1 text-sm pl-4">
                  <li>Valid Passport (Issue: {raw.passportIssueDate}, Expiry: {raw.passportExpiryDate})</li>
                  <li>Visa Application Form</li>
                  <li>Travel Itinerary & Flight Reservation</li>
                  <li>Proof of Accommodation</li>
                  <li>Proof of Financial Means</li>
                  {raw.supportingDocuments && raw.supportingDocuments.split(',').map((doc, i) => (
                    <li key={i}>{doc.trim()}</li>
                  ))}
                </ul>
              </div>

              <p className="mt-6">I trust that my application is in order and look forward to a positive response.</p>

              <div className="mt-10 break-inside-avoid">
                <p>Sincerely,</p>
                <div className="h-16"></div> {/* Signature space */}
                <p className="font-bold border-t border-black inline-block pt-1 min-w-[200px]">{raw.fullName}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- BUSINESS PLAN ---
  if (raw.mode === 'business-plan') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-800 mx-auto box-border print:w-full print:min-h-0 print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']}`}
            style={getCustomStyles()}
          >

            {/* Cover Page */}
            <div className="h-[297mm] flex flex-col justify-center items-center text-center p-10 bg-slate-900 text-white relative overflow-hidden page-break-after-always">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

              <h1 className="text-6xl font-black uppercase tracking-tight mb-4">{raw.businessName || "BUSINESS NAME"}</h1>
              <p className="text-2xl font-light text-slate-300 tracking-[0.2em] uppercase mb-16">Business Plan</p>

              <div className="border-t border-white/20 pt-8 w-full max-w-md">
                <p className="text-lg font-bold">{raw.ownerName}</p>
                <p className="text-slate-400">{raw.location}</p>
                <p className="text-slate-400 mt-2">{new Date().getFullYear()}</p>
              </div>
            </div>

            {/* Content Pages */}
            <div className="p-[20mm]">

              {/* Executive Summary */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold uppercase text-slate-900 border-b-4 border-blue-600 mb-6 pb-2 inline-block">Executive Summary</h2>
                <div className="space-y-4">
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 break-inside-avoid">
                    <h3 className="font-bold text-blue-900 mb-2">Problem</h3>
                    <p>{raw.problemStatement}</p>
                  </div>
                  <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 break-inside-avoid">
                    <h3 className="font-bold text-green-900 mb-2">Solution</h3>
                    <p>{raw.solutionOverview}</p>
                  </div>
                </div>
              </section>

              {/* Market Analysis */}
              <section className="mb-10 break-inside-avoid">
                <h2 className="text-2xl font-bold uppercase text-slate-900 border-b-4 border-slate-300 mb-6 pb-2 inline-block">Market Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-1">Target Audience</h4>
                    <p className="text-sm text-justify">{raw.targetCustomers}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-1">Competition</h4>
                    <p className="text-sm text-justify">{raw.competitors}</p>
                  </div>
                  <div className="md:col-span-2 bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-bold text-blue-900 uppercase text-xs tracking-wider mb-1">Unique Selling Proposition</h4>
                    <p className="font-medium">{raw.uniqueAdvantage}</p>
                  </div>
                </div>
              </section>

              {/* Strategy & Vision */}
              <section className="mb-10 break-inside-avoid">
                <h2 className="text-2xl font-bold uppercase text-slate-900 border-b-4 border-purple-600 mb-6 pb-2 inline-block">Strategy</h2>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold">Marketing Plan</h4>
                    <p className="text-sm">{raw.marketingStrategy}</p>
                  </div>
                  <div>
                    <h4 className="font-bold">Long-Term Vision</h4>
                    <p className="text-sm">{raw.longTermVision}</p>
                  </div>
                </div>
              </section>

              {/* Financials */}
              <section className="mb-10 break-inside-avoid">
                <h2 className="text-2xl font-bold uppercase text-slate-900 border-b-4 border-green-600 mb-6 pb-2 inline-block">Financial Overview</h2>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="p-4 bg-slate-900 text-white rounded-lg text-center">
                    <p className="text-xs text-slate-400 uppercase">Startup Cost</p>
                    <p className="text-xl font-bold">{raw.startupCosts}</p>
                  </div>
                  <div className="p-4 bg-green-700 text-white rounded-lg text-center">
                    <p className="text-xs text-green-200 uppercase">Expected Revenue</p>
                    <p className="text-xl font-bold">{raw.expectedRevenue}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 text-sm border-t pt-4">
                  <div>
                    <span className="font-bold block text-slate-500">Revenue Model</span>
                    {raw.revenueModel}
                  </div>
                  <div>
                    <span className="font-bold block text-slate-500">Monthly OpEx</span>
                    {raw.operatingCosts}
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- LEGAL AGREEMENT ---
  if (raw.mode === 'legal-agreement') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-black mx-auto box-border print:w-full print:min-h-0 print:overflow-visible leading-loose text-justify ${FONT_SIZE_MAP[raw.fontSize || 'medium']} ${MARGIN_MAP[raw.margins || 'balanced']}`}
            style={getCustomStyles()}
          >

            <h1 className="text-center font-bold uppercase text-2xl mb-8 border-b-2 border-black pb-4">
              {raw.template === 'legal-lease' ? 'LEASE AGREEMENT' :
                raw.template === 'legal-partnership' ? 'PARTNERSHIP AGREEMENT' :
                  raw.template === 'legal-sale' ? 'SALE AGREEMENT' : 'LEGAL AGREEMENT'}
            </h1>

            <p className="mb-6">
              This Agreement is made on this <strong>{raw.agreementDate || "[Date]"}</strong>, by and between:
            </p>

            <div className="pl-6 mb-6">
              <p className="mb-4">
                <strong>1. FIRST PARTY:</strong> {raw.legalPartyA || "[Party A Name]"}, hereinafter referred to as the
                "{raw.template === 'legal-lease' ? 'Landlord' : raw.template === 'legal-sale' ? 'Seller' : 'First Party'}".
              </p>
              <p>
                <strong>2. SECOND PARTY:</strong> {raw.legalPartyB || "[Party B Name]"}, hereinafter referred to as the
                "{raw.template === 'legal-lease' ? 'Tenant' : raw.template === 'legal-sale' ? 'Buyer' : 'Second Party'}".
              </p>
            </div>

            <div className="space-y-6">
              <h3 className="font-bold text-center underline">WHEREAS:</h3>

              <div className="pl-6">
                <p>The Parties wish to enter into an agreement for the {raw.template === 'legal-lease' ? 'lease of property' : 'transaction described below'};</p>
              </div>

              <h3 className="font-bold text-center underline">IT IS HEREBY AGREED AS FOLLOWS:</h3>

              <div className="space-y-4">
                <div className="break-inside-avoid">
                  <span className="font-bold mr-2">1. CONSIDERATION:</span>
                  The financial value associated with this agreement is <strong>{raw.financialValue || "[Amount]"}</strong>, to be paid as per the agreed schedule.
                </div>

                <div className="break-inside-avoid">
                  <span className="font-bold mr-2">2. TERMS AND CONDITIONS:</span>
                  <p className="whitespace-pre-line pl-6 mt-2">{raw.agreementTerms || "[Enter specific terms here...]"}</p>
                </div>

                <div className="break-inside-avoid">
                  <span className="font-bold mr-2">3. GOVERNING LAW:</span>
                  This Agreement shall be governed by and construed in accordance with the laws of the applicable jurisdiction.
                </div>
              </div>

              <div className="mt-16 flex justify-between items-end break-inside-avoid">
                <div className="text-center w-1/3">
                  <div className="border-b border-black mb-2 h-12"></div>
                  <p className="uppercase font-bold text-xs">{raw.legalPartyA}</p>
                  <p className="text-xs text-slate-500">(Signature)</p>
                </div>
                <div className="text-center w-1/3">
                  <div className="border-b border-black mb-2 h-12"></div>
                  <p className="uppercase font-bold text-xs">{raw.legalPartyB}</p>
                  <p className="text-xs text-slate-500">(Signature)</p>
                </div>
              </div>

              <div className="mt-8 text-center text-xs text-slate-400 italic">
                * This document is a generated template and does not constitute professional legal advice.
              </div>
            </div>

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
    experience: aiContent?.experience || (Array.isArray(raw.experience) ? raw.experience.map(e => ({
      company: e.company,
      role: e.role,
      dates: e.dates,
      bullets: [e.description]
    })) : []),
    internships: aiContent?.internships || (Array.isArray(raw.internships) ? raw.internships.map(e => ({
      company: e.company,
      role: e.role,
      dates: e.dates,
      bullets: [e.description]
    })) : []),
    volunteering: aiContent?.volunteering || (Array.isArray(raw.volunteering) ? raw.volunteering.map(e => ({
      company: e.company,
      role: e.role,
      dates: e.dates,
      bullets: [e.description]
    })) : []),
    projects: aiContent?.projects || (Array.isArray(raw.projects) ? raw.projects.map(p => ({
      name: p.name,
      link: p.link,
      dates: p.dates,
      bullets: [p.description]
    })) : []),
    achievements: aiContent?.achievements || (Array.isArray(raw.achievements) ? raw.achievements : []),
    publications: aiContent?.publications || (raw.publications ? (Array.isArray(raw.publications) ? raw.publications : raw.publications.split('\n').map(a => a.trim()).filter(Boolean)) : []),
    certifications: aiContent?.certifications || (Array.isArray(raw.certifications) ? raw.certifications : [])
  };

  const SectionTitle = ({ title, className = '' }: { title: string; className?: string }) => (
    <h2
      className={`text-sm font-bold uppercase tracking-widest mb-3 border-b pb-1 ${className}`}
      style={{ color: raw.template === 'modern' ? themeColor : '#64748b', borderColor: raw.template === 'modern' ? themeColor : '#e2e8f0' }}
    >
      {title}
    </h2>
  );

  // --- TEMPLATE: MODERN (Two-Column Balanced, Color Accents) ---
  if (raw.template === 'modern' || (raw.mode === 'resume' && !raw.template)) {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-800 mx-auto box-border flex flex-col print:w-full print:min-h-0 print:h-auto print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']}`}
            style={getCustomStyles()}
          >
            {renderModernHeader()}
            <div className={`p-10 grid grid-cols-12 gap-8 flex-1 ${SPACING_MAP[raw.sectionSpacing || 'standard']}`}>
              {/* Main Column */}
              <div className="col-span-8 space-y-8">
                {dataToRender.summary && (
                  <section>
                    <SectionTitle title={t.profile} />
                    <p className="text-sm leading-relaxed text-slate-600 text-justify">{dataToRender.summary}</p>
                  </section>
                )}
                {dataToRender.experience.length > 0 && (
                  <section>
                    <SectionTitle title={t.experience} />
                    <div className="space-y-6">
                      {dataToRender.experience.map((exp, idx) => (
                        <div key={idx} className="page-break-avoid">
                          <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-slate-900 border-l-4 pl-3" style={{ borderColor: themeColor }}>{exp.role}</h3>
                            <span className="text-xs font-bold text-slate-400">{exp.dates}</span>
                          </div>
                          <p className="text-sm font-semibold text-slate-600 mb-2 pl-4">{exp.company}</p>
                          <ul className="list-disc list-outside ml-8 space-y-1">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm text-slate-600 pl-1">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {dataToRender.projects.length > 0 && (
                  <section>
                    <SectionTitle title={t.projects} />
                    <div className="space-y-4">
                      {dataToRender.projects.map((proj, idx) => (
                        <div key={idx} className="page-break-avoid">
                          <h3 className="font-bold text-slate-800 flex justify-between">
                            <span>{proj.name}</span>
                            <span className="text-xs font-normal text-slate-400">{proj.dates}</span>
                          </h3>
                          <ul className="list-disc list-outside ml-5 mt-1 space-y-1">
                            {proj.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm text-slate-600">{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
              {/* Sidebar Column */}
              <div className="col-span-4 space-y-8 h-full border-l pl-8 print:pl-8">
                {dataToRender.skills.length > 0 && (
                  <section>
                    <SectionTitle title={t.skills} />
                    <div className="flex flex-wrap gap-2">
                      {dataToRender.skills.map((skill, idx) => (
                        <span key={idx} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-slate-100 text-slate-700" style={{ backgroundColor: `${themeColor}10`, color: themeColor }}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </section>
                )}
                {raw.education.length > 0 && (
                  <section>
                    <SectionTitle title={t.education} />
                    <div className="space-y-4">
                      {raw.education.map((edu, idx) => (
                        <div key={idx} className="page-break-avoid">
                          <p className="font-bold text-slate-800 text-sm leading-tight">{edu.degree}</p>
                          <p className="text-xs text-slate-500 mt-1">{edu.school}</p>
                          <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold">{edu.dates}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {dataToRender.languages.length > 0 && (
                  <section>
                    <SectionTitle title={t.languages} />
                    <div className="space-y-1">
                      {dataToRender.languages.map((lang, idx) => (
                        <p key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" style={{ backgroundColor: themeColor }}></span>
                          {lang}
                        </p>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: SIDEBAR (Rich Side Column, Photo Support) ---
  if (raw.template === 'sidebar') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-800 mx-auto box-border flex print:w-full print:min-h-0 print:h-auto print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']}`}
            style={getCustomStyles()}
          >
            {/* Dark Sidebar */}
            <aside className="w-[80mm] text-white p-10 print:p-8 shrink-0 flex flex-col" style={{ backgroundColor: themeColor }}>
              {raw.photo && (
                <div className="w-32 h-32 rounded-2xl overflow-hidden mb-8 border-4 border-white/20 shadow-2xl mx-auto rotate-3">
                  <img src={raw.photo} alt="Profile" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex-1 space-y-10">
                <section>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-white/50">{t.skills}</h2>
                  <div className="flex flex-wrap gap-2">
                    {dataToRender.skills.map((skill, idx) => (
                      <span key={idx} className="text-[10px] font-bold border border-white/30 px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </section>
                <section>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-white/50">{t.education}</h2>
                  <div className="space-y-6">
                    {raw.education.map((edu, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <p className="font-bold text-sm leading-tight">{edu.degree}</p>
                        <p className="text-xs text-white/70 mt-1">{edu.school}</p>
                        <p className="text-[10px] text-white/40 mt-1 uppercase font-black tracking-widest">{edu.dates}</p>
                      </div>
                    ))}
                  </div>
                </section>
                <section>
                  <h2 className="text-xs font-black uppercase tracking-[0.2em] mb-4 text-white/50">Contact</h2>
                  <div className="space-y-3 text-xs text-white/80">
                    {raw.email && <div className="flex items-center gap-3"><span>{raw.email}</span></div>}
                    {raw.phone && <div className="flex items-center gap-3"><span>{raw.phone}</span></div>}
                    {raw.location && <div className="flex items-center gap-3"><span>{raw.location}</span></div>}
                  </div>
                </section>
              </div>
            </aside>
            {/* Light Main Content */}
            <main className="flex-1 p-12 print:p-8 space-y-10">
              <header>
                <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2">{raw.fullName}</h1>
                <p className="text-xl font-medium tracking-wide" style={{ color: themeColor }}>{raw.targetRole}</p>
              </header>
              {dataToRender.summary && (
                <section>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-4 text-slate-400">{t.profile}</h2>
                  <p className="text-sm leading-relaxed text-slate-600 text-justify border-l-2 pl-6" style={{ borderColor: themeColor }}>{dataToRender.summary}</p>
                </section>
              )}
              {dataToRender.experience.length > 0 && (
                <section>
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] mb-6 text-slate-400">{t.experience}</h2>
                  <div className="space-y-8">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between items-baseline mb-2">
                          <h3 className="font-bold text-slate-900 text-lg">{exp.role}</h3>
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{exp.dates}</span>
                        </div>
                        <p className="text-sm font-bold opacity-70 mb-3 uppercase tracking-wider">{exp.company}</p>
                        <ul className="list-disc list-outside ml-5 space-y-1.5">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-sm text-slate-600 leading-relaxed text-justify">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </main>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: CLASSIC (Centered, Serif, Timeless) ---
  if (raw.template === 'classic') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-900 mx-auto box-border flex flex-col font-serif print:w-full print:min-h-0 print:h-auto print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']} ${MARGIN_MAP[raw.margins || 'balanced']}`}
            style={getCustomStyles()}
          >
            {renderClassicHeader()}
            <div className={`flex-1 ${SPACING_MAP[raw.sectionSpacing || 'standard']}`}>
              {dataToRender.summary && (
                <section>
                  <h2 className="text-sm font-bold uppercase border-b-2 border-slate-900 mb-4 pb-1" style={{ color: themeColor, borderColor: themeColor }}>Professional Profile</h2>
                  <p className="text-sm leading-relaxed text-justify">{dataToRender.summary}</p>
                </section>
              )}
              {dataToRender.experience.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold uppercase border-b-2 border-slate-900 mb-4 pb-1" style={{ color: themeColor, borderColor: themeColor }}>Employment History</h2>
                  <div className="space-y-6">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between font-bold text-slate-900 text-base mb-1">
                          <span>{exp.role}</span>
                          <span className="font-normal text-sm italic">{exp.dates}</span>
                        </div>
                        <p className="text-sm font-bold text-slate-600 mb-2 italic">{exp.company}</p>
                        <ul className="list-disc list-outside ml-5 space-y-1">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-sm leading-relaxed text-justify">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              <div className="grid grid-cols-2 gap-10">
                {raw.education.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold uppercase border-b-2 border-slate-900 mb-4 pb-1" style={{ color: themeColor, borderColor: themeColor }}>Education</h2>
                    <div className="space-y-4">
                      {raw.education.map((edu, idx) => (
                        <div key={idx} className="page-break-avoid">
                          <p className="font-bold text-sm">{edu.degree}</p>
                          <p className="text-sm text-slate-600">{edu.school}</p>
                          <p className="text-[10px] text-slate-400 font-bold">{edu.dates}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                {dataToRender.skills.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold uppercase border-b-2 border-slate-900 mb-4 pb-1" style={{ color: themeColor, borderColor: themeColor }}>Relevant Skills</h2>
                    <p className="text-sm leading-relaxed">{dataToRender.skills.join(' • ')}</p>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: RESUME-ATS (Minimalist, Machine Readable) ---
  if (raw.template === 'resume-ats') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-black mx-auto box-border p-[15mm] flex flex-col font-sans print:w-full print:min-h-0 print:h-auto print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']}`}
            style={getCustomStyles()}
          >
            <header className="text-center mb-6">
              <h1 className="text-2xl font-bold uppercase mb-1">{raw.fullName}</h1>
              <div className="text-xs space-x-2">
                <span>{raw.location}</span> | <span>{raw.phone}</span> | <span>{raw.email}</span>
                {raw.linkedin && <span> | {raw.linkedin.replace(/^https?:\/\//, '')}</span>}
              </div>
            </header>
            <div className="space-y-5">
              {dataToRender.summary && (
                <section>
                  <h2 className="text-sm font-bold border-b border-black mb-2 uppercase">Professional Summary</h2>
                  <p className="text-xs leading-normal text-justify">{dataToRender.summary}</p>
                </section>
              )}
              {dataToRender.experience.length > 0 && (
                <section>
                  <h2 className="text-sm font-bold border-b border-black mb-2 uppercase">Experience</h2>
                  <div className="space-y-4">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between font-bold text-xs">
                          <span>{exp.company}</span>
                          <span>{exp.dates}</span>
                        </div>
                        <p className="text-xs font-bold italic mb-1">{exp.role}</p>
                        <ul className="list-disc list-outside ml-4 space-y-0.5">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-xs">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              <div className="grid grid-cols-2 gap-4">
                {raw.education.length > 0 && (
                  <section>
                    <h2 className="text-sm font-bold border-b border-black mb-2 uppercase">Education</h2>
                    {raw.education.map((edu, idx) => (
                      <div key={idx} className="mb-2 page-break-avoid">
                        <p className="font-bold text-xs">{edu.school}</p>
                        <p className="text-xs">{edu.degree}</p>
                        <p className="text-[10px] italic">{edu.dates}</p>
                      </div>
                    ))}
                  </section>
                )}
                <section>
                  <h2 className="text-sm font-bold border-b border-black mb-2 uppercase">Skills</h2>
                  <p className="text-xs leading-normal">{dataToRender.skills.join(', ')}</p>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: MINIMALIST (Clean, Focus on Typography) ---
  if (raw.template === 'minimalist') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-800 mx-auto box-border flex flex-col print:w-full print:min-h-0 print:h-auto print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']} p-[20mm]`}
            style={getCustomStyles()}
          >
            <header className="mb-12">
              <h1 className="text-4xl font-light tracking-[0.1em] text-slate-900 border-l-8 pl-6 mb-4" style={{ borderColor: themeColor }}>{raw.fullName}</h1>
              <div className="flex gap-6 text-xs font-medium text-slate-400 uppercase tracking-widest pl-8">
                {raw.location && <span>{raw.location}</span>}
                {raw.email && <span>{raw.email}</span>}
                {raw.phone && <span>{raw.phone}</span>}
              </div>
            </header>
            <div className="pl-8 space-y-12 flex-1">
              {dataToRender.experience.length > 0 && (
                <section>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6">Experience</h2>
                  <div className="space-y-10">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between items-baseline mb-2">
                          <h3 className="text-lg font-bold text-slate-800">{exp.role}</h3>
                          <span className="text-xs font-medium text-slate-400">{exp.dates}</span>
                        </div>
                        <p className="text-sm font-bold tracking-wide text-slate-500 mb-4">{exp.company}</p>
                        <div className="space-y-2">
                          {exp.bullets.map((bullet, bIdx) => (
                            <p key={bIdx} className="text-sm text-slate-600 leading-relaxed text-justify opacity-80">{bullet}</p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              <div className="grid grid-cols-2 gap-x-16">
                {raw.education.length > 0 && (
                  <section>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6">Education</h2>
                    {raw.education.map((edu, idx) => (
                      <div key={idx} className="mb-6 page-break-avoid">
                        <p className="font-bold text-slate-800 text-sm mb-1">{edu.degree}</p>
                        <p className="text-xs text-slate-500">{edu.school}</p>
                      </div>
                    ))}
                  </section>
                )}
                <section>
                  <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 mb-6">Expertise</h2>
                  <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {dataToRender.skills.map((skill, idx) => (
                      <span key={idx} className="text-xs font-bold text-slate-700">{skill}</span>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: RESUME-EXECUTIVE ---
  if (raw.template === 'resume-executive') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-900 mx-auto box-border print:w-full print:min-h-0 print:h-auto print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']} ${MARGIN_MAP[raw.margins || 'balanced']}`}
            style={getCustomStyles()}
          >
            {renderExecutiveHeader()}
            <div className={`space-y-10 flex-1 ${SPACING_MAP[raw.sectionSpacing || 'standard']}`}>
              {dataToRender.summary && (
                <section className="bg-slate-50 p-8 border-l-8" style={{ borderColor: themeColor }}>
                  <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Executive Profile</h2>
                  <p className="text-sm leading-relaxed text-slate-700 text-justify">{dataToRender.summary}</p>
                </section>
              )}
              {dataToRender.experience.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold border-b-2 border-slate-200 mb-6 pb-2" style={{ color: themeColor }}>Professional Experience</h2>
                  <div className="space-y-10">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between items-baseline mb-2">
                          <h3 className="font-bold text-slate-900 text-lg uppercase tracking-tight">{exp.role}</h3>
                          <span className="text-xs font-bold text-slate-500 tracking-wider bg-slate-100 px-3 py-1 rounded-full">{exp.dates}</span>
                        </div>
                        <p className="text-base font-bold text-slate-600 mb-4">{exp.company}</p>
                        <ul className="list-disc list-outside ml-6 space-y-2">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-sm text-slate-700 leading-relaxed text-justify pl-1">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}
              <div className="grid grid-cols-2 gap-12">
                {raw.education.length > 0 && (
                  <section>
                    <h2 className="text-lg font-bold border-b border-slate-200 mb-4 pb-2" style={{ color: themeColor }}>Education</h2>
                    <div className="space-y-6">
                      {raw.education.map((edu, idx) => (
                        <div key={idx} className="page-break-avoid">
                          <p className="font-bold text-slate-800 leading-tight">{edu.degree}</p>
                          <p className="text-sm text-slate-500 mt-1">{edu.school}</p>
                          <p className="text-xs text-slate-400 mt-1">{edu.dates}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
                <section>
                  <h2 className="text-lg font-bold border-b border-slate-200 mb-4 pb-2" style={{ color: themeColor }}>Core Competencies</h2>
                  <div className="grid grid-cols-1 gap-2">
                    {dataToRender.skills.map((skill, idx) => (
                      <div key={idx} className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }}></span>
                        {skill}
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: RESUME-CREATIVE (Bold, Vibrant, Artistic) ---
  if (raw.template === 'resume-creative') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full overflow-hidden">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-800 mx-auto box-border flex flex-col print:w-full print:min-h-0 print:h-auto print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']}`}
            style={getCustomStyles()}
          >
            <header className="h-64 relative flex items-center p-12 overflow-hidden bg-slate-900 border-b-8" style={{ borderColor: themeColor }}>
              <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none" style={{ background: `linear-gradient(135deg, ${themeColor}, #000)` }}></div>
              <div className="relative z-10">
                <h1 className="text-6xl font-black text-white uppercase tracking-tighter mb-2">{raw.fullName}</h1>
                <p className="text-2xl font-bold uppercase tracking-widest text-white/70">{raw.targetRole}</p>
              </div>
              {raw.photo && (
                <div className="absolute right-12 top-12 w-40 h-40 rounded-full border-8 border-white shadow-2xl overflow-hidden z-20">
                  <img src={raw.photo} alt="Profile" className="w-full h-full object-cover" />
                </div>
              )}
            </header>
            <div className="p-12 grid grid-cols-12 gap-12 flex-1">
              <div className="col-span-4 space-y-10">
                <section>
                  <h2 className="text-xs font-black uppercase tracking-widest mb-4 inline-block px-3 py-1 bg-slate-900 text-white">Contact</h2>
                  <div className="space-y-4 text-sm font-medium">
                    {raw.email && <p className="flex items-center gap-3"><span>{raw.email}</span></p>}
                    {raw.phone && <p className="flex items-center gap-3"><span>{raw.phone}</span></p>}
                    {raw.location && <p className="flex items-center gap-3"><span>{raw.location}</span></p>}
                  </div>
                </section>
                <section>
                  <h2 className="text-xs font-black uppercase tracking-widest mb-4 inline-block px-3 py-1 bg-slate-900 text-white">{t.skills}</h2>
                  <div className="flex flex-wrap gap-2">
                    {dataToRender.skills.map((skill, idx) => (
                      <span key={idx} className="text-[10px] font-bold border-2 px-2 py-1" style={{ borderColor: themeColor, color: themeColor }}>{skill}</span>
                    ))}
                  </div>
                </section>
              </div>
              <div className="col-span-8 space-y-10 border-l-2 pl-12" style={{ borderColor: `${themeColor}30` }}>
                {dataToRender.summary && (
                  <section>
                    <h2 className="text-2xl font-black uppercase mb-4 italic" style={{ color: themeColor }}>About Me</h2>
                    <p className="text-base leading-relaxed text-slate-600">{dataToRender.summary}</p>
                  </section>
                )}
                {dataToRender.experience.length > 0 && (
                  <section>
                    <h2 className="text-2xl font-black uppercase mb-6 italic" style={{ color: themeColor }}>Experience</h2>
                    <div className="space-y-8">
                      {dataToRender.experience.map((exp, idx) => (
                        <div key={idx} className="page-break-avoid">
                          <h3 className="text-xl font-bold text-slate-900">{exp.role}</h3>
                          <div className="flex justify-between items-center mb-3">
                            <span className="text-sm font-black uppercase tracking-widest opacity-60">{exp.company}</span>
                            <span className="text-xs font-bold px-2 py-1 rounded" style={{ backgroundColor: `${themeColor}15`, color: themeColor }}>{exp.dates}</span>
                          </div>
                          <ul className="space-y-2">
                            {exp.bullets.map((bullet, bIdx) => (
                              <li key={bIdx} className="text-sm text-slate-600 pl-4 border-l-2" style={{ borderColor: themeColor }}>{bullet}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </section>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: RESUME-TECHNICAL (Code-Inspired, Structured) ---
  if (raw.template === 'resume-technical') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-[#f8fafc] text-slate-900 mx-auto box-border flex flex-col font-mono print:w-full print:min-h-0 print:h-auto print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']}`}
            style={getCustomStyles()}
          >
            <header className="bg-slate-900 text-white p-10 flex justify-between items-center border-b-4" style={{ borderColor: themeColor }}>
              <div>
                <h1 className="text-3xl font-bold mb-1">&gt; {raw.fullName}</h1>
                <p className="text-lg opacity-70">//{raw.targetRole}</p>
              </div>
              <div className="text-right text-[10px] opacity-60 leading-tight">
                {raw.email} <br /> {raw.phone} <br /> {raw.location}
              </div>
            </header>
            <div className="p-10 space-y-10 flex-1">
              <section className="page-break-avoid">
                <h2 className="text-sm font-bold uppercase mb-4 text-slate-400 border-b border-slate-200 pb-1">01. Skills_Matrix</h2>
                <div className="grid grid-cols-2 gap-4">
                  {dataToRender.skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-3">
                      <div className="w-full h-1 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-slate-800" style={{ width: `${Math.random() * 40 + 60}%`, backgroundColor: themeColor }}></div>
                      </div>
                      <span className="text-[10px] font-bold w-32 shrink-0">{skill}</span>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-sm font-bold uppercase mb-4 text-slate-400 border-b border-slate-200 pb-1">02. Dev_History</h2>
                <div className="space-y-8">
                  {dataToRender.experience.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid border-l-2 pl-6 relative">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-slate-900" style={{ backgroundColor: themeColor }}></div>
                      <h3 className="text-sm font-black uppercase">{exp.role} @ {exp.company}</h3>
                      <p className="text-[10px] font-bold text-slate-400 mb-2">{exp.dates}</p>
                      <ul className="space-y-1">
                        {exp.bullets.map((bullet, bIdx) => (
                          <li key={bIdx} className="text-xs text-slate-600 leading-normal">_ {bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: RESUME-ENTRY (Friendly, Accessible, Education-First) ---
  if (raw.template === 'resume-entry') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-800 mx-auto box-border flex flex-col print:w-full print:min-h-0 print:h-auto print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']}`}
            style={getCustomStyles()}
          >
            <header className="p-12 pb-8 bg-slate-50 border-b text-center">
              <h1 className="text-4xl font-black text-slate-900 mb-2">{raw.fullName}</h1>
              <p className="text-lg font-bold uppercase tracking-widest mb-6" style={{ color: themeColor }}>{raw.targetRole}</p>
              <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-slate-500">
                <span>{raw.email}</span>
                <span>{raw.phone}</span>
                <span>{raw.location}</span>
              </div>
            </header>
            <div className="p-12 space-y-10 flex-1">
              <section>
                <h2 className="text-xl font-black border-b-4 pb-2 mb-6" style={{ borderColor: themeColor }}>Education</h2>
                <div className="space-y-6">
                  {raw.education.map((edu, idx) => (
                    <div key={idx} className="page-break-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <h3 className="text-lg font-bold text-slate-800">{edu.school}</h3>
                        <span className="text-xs font-black bg-slate-100 px-2 py-1 rounded">{edu.dates}</span>
                      </div>
                      <p className="font-bold text-slate-500">{edu.degree}</p>
                    </div>
                  ))}
                </div>
              </section>
              <section>
                <h2 className="text-xl font-black border-b-4 pb-2 mb-6" style={{ borderColor: themeColor }}>Skills & Interests</h2>
                <div className="flex flex-wrap gap-3">
                  {dataToRender.skills.map((skill, idx) => (
                    <span key={idx} className="px-4 py-2 bg-slate-100 rounded-full text-sm font-bold text-slate-700">{skill}</span>
                  ))}
                </div>
              </section>
              {dataToRender.experience.length > 0 && (
                <section>
                  <h2 className="text-xl font-black border-b-4 pb-2 mb-6" style={{ borderColor: themeColor }}>Experience</h2>
                  <div className="space-y-8">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <h3 className="font-bold text-slate-800 uppercase tracking-tight">{exp.role}</h3>
                        <p className="text-sm font-bold text-slate-400 mb-2">{exp.company} | {exp.dates}</p>
                        <p className="text-sm text-slate-600 leading-relaxed">{exp.bullets[0]}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (raw.template === 'cv-corporate') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-800 mx-auto box-border flex flex-col print:w-full print:min-h-0 print:h-auto print:overflow-visible print:print-color-adjust-exact ${FONT_SIZE_MAP[raw.fontSize || 'medium']}`}
            style={getCustomStyles()}
          >

            {/* Header Area */}
            {renderCorporateHeader()}

            <div className={`flex flex-1 min-h-0 print:block ${SPACING_MAP[raw.sectionSpacing || 'standard']}`}>
              {/* Left Column (Main) */}
              <div className={`flex-[2.2] ${MARGIN_MAP[raw.margins || 'balanced']} pr-8 print:p-8 print:w-full`}>
                {dataToRender.summary && (
                  <section className="mb-10 break-inside-avoid">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-4 flex items-center gap-3" style={{ color: themeColor }}>
                      <span className="w-8 h-0.5 bg-slate-300"></span>
                      {t.profile}
                    </h2>
                    <p className="text-sm leading-7 text-slate-700 text-justify">{dataToRender.summary}</p>
                  </section>
                )}

                {dataToRender.experience.length > 0 && (
                  <section className="mb-10">
                    <h2 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-3" style={{ color: themeColor }}>
                      <span className="w-8 h-0.5 bg-slate-300"></span>
                      {t.experience}
                    </h2>
                    <div className="space-y-8">
                      {dataToRender.experience.map((exp, idx) => (
                        <div key={idx} className="page-break-avoid">
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
                      {t.internships}
                    </h2>
                    <div className="space-y-8">
                      {dataToRender.internships.map((exp, idx) => (
                        <div key={idx} className="page-break-avoid">
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
                      {t.keyProjects}
                    </h2>
                    <div className="space-y-6">
                      {dataToRender.projects.map((proj, idx) => (
                        <div key={idx} className="page-break-avoid">
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
                      {t.volunteering}
                    </h2>
                    <div className="space-y-6">
                      {dataToRender.volunteering.map((vol, idx) => (
                        <div key={idx} className="page-break-avoid">
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
                  <section className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">{t.competencies}</h2>
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
                  <section className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">{t.languages}</h2>
                    <ul className="space-y-2">
                      {dataToRender.languages.map((langItem, idx) => (
                        <li key={idx} className="text-sm text-slate-600 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 print:bg-slate-600"></span>
                          {langItem}
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {raw.education.length > 0 && (
                  <section className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">{t.education}</h2>
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
                  <section className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">{t.certifications}</h2>
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
                  <section className="mb-8">
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">{t.publications}</h2>
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
                  <section>
                    <h2 className="text-xs font-bold uppercase tracking-widest mb-4 text-slate-900 border-b border-slate-200 pb-2">{t.awards}</h2>
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
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-900 mx-auto box-border print:w-full print:min-h-0 print:h-auto print:overflow-visible print:print-color-adjust-exact ${FONT_SIZE_MAP[raw.fontSize || 'medium']} ${MARGIN_MAP[raw.margins || 'balanced']}`}
            style={getCustomStyles()}
          >

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
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.profile}</h2>
                <p className="text-sm leading-relaxed text-slate-800 text-justify">{dataToRender.summary}</p>
              </section>
            )}

            {/* Education - Top Priority for Academic */}
            {raw.education.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.education}</h2>
                <div className="space-y-4">
                  {raw.education.map((edu, idx) => (
                    <div key={idx} className="page-break-avoid">
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
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.academicExp}</h2>
                <div className="space-y-6">
                  {dataToRender.experience.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
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
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.internships}</h2>
                <div className="space-y-6">
                  {dataToRender.internships.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
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
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.publications}</h2>
                <ul className="list-decimal list-outside ml-5 space-y-3">
                  {dataToRender.publications.map((pub, idx) => (
                    <li key={idx} className="text-sm leading-relaxed text-slate-800 pl-1 text-justify break-inside-avoid">{pub}</li>
                  ))}
                </ul>
              </section>
            )}

            {/* Research / Projects */}
            {dataToRender.projects.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.research}</h2>
                <div className="space-y-5">
                  {dataToRender.projects.map((proj, idx) => (
                    <div key={idx} className="page-break-avoid">
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
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.volunteering}</h2>
                <div className="space-y-6">
                  {dataToRender.volunteering.map((exp, idx) => (
                    <div key={idx} className="page-break-avoid">
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
            {raw.certifications && raw.certifications.length > 0 && (
              <section className="mb-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.certifications}</h2>
                <div className="space-y-3 px-1">
                  {raw.certifications.map((cert, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline">
                        <span className="text-sm font-bold text-slate-800">{cert.name}</span>
                        {cert.date && <span className="text-xs text-slate-600 font-medium">{cert.date}</span>}
                      </div>
                      {cert.issuer && <p className="text-xs italic text-slate-700">{cert.issuer}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Languages & Skills */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {dataToRender.languages && dataToRender.languages.length > 0 && (
                <section className="page-break-avoid">
                  <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.languages}</h2>
                  <ul className="list-none space-y-1">
                    {dataToRender.languages.map((langItem, idx) => (
                      <li key={idx} className="text-sm leading-relaxed text-slate-800">{langItem}</li>
                    ))}
                  </ul>
                </section>
              )}

              {dataToRender.skills.length > 0 && (
                <section className="page-break-avoid">
                  <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.skills}</h2>
                  <p className="text-sm leading-relaxed text-slate-800">
                    {dataToRender.skills.join(' • ')}
                  </p>
                </section>
              )}
            </div>

            {/* Achievements */}
            {raw.achievements && raw.achievements.length > 0 && (
              <section className="mt-8">
                <h2 className="text-sm font-bold uppercase border-b border-slate-300 mb-4 pb-1 tracking-widest">{t.awards}</h2>
                <div className="space-y-4 px-1">
                  {raw.achievements.map((ach, idx) => (
                    <div key={idx} className="break-inside-avoid">
                      <div className="flex justify-between items-baseline mb-1">
                        <span className="text-sm font-bold text-slate-800">{ach.title}</span>
                        {ach.date && <span className="text-xs text-slate-600 font-medium">{ach.date}</span>}
                      </div>
                      {ach.description && <p className="text-sm leading-relaxed text-slate-700 text-justify">{ach.description}</p>}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE 1: PROFESSIONAL CV (Dark Header with Photo - Image 3) ---
  if (raw.template === 'cv-professional') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-900 mx-auto box-border print:w-full print:min-h-0 print:h-auto print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']} ${MARGIN_MAP[raw.margins || 'balanced']}`}
            style={getCustomStyles()}
          >

            {/* HEADER SECTION */}
            <div className="bg-slate-800 text-white p-8 pb-6 relative break-inside-avoid">
              <div className="flex items-start justify-between gap-6">
                {/* Left: Name and Title */}
                <div className="flex-1">
                  <h1 className="text-4xl font-bold uppercase tracking-wide mb-2">
                    {raw.fullName || "YOUR NAME"}
                  </h1>
                  <p className="text-lg text-slate-300 font-medium">
                    {raw.targetRole || "Professional Title"}
                  </p>
                </div>

                {/* Right: Photo */}
                {raw.photo && (
                  <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/20 shrink-0 bg-white">
                    <img src={raw.photo} alt="Profile" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              {/* Contact Info Bar */}
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300">
                {raw.phone && (
                  <div className="flex items-center gap-2">
                    <PhoneIcon className="w-4 h-4" />
                    <span>{raw.phone}</span>
                  </div>
                )}
                {raw.email && (
                  <div className="flex items-center gap-2">
                    <MailIcon className="w-4 h-4" />
                    <span>{raw.email}</span>
                  </div>
                )}
                {raw.location && (
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="w-4 h-4" />
                    <span>{raw.location}</span>
                  </div>
                )}
                {raw.linkedin && (
                  <div className="flex items-center gap-2">
                    <GlobeIcon className="w-4 h-4" />
                    <span>{raw.linkedin.replace(/^https?:\/\//, '')}</span>
                  </div>
                )}
              </div>
            </div>

            {/* MAIN CONTENT - COMPACT FOR 2 PAGES MAX */}
            <div className={`p-6 ${SPACING_MAP[raw.sectionSpacing || 'standard']}`}>

              {/* Professional Summary */}
              {dataToRender.summary && (
                <section className="page-break-avoid">
                  <div className="bg-slate-100 text-center py-2 mb-3 rounded">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-slate-700">
                      Professional Summary
                    </h2>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-800 text-justify px-2">
                    {dataToRender.summary}
                  </p>
                </section>
              )}

              {/* Core Competencies */}
              {dataToRender.skills.length > 0 && (
                <section className="page-break-avoid">
                  <div className="bg-slate-800 text-white text-center py-2 mb-3 rounded">
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                      Core Competencies
                    </h2>
                  </div>
                  <div className="grid grid-cols-3 gap-x-4 gap-y-1.5 px-2">
                    {dataToRender.skills.map((skill, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-800 shrink-0"></span>
                        <span className="text-xs text-slate-700">{skill}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Work Experience */}
              {dataToRender.experience.length > 0 && (
                <section>
                  <div className="bg-slate-800 text-white text-center py-2 mb-3 rounded">
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                      Work Experiences
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between items-start mb-1.5">
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-slate-900">{exp.role}</h3>
                            <p className="text-sm text-slate-700 font-semibold flex items-center gap-2 mt-0.5">
                              <span className="text-blue-600 text-base">★</span>
                              {exp.company}
                            </p>
                          </div>
                          <span className="text-sm text-slate-600 font-medium whitespace-nowrap ml-4">
                            {exp.dates}
                          </span>
                        </div>

                        {/* Achievements Section */}
                        {raw.achievements && raw.achievements.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs font-bold text-slate-700 uppercase mb-1">{t.awards}:</p>
                            <ul className="list-disc list-outside ml-4 space-y-0.5">
                              {raw.achievements.slice(0, 3).map((ach, aIdx) => (
                                <li key={aIdx} className="text-xs text-slate-700 leading-tight">
                                  <span className="font-bold">{ach.title}</span>
                                  {ach.date && <span> ({ach.date})</span>}
                                  {ach.description && <span> — {ach.description}</span>}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* Certifications - Professional CV */}
              {raw.certifications && raw.certifications.length > 0 && (
                <section className="page-break-avoid">
                  <div className="bg-slate-800 text-white text-center py-2 mb-3 rounded">
                    <h2 className="text-sm font-bold uppercase tracking-widest">
                      {t.certifications}
                    </h2>
                  </div>
                  <ul className="space-y-1 px-2">
                    {raw.certifications.slice(0, 3).map((cert, idx) => (
                      <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                        <span className="text-slate-800 font-bold">•</span>
                        <div>
                          <span className="font-bold">{cert.name}</span>
                          {cert.issuer && <span className="opacity-80"> — {cert.issuer}</span>}
                          {cert.date && <span className="text-slate-400 ml-1">({cert.date})</span>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- TEMPLATE: MEDICAL CV ---
  if (raw.template === 'cv-medical') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-900 mx-auto box-border print:w-full print:min-h-0 print:h-auto print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']} ${MARGIN_MAP[raw.margins || 'balanced']}`}
            style={getCustomStyles()}
          >
            <div className={`p-8 ${SPACING_MAP[raw.sectionSpacing || 'standard']}`}>
              <header className="mb-6 pb-4 border-b-2 page-break-avoid" style={{ borderColor: themeColor }}>
                <h1 className="text-2xl font-bold mb-1">{raw.fullName || "PHYSICIAN NAME"}</h1>
                <p className="text-lg text-slate-600 mb-3">{raw.targetRole}</p>
                <div className="text-sm text-slate-700 grid grid-cols-2 gap-2">
                  {raw.email && <div>Email: {raw.email}</div>}
                  {raw.phone && <div>Phone: {raw.phone}</div>}
                  {raw.location && <div>Location: {raw.location}</div>}
                  {raw.linkedin && <div>LinkedIn: {raw.linkedin}</div>}
                </div>
              </header>

              {raw.certifications && raw.certifications.length > 0 && (
                <section className="mb-6 page-break-avoid">
                  <h2 className="text-base font-bold uppercase tracking-wide mb-3" style={{ color: themeColor }}>{t.certifications}</h2>
                  <div className="space-y-3 px-1">
                    {raw.certifications.map((cert, idx) => (
                      <div key={idx} className="break-inside-avoid">
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-bold text-slate-800">{cert.name}</span>
                          {cert.date && <span className="text-xs text-slate-600 font-medium">{cert.date}</span>}
                        </div>
                        {cert.issuer && <p className="text-xs italic text-slate-700">{cert.issuer}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {raw.education.length > 0 && (
                <section className="mb-6 page-break-avoid">
                  <h2 className="text-base font-bold uppercase tracking-wide mb-3" style={{ color: themeColor }}>Medical Education</h2>
                  <div className="space-y-3">
                    {raw.education.map((edu, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between">
                          <span className="font-bold">{edu.degree}</span>
                          <span className="text-sm text-slate-600">{edu.dates}</span>
                        </div>
                        <p className="text-slate-700">{edu.school}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {dataToRender.experience.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-base font-bold uppercase tracking-wide mb-3" style={{ color: themeColor }}>Clinical Experience</h2>
                  <div className="space-y-4">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between">
                          <span className="font-bold">{exp.role}</span>
                          <span className="text-sm text-slate-600">{exp.dates}</span>
                        </div>
                        <p className="text-slate-700 font-semibold mb-2">{exp.company}</p>
                        <ul className="list-disc list-outside ml-5 space-y-1">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="text-sm text-slate-700">{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {raw.achievements && raw.achievements.length > 0 && (
                <section className="mt-6 page-break-avoid">
                  <h2 className="text-base font-bold uppercase tracking-wide mb-3" style={{ color: themeColor }}>{t.awards}</h2>
                  <div className="space-y-4">
                    {raw.achievements.map((ach, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-sm font-bold text-slate-800">{ach.title}</span>
                          {ach.date && <span className="text-xs text-slate-600 font-medium">{ach.date}</span>}
                        </div>
                        {ach.description && <p className="text-sm leading-relaxed text-slate-700">{ach.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {dataToRender.skills.length > 0 && (
                <section className="page-break-avoid">
                  <h2 className="text-base font-bold uppercase tracking-wide mb-3" style={{ color: themeColor }}>Specializations & Skills</h2>
                  <p className="text-sm text-slate-700">{dataToRender.skills.join(' • ')}</p>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === CV TEMPLATE: FACULTY ===
  if (raw.template === 'cv-faculty') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-900 mx-auto box-border print:w-full print:min-h-0 ${FONT_SIZE_MAP[raw.fontSize || 'medium']} ${MARGIN_MAP[raw.margins || 'balanced']}`}
            style={getCustomStyles()}
          >
            <div className={`p-8 ${SPACING_MAP[raw.sectionSpacing || 'standard']}`}>
              <header className="mb-6 text-center border-b-2 border-slate-900 pb-4 page-break-avoid">
                <h1 className="text-2xl font-bold uppercase mb-1">{raw.fullName || "FACULTY NAME"}</h1>
                <p className="text-slate-700">{raw.targetRole}</p>
                <div className="text-sm text-slate-600 mt-2">
                  {raw.email} • {raw.location} • {raw.website && raw.website.replace(/^https?:\/\//, '')}
                </div>
              </header>

              {dataToRender.summary && (
                <section className="mb-6 page-break-avoid">
                  <h2 className="text-base font-bold uppercase border-b border-slate-300 pb-1 mb-3">Teaching Philosophy</h2>
                  <p className="text-sm leading-relaxed">{dataToRender.summary}</p>
                </section>
              )}

              {raw.education.length > 0 && (
                <section className="mb-6 page-break-avoid">
                  <h2 className="text-base font-bold uppercase border-b border-slate-300 pb-1 mb-3">Academic Qualifications</h2>
                  <div className="space-y-2">
                    {raw.education.map((edu, idx) => (
                      <div key={idx}>
                        <span className="font-bold">{edu.degree}</span>, {edu.school}, {edu.dates}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {dataToRender.experience.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-base font-bold uppercase border-b border-slate-300 pb-1 mb-3">Teaching Experience</h2>
                  <div className="space-y-3">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold">{exp.role}</span>
                          <span className="text-sm text-slate-600">{exp.dates}</span>
                        </div>
                        <p className="italic mb-2">{exp.company}</p>
                        <ul className="list-disc list-outside ml-5 space-y-0.5 text-sm">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {raw.achievements && raw.achievements.length > 0 && (
                <section className="mb-6 page-break-avoid">
                  <h2 className="text-base font-bold uppercase border-b border-slate-300 pb-1 mb-3">{t.awards}</h2>
                  <div className="space-y-4">
                    {raw.achievements.map((ach, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-sm font-bold text-slate-800">{ach.title}</span>
                          {ach.date && <span className="text-xs text-slate-600 font-medium">{ach.date}</span>}
                        </div>
                        {ach.description && <p className="text-sm leading-relaxed text-slate-700">{ach.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === CV TEMPLATE: SCIENTIFIC ===
  if (raw.template === 'cv-scientific') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-900 mx-auto box-border print:w-full print:min-h-0 ${FONT_SIZE_MAP[raw.fontSize || 'medium']} ${MARGIN_MAP[raw.margins || 'balanced']}`}
            style={getCustomStyles()}
          >
            <div className={`p-8 ${SPACING_MAP[raw.sectionSpacing || 'standard']}`}>
              <header className="mb-6 page-break-avoid">
                <h1 className="text-2xl font-bold mb-1">{raw.fullName || "SCIENTIST NAME"}</h1>
                <p className="text-lg text-slate-600 mb-2">{raw.targetRole}</p>
                <div className="text-sm text-slate-700 flex gap-x-3">
                  {raw.email && <span>{raw.email}</span>}
                  {raw.phone && <span>| {raw.phone}</span>}
                  {raw.location && <span>| {raw.location}</span>}
                </div>
              </header>

              {dataToRender.skills.length > 0 && (
                <section className="mb-6 page-break-avoid">
                  <h2 className="text-base font-bold uppercase border-b-2 border-slate-900 pb-1 mb-3">Technical Expertise</h2>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                    {dataToRender.skills.map((skill, idx) => (
                      <div key={idx}>• {skill}</div>
                    ))}
                  </div>
                </section>
              )}

              {raw.education.length > 0 && (
                <section className="mb-6 page-break-avoid">
                  <h2 className="text-base font-bold uppercase border-b-2 border-slate-900 pb-1 mb-3">Education</h2>
                  {raw.education.map((edu, idx) => (
                    <div key={idx} className="mb-2">
                      <div className="font-bold">{edu.degree} - {edu.school}</div>
                      <div className="text-sm text-slate-600">{edu.dates}</div>
                    </div>
                  ))}
                </section>
              )}

              {dataToRender.experience.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-base font-bold uppercase border-b-2 border-slate-900 pb-1 mb-3">Research & Lab Experience</h2>
                  <div className="space-y-4">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between">
                          <span className="font-bold">{exp.role}</span>
                          <span className="text-sm text-slate-600">{exp.dates}</span>
                        </div>
                        <p className="text-slate-700 mb-2">{exp.company}</p>
                        <ul className="list-disc list-outside ml-5 space-y-0.5 text-sm">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {raw.certifications && raw.certifications.length > 0 && (
                <section className="mb-6 page-break-avoid">
                  <h2 className="text-base font-bold uppercase border-b-2 border-slate-900 pb-1 mb-3">{t.certifications}</h2>
                  <div className="space-y-3 px-1">
                    {raw.certifications.map((cert, idx) => (
                      <div key={idx} className="break-inside-avoid">
                        <div className="flex justify-between items-baseline">
                          <span className="text-sm font-bold text-slate-800">{cert.name}</span>
                          {cert.date && <span className="text-xs text-slate-600 font-medium">{cert.date}</span>}
                        </div>
                        {cert.issuer && <p className="text-xs italic text-slate-700">{cert.issuer}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // === CV TEMPLATE: INTERNATIONAL ===
  if (raw.template === 'cv-international') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-900 mx-auto box-border print:w-full print:min-h-0 ${FONT_SIZE_MAP[raw.fontSize || 'medium']} ${MARGIN_MAP[raw.margins || 'balanced']}`}
            style={getCustomStyles()}
          >
            <div className={`p-8 ${SPACING_MAP[raw.sectionSpacing || 'standard']}`}>
              <header className="mb-6 flex gap-6 page-break-avoid">
                {raw.photo && (
                  <div className="w-32 h-32 flex-shrink-0">
                    <img src={raw.photo} alt="Profile" className="w-full h-full object-cover border-2 border-slate-300" />
                  </div>
                )}
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{raw.fullName || "YOUR NAME"}</h1>
                  <p className="text-slate-600 mb-3">{raw.targetRole}</p>
                  <div className="text-sm text-slate-700 space-y-1">
                    {raw.email && <div>Email: {raw.email}</div>}
                    {raw.phone && <div>Phone: {raw.phone}</div>}
                    {raw.location && <div>Address: {raw.location}</div>}
                    {raw.linkedin && <div>LinkedIn: {raw.linkedin}</div>}
                  </div>
                </div>
              </header>

              {dataToRender.summary && (
                <section className="mb-6 page-break-avoid">
                  <h2 className="text-base font-bold uppercase tracking-wide bg-slate-100 px-3 py-2 mb-3">Professional Profile</h2>
                  <p className="text-sm leading-relaxed px-3">{dataToRender.summary}</p>
                </section>
              )}

              {dataToRender.experience.length > 0 && (
                <section className="mb-6">
                  <h2 className="text-base font-bold uppercase tracking-wide bg-slate-100 px-3 py-2 mb-3">Work Experience</h2>
                  <div className="space-y-3 px-3">
                    {dataToRender.experience.map((exp, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between mb-1">
                          <span className="font-bold">{exp.role}</span>
                          <span className="text-sm text-slate-600">{exp.dates}</span>
                        </div>
                        <p className="text-slate-700 font-semibold mb-2">{exp.company}</p>
                        <ul className="list-disc list-outside ml-5 space-y-0.5 text-sm">
                          {exp.bullets.map((bullet, bIdx) => (
                            <li key={bIdx}>{bullet}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {raw.education.length > 0 && (
                <section className="mb-6 page-break-avoid">
                  <h2 className="text-base font-bold uppercase tracking-wide bg-slate-100 px-3 py-2 mb-3">Education</h2>
                  <div className="space-y-2 px-3">
                    {raw.education.map((edu, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between">
                          <span className="font-bold">{edu.degree}</span>
                          <span className="text-sm text-slate-600">{edu.dates}</span>
                        </div>
                        <p className="text-slate-700">{edu.school}</p>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {raw.achievements && raw.achievements.length > 0 && (
                <section className="page-break-avoid">
                  <h2 className="text-base font-bold uppercase tracking-wide bg-slate-100 px-3 py-2 mb-3">{t.awards}</h2>
                  <div className="space-y-4 px-3">
                    {raw.achievements.map((ach, idx) => (
                      <div key={idx} className="page-break-avoid">
                        <div className="flex justify-between items-baseline mb-1">
                          <span className="text-sm font-bold text-slate-800">{ach.title}</span>
                          {ach.date && <span className="text-xs text-slate-600 font-medium">{ach.date}</span>}
                        </div>
                        {ach.description && <p className="text-sm leading-relaxed text-slate-700">{ach.description}</p>}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }


  // --- TEMPLATE: BUSINESS PLAN (Specialized for Entrepreneurs) ---
  if (raw.mode === 'business-plan') {
    return (
      <div className="w-full flex justify-center py-8 print:p-0 print:w-full">
        <div className="shadow-xl print:shadow-none bg-white preview-container-shadow print:w-full">
          <div
            ref={containerRef}
            className={`w-[210mm] min-h-[297mm] bg-white text-slate-800 mx-auto box-border print:w-full print:min-h-0 print:overflow-visible ${FONT_SIZE_MAP[raw.fontSize || 'medium']}`}
            style={getCustomStyles()}
          >

            {/* Cover Page */}
            <div className="h-[297mm] flex flex-col justify-center items-center text-center p-10 bg-slate-900 text-white relative overflow-hidden page-break-after-always print:h-[297mm]">
              <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>

              <h1 className="text-6xl font-black uppercase tracking-tight mb-4">{raw.businessName || "BUSINESS NAME"}</h1>
              <p className="text-2xl font-light text-slate-300 tracking-[0.2em] uppercase mb-16">Business Plan</p>

              <div className="border-t border-white/20 pt-8 w-full max-w-md">
                <p className="text-lg font-bold">{raw.fullName || raw.ownerName || "Founder Name"}</p>
                <p className="text-slate-400">{raw.location}</p>
                <p className="text-slate-400 mt-2">{new Date().getFullYear()}</p>
              </div>
            </div>

            {/* Content Pages */}
            <div className="p-[20mm] space-y-12">

              <header className="border-b-4 border-slate-900 pb-4 mb-12">
                <h2 className="text-3xl font-black uppercase tracking-tighter">{raw.businessName}</h2>
                <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{raw.businessSector}</p>
              </header>

              {/* Executive Summary */}
              <section className="mb-10">
                <h2 className="text-2xl font-bold uppercase text-slate-900 border-b-4 border-blue-600 mb-6 pb-2 inline-block">1. Executive Summary</h2>
                <div className="space-y-6">
                  {raw.summary && (
                    <div className="break-inside-avoid">
                      <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-2">Overview</h3>
                      <p className="text-sm leading-relaxed text-justify">{raw.summary}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 break-inside-avoid">
                      <h3 className="font-bold text-blue-900 mb-2">The Problem</h3>
                      <p className="text-sm leading-relaxed">{raw.problemStatement}</p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 break-inside-avoid">
                      <h3 className="font-bold text-blue-900 mb-2">Our Solution</h3>
                      <p className="text-sm leading-relaxed">{raw.solutionOverview}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Market Analysis */}
              <section className="mb-10 page-break-before-auto">
                <h2 className="text-2xl font-bold uppercase text-slate-900 border-b-4 border-slate-300 mb-6 pb-2 inline-block">2. Market Analysis</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="break-inside-avoid">
                    <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-3">Target Audience</h3>
                    <p className="text-sm leading-relaxed text-justify text-slate-600">{raw.targetCustomers}</p>
                  </div>
                  <div className="break-inside-avoid">
                    <h3 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-3">Competition</h3>
                    <p className="text-sm leading-relaxed text-justify text-slate-600">{raw.competitors}</p>
                  </div>
                  <div className="md:col-span-2 bg-slate-900 text-white p-6 rounded-xl break-inside-avoid">
                    <h3 className="font-bold text-blue-400 uppercase text-xs tracking-wider mb-2">Unique Selling Proposition</h3>
                    <p className="text-lg font-medium tracking-tight leading-relaxed">{raw.uniqueAdvantage}</p>
                  </div>
                </div>
              </section>

              {/* Strategy & Vision */}
              <section className="mb-10 break-inside-avoid">
                <h2 className="text-2xl font-bold uppercase text-slate-900 border-b-4 border-purple-600 mb-6 pb-2 inline-block">3. Strategy & Execution</h2>
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-2">Marketing Plan</h4>
                    <p className="text-sm leading-relaxed text-slate-600">{raw.marketingStrategy}</p>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-700 uppercase text-xs tracking-wider mb-2">Long-Term Vision</h4>
                    <p className="text-sm leading-relaxed text-slate-600">{raw.longTermVision}</p>
                  </div>
                </div>
              </section>

              {/* Financials */}
              <section className="mb-10 break-inside-avoid">
                <h2 className="text-2xl font-bold uppercase text-slate-900 border-b-4 border-green-600 mb-6 pb-2 inline-block">4. Financial Overview</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="p-5 bg-slate-100 rounded-xl border border-slate-200">
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">Startup Cost</p>
                    <p className="text-2xl font-black text-slate-900">{raw.startupCosts || "0 XAF"}</p>
                  </div>
                  <div className="p-5 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-[10px] text-green-600 font-black uppercase tracking-widest mb-1">Expected Revenue</p>
                    <p className="text-2xl font-black text-green-900">{raw.expectedRevenue || "0 XAF"}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm pt-4 border-t border-slate-100">
                  <div className="break-inside-avoid">
                    <span className="font-bold block text-slate-400 uppercase text-[10px] tracking-widest mb-2">Revenue Model</span>
                    <p className="text-slate-600 leading-relaxed">{raw.revenueModel}</p>
                  </div>
                  <div className="break-inside-avoid">
                    <span className="font-bold block text-slate-400 uppercase text-[10px] tracking-widest mb-2">Operating Expenses</span>
                    <p className="text-slate-600 leading-relaxed">{raw.operatingCosts}</p>
                  </div>
                </div>
              </section>

            </div>
          </div>
        </div>
      </div>
    );
  }


  return null;
});

ResumePreview.displayName = 'ResumePreview';
export default ResumePreview;
