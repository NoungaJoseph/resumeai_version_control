import React, { useState, useEffect } from 'react';
import { PhoneIcon } from './Icons';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amountXAF: number;
  mode: string;
}

// Get the backend URL from environment variables, or default to localhost for development
const BACKEND_URL = (import.meta as any).env?.VITE_BACKEND_URL || 'http://localhost:3001';

export const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSuccess, amountXAF, mode }) => {
  const [step, setStep] = useState<'select' | 'phone' | 'processing' | 'success'>('select');
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'orange' | 'card' | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');

  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setError('');
      setPhoneNumber('');
    }
  }, [isOpen]);

  const handleMethodSelect = (method: 'momo' | 'orange' | 'card') => {
    setPaymentMethod(method);
    if (method === 'card') {
      // Placeholder for future Stripe integration
      alert("Card payments (Stripe) coming soon! Please use Mobile Money.");
      return;
    }
    setStep('phone');
  };

  const initiatePayment = async () => {
    if (!phoneNumber || phoneNumber.length < 9) {
      setError("Please enter a valid phone number (e.g., 677...)");
      return;
    }

    setStep('processing');
    setError('');

    try {
      // Format phone: Ensure it starts with 237
      const formattedPhone = phoneNumber.startsWith('237') ? phoneNumber : `237${phoneNumber}`;

      const response = await fetch(`${BACKEND_URL}/api/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: String(amountXAF),
          from: formattedPhone,
          description: `Download ${mode}`,
          mode: mode
        })
      });

      const data = await response.json();

      if (data.success) {
        setReference(data.reference);
        // Start polling for status
        pollStatus(data.reference);
      } else {
        setStep('phone');
        setError('Payment failed to initialize. Please try again.');
      }
    } catch (err) {
      console.error("Payment init error:", err);
      setStep('phone');
      setError('Server connection failed. Is the backend running?');
    }
  };

  const pollStatus = async (ref: string) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/status/${ref}`);
        const data = await res.json();

        if (data.status === 'SUCCESSFUL') {
          clearInterval(interval);
          setStep('success');
          setTimeout(() => {
            onSuccess(); // Calls the parent function to unlock download
          }, 2000);
        } else if (data.status === 'FAILED') {
          clearInterval(interval);
          setStep('phone');
          setError('Transaction failed or cancelled. Please try again.');
        }
        // If PENDING, continue polling
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 3000); // Check every 3 seconds

    // Timeout after 3 minutes (increased from 2 for slower networks)
    setTimeout(() => {
      clearInterval(interval);
      if (step === 'processing') {
        setStep('phone');
        setError('Transaction timed out. Please check your phone for any pending prompts and try again.');
      }
    }, 180000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto" style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto my-auto transform transition-all scale-100">

        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
          <h3 className="text-xl font-bold">Unlock Your Documents</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white text-2xl leading-none">&times;</button>
        </div>

        <div className="p-8">

          {/* STEP 1: SELECT METHOD */}
          {step === 'select' && (
            <div className="space-y-6">
              <div className="text-center mb-6">
                <p className="text-slate-600">Total Amount</p>
                <p className="text-4xl font-bold text-slate-900">{amountXAF} XAF</p>
                <p className="text-xs text-slate-400 mt-1">({amountXAF} FCFA)</p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleMethodSelect('momo')}
                  className="w-full flex items-center justify-between p-4 border-2 border-slate-100 rounded-xl hover:border-yellow-400 hover:bg-yellow-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-xs font-bold text-slate-900">MTN</div>
                    <span className="font-bold text-slate-700 group-hover:text-slate-900">MTN Mobile Money</span>
                  </div>
                  <span className="text-slate-400">→</span>
                </button>

                <button
                  onClick={() => handleMethodSelect('orange')}
                  className="w-full flex items-center justify-between p-4 border-2 border-slate-100 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-xs font-bold text-white">OM</div>
                    <span className="font-bold text-slate-700 group-hover:text-slate-900">Orange Money</span>
                  </div>
                  <span className="text-slate-400">→</span>
                </button>

                <button
                  onClick={() => handleMethodSelect('card')}
                  className="w-full flex items-center justify-between p-4 border-2 border-slate-100 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all group opacity-60"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <span className="font-bold text-slate-700 block group-hover:text-slate-900">Credit Card</span>
                      <span className="text-xs text-slate-400">Stripe (Coming Soon)</span>
                    </div>
                  </div>
                  <span className="text-slate-400">→</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: ENTER PHONE */}
          {step === 'phone' && (
            <div className="animate-in slide-in-from-right-8 duration-300">
              <div className="text-center mb-6">
                <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center mb-4 text-xl font-bold
                    ${paymentMethod === 'momo' ? 'bg-yellow-400 text-slate-900' : 'bg-orange-500 text-white'}`}>
                  {paymentMethod === 'momo' ? 'MTN' : 'OM'}
                </div>
                <h4 className="text-lg font-bold text-slate-900">Enter {paymentMethod === 'momo' ? 'MTN' : 'Orange'} Number</h4>
                <p className="text-sm text-slate-500">You will receive a prompt to approve {amountXAF} XAF</p>
              </div>

              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <PhoneIcon className="w-5 h-5" />
                  </div>
                  <input
                    type="tel"
                    placeholder="6xx xxx xxx"
                    className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none text-lg"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                  />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep('select')}
                    className="flex-1 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={initiatePayment}
                    className="flex-[2] py-3 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-colors shadow-lg"
                  >
                    Pay Now
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PROCESSING */}
          {step === 'processing' && (
            <div className="text-center py-8 animate-in fade-in duration-500">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute top-0 left-0 w-full h-full border-4 border-slate-100 rounded-full"></div>
                <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <h4 className="text-lg font-bold text-slate-900 mb-2">Check your phone!</h4>
              <p className="text-slate-600 mb-6">Please dial the code or accept the prompt on your mobile device to complete the payment.</p>
              <p className="text-xs text-slate-400">Waiting for confirmation...</p>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 'success' && (
            <div className="text-center py-8 animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-10 h-10">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <h4 className="text-2xl font-bold text-slate-900 mb-2">Payment Successful!</h4>
              <p className="text-slate-600">Your documents are now unlocked.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}