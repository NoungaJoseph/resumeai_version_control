
import React from 'react';
import { SparklesIcon, RocketIcon, CheckIcon, BrainIcon } from './Icons';

interface LandingPageProps {
  onStart: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 z-0" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <SparklesIcon className="w-4 h-4" />
              Powered by Gemini 2.5 Flash AI
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-700">
              Build your career story <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">in seconds.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
              Turn rough notes into professional Resumes, CVs, and Cover Letters. 
              No writing skills required—just let the AI do the heavy lifting.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
              <button 
                onClick={onStart}
                className="px-8 py-4 bg-slate-900 text-white text-lg font-bold rounded-xl hover:bg-slate-800 hover:scale-105 transition-all shadow-xl shadow-blue-900/10"
              >
                Build My Resume Now
              </button>
              <a 
                href="#features"
                className="px-8 py-4 bg-white text-slate-700 text-lg font-bold rounded-xl border border-slate-200 hover:bg-slate-50 transition-all"
              >
                How it works
              </a>
            </div>
          </div>
        </div>
        
        {/* Decorative blob */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-400/10 rounded-full blur-3xl -z-10"></div>
      </header>

      {/* Features Grid */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Why choose ResumeAI?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">We've stripped away the complexity of formatting and writing. Focus on your achievements, and we'll handle the rest.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <BrainIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Smart AI Rewriting</h3>
              <p className="text-slate-600 leading-relaxed">
                Don't know how to phrase it? Just type "led a team" and watch it transform into "Orchestrated a cross-functional team of 10..."
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
                <RocketIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Tailored to Your Niche</h3>
              <p className="text-slate-600 leading-relaxed">
                Select your target role (e.g., Nurse, Engineer, Executive) and the AI adapts the tone and terminology to match industry standards.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-100 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-teal-600 mb-6">
                <CheckIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">ATS-Friendly PDF</h3>
              <p className="text-slate-600 leading-relaxed">
                Our templates are designed to pass Applicant Tracking Systems (ATS) while looking beautiful for human recruiters.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                <div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">Three steps to your dream job.</h2>
                    <p className="text-slate-400 mb-8 text-lg">Stop wrestling with Word documents. Our builder streamliness the entire process.</p>
                    
                    <div className="space-y-8">
                        <div className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">1</span>
                            <div>
                                <h4 className="font-bold text-lg mb-1">Enter Rough Notes</h4>
                                <p className="text-slate-400 text-sm">Fill in your experience loosely. No need for perfect grammar.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">2</span>
                            <div>
                                <h4 className="font-bold text-lg mb-1">Click Generate</h4>
                                <p className="text-slate-400 text-sm">The AI polishes your text and organizes the layout instantly.</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold">3</span>
                            <div>
                                <h4 className="font-bold text-lg mb-1">Download & Apply</h4>
                                <p className="text-slate-400 text-sm">Export as a clean, crisp PDF ready for application.</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl transform rotate-3 opacity-50"></div>
                    <div className="relative bg-slate-800 rounded-2xl p-2 border border-slate-700 shadow-2xl">
                        {/* Abstract representation of UI */}
                        <div className="bg-slate-900 rounded-xl p-6 space-y-4">
                            <div className="flex gap-4 items-center mb-6">
                                <div className="w-12 h-12 rounded-full bg-slate-700"></div>
                                <div className="space-y-2">
                                    <div className="h-4 w-32 bg-slate-700 rounded"></div>
                                    <div className="h-3 w-24 bg-slate-800 rounded"></div>
                                </div>
                            </div>
                            <div className="h-2 w-full bg-slate-800 rounded"></div>
                            <div className="h-2 w-full bg-slate-800 rounded"></div>
                            <div className="h-2 w-3/4 bg-slate-800 rounded"></div>
                            <div className="mt-4 p-4 bg-blue-900/30 border border-blue-500/30 rounded-lg">
                                <div className="h-3 w-full bg-blue-500/20 rounded mb-2"></div>
                                <div className="h-3 w-5/6 bg-blue-500/20 rounded"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
                    <SparklesIcon className="w-5 h-5" />
                </div>
                <span className="font-bold text-lg text-slate-900">ResumeAI</span>
            </div>
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} ResumeAI Builder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
