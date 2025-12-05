import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckIcon, DownloadIcon, SparklesIcon } from '../components/Icons';
import { useResume } from '../context/ResumeContext';
import ResumePreview from '../components/ResumePreview';
import { PaymentModal } from '../components/PaymentModal';
import { DownloadVerificationModal } from '../components/DownloadVerificationModal';
import { UI } from '../constants';

export const PreviewPage: React.FC = () => {
    const navigate = useNavigate();
    const { data, setData, aiOutput, aiCoverLetter } = useResume();
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isDownloadVerificationOpen, setIsDownloadVerificationOpen] = useState(false);
    const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
    const printRef = useRef<any>(null);
    const t = UI;

    const handleDownloadClick = () => {
        if (!data.isPaid) {
            setIsPaymentModalOpen(true);
            return;
        }
        setIsDownloadVerificationOpen(true);
    };

    const handleDownloadConfirmed = () => {
        setIsDownloadVerificationOpen(false);
        executeDownload();

        setTimeout(() => {
            setData(prev => ({
                ...prev,
                isPaid: false,
                hasDownloaded: true
            }));
        }, 2000);
    };

    const handlePaymentSuccess = () => {
        setData(prev => ({
            ...prev,
            isPaid: true,
            hasDownloaded: false
        }));
        setIsPaymentModalOpen(false);
        setShowSuccessAnimation(true);

        setTimeout(() => {
            setIsDownloadVerificationOpen(true);
        }, 500);

        setTimeout(() => setShowSuccessAnimation(false), 3000);
    };

    const executeDownload = () => {
        setTimeout(async () => {
            if (printRef.current && printRef.current.downloadAsPDF) {
                try {
                    await printRef.current.downloadAsPDF();
                } catch (error) {
                    console.error("PDF Download failed", error);
                    alert("Failed to generate PDF. Please try again.");
                }
            } else {
                alert("Preview not ready. Please try again.");
            }
        }, 500);
    };

    return (
        <div className="min-h-screen flex flex-col bg-slate-50 print:bg-white">
            {/* Navigation */}
            <nav className="bg-white/90 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50 print:hidden shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: data.themeColor }}>
                            <SparklesIcon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-xl text-slate-800 group-hover:text-slate-600 transition-colors">ResumeAI</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate('/edit')}
                            className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            Back to Edit
                        </button>
                        <button
                            onClick={handleDownloadClick}
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
                            ) : (
                                <>
                                    <DownloadIcon className="w-4 h-4" />
                                    <span className="hidden sm:inline">{data.isPaid ? t.download : t.download}</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 flex justify-center print:p-0 print:m-0 print:max-w-none">
                <div className="w-full print:static print:max-w-none print:w-full flex flex-col items-center">
                    {!aiOutput && !aiCoverLetter && (
                        <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-800 rounded-xl text-sm print:hidden w-full max-w-lg text-center">
                            {data.language === 'fr'
                                ? "L'aperçu montre actuellement les données brutes. Retournez à l'édition et cliquez sur « Générer » pour l'IA."
                                : "The preview currently shows raw data. Go back to Edit and click \"Generate\" to let AI rewrite it professionally."
                            }
                        </div>
                    )}

                    <div className="w-full overflow-x-auto overflow-y-auto print:overflow-visible flex justify-center touch-pan-y">
                        <div className="transform origin-top scale-[0.55] sm:scale-[0.65] md:scale-[0.85] xl:scale-100 print:scale-100 print:transform-none">
                            <ResumePreview ref={printRef} raw={data} aiContent={aiOutput} aiCoverLetter={aiCoverLetter} />
                        </div>
                    </div>
                </div>
            </main>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onSuccess={handlePaymentSuccess}
                amountXAF={300}
            />

            <DownloadVerificationModal
                isOpen={isDownloadVerificationOpen}
                onClose={() => setIsDownloadVerificationOpen(false)}
                onConfirm={handleDownloadConfirmed}
            />

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
        @media print {
          nav, .print\\:hidden {
            display: none !important;
          }
          body {
            background: white;
          }
        }
      `}</style>
        </div>
    );
};
