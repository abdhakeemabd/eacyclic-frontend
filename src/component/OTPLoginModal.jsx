import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../context/UserContext';
import { FaEnvelope, FaKey, FaTimes, FaLock, FaCheckCircle, FaExclamationCircle, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import Logo from '../assets/images/logo/logo.png';

const OTPLoginModal = ({ isOpen, onClose, onSuccess }) => {
  const { sendOTP, verifyOTP } = useUser();
  const [step, setStep] = useState(1); // 1: Email, 2: OTP Verification, 3: Success
  const [email, setEmail] = useState('');
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [timer, setTimer] = useState(0);

  const inputRefs = useRef([]);

  // Handle countdown timer for Resend OTP button
  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  if (!isOpen) return null;

  const handleSendOTP = async (e) => {
    if (e) e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await sendOTP(email);
    setLoading(false);

    if (res.success) {
      setStep(2);
      setTimer(60);
      setOtpDigits(['', '', '', '', '', '']);
      setSuccessMsg(`We sent a 6-digit verification code to ${email}`);

      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 150);
    } else {
      setError(res.error || 'Failed to send OTP. Please try again.');
    }
  };

  const handleVerifyOTP = async (e) => {
    if (e) e.preventDefault();
    const fullOtp = otpDigits.join('');

    if (fullOtp.length !== 6) {
      setError('Please enter all 6 digits of your verification code');
      return;
    }

    setError('');
    setLoading(true);

    const res = await verifyOTP(email, fullOtp);
    setLoading(false);

    if (res.success) {
      setStep(3); // Success Screen
      setTimeout(() => {
        if (onSuccess) onSuccess(res.data);
        onClose();
        resetForm();
      }, 1400);
    } else {
      setError(res.error || 'Invalid verification code');
    }
  };

  const handleDigitChange = (index, value) => {
    const val = value.replace(/[^0-9]/g, '');
    if (!val && value !== '') return;

    const newDigits = [...otpDigits];
    newDigits[index] = val.slice(-1);
    setOtpDigits(newDigits);
    setError('');

    if (val && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowRight' && index < 5) {
      e.preventDefault();
      inputRefs.current[index + 1]?.focus();
    } else if (e.key === 'ArrowLeft' && index > 0) {
      e.preventDefault();
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '').slice(0, 6);
    if (pasteData) {
      const digits = pasteData.split('');
      const newDigits = [...otpDigits];
      digits.forEach((d, i) => {
        if (i < 6) newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      if (digits.length === 6) {
        inputRefs.current[5]?.focus();
      } else {
        inputRefs.current[digits.length]?.focus();
      }
    }
  };

  const resetForm = () => {
    setStep(1);
    setEmail('');
    setOtpDigits(['', '', '', '', '', '']);
    setError('');
    setSuccessMsg('');
    setTimer(0);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-950/70 backdrop-blur-md p-4 transition-all duration-300">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 transition-all transform scale-100">
        
        {/* Top Header Card */}
        <div className="bg-gradient-to-br from-gray-900 via-orange-950 to-orange-600 px-6 pt-8 pb-7 text-white relative overflow-hidden">
          {/* Subtle Decorative Glow Circle */}
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-orange-500/20 rounded-full blur-2xl z-2"></div>
          
          <button
            onClick={() => { onClose(); resetForm(); }}
            className="absolute top-4 right-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all cursor-pointer"
            aria-label="Close"
          >
            <FaTimes className="text-base" />
          </button>

          {step === 2 && (
            <button
              onClick={() => { setStep(1); setError(''); setSuccessMsg(''); }}
              className="absolute top-4 left-4 text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-medium"
            >
              <FaArrowLeft className="text-xs" />
              <span>Back</span>
            </button>
          )}
          <div className="flex flex-col items-center text-center relative z-10">
            <div className="flex items-center justify-center mb-3">
              {step === 3 ? (
                <div className="w-14 h-14 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl flex items-center justify-center shadow-lg">
                  <FaCheckCircle className="text-3xl text-green-400" />
                </div>
              ) : (
                <img src={Logo} alt="Eacyclic Logo" className="h-9 object-contain drop-shadow-md" />
              )}
            </div>

            <h3 className="text-2xl font-black tracking-tight text-white">
              {step === 1 && 'Welcome Back'}
              {step === 2 && 'Enter Verification Code'}
              {step === 3 && 'Access Granted'}
            </h3>

            <p className="text-xs text-gray-300 mt-1.5 max-w-xs font-normal leading-relaxed">
              {step === 1 && 'Enter your email address to receive a secure login code.'}
              {step === 2 && `We sent a 6-digit code to ${email}`}
              {step === 3 && 'Logged in successfully! Redirecting...'}
            </p>

            {/* Step Progress Dots */}
            {step !== 3 && (
              <div className="flex items-center gap-1.5 mt-4">
                <span className={`h-1.5 rounded-full transition-all duration-300 ${step === 1 ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/30'}`}></span>
                <span className={`h-1.5 rounded-full transition-all duration-300 ${step === 2 ? 'w-6 bg-orange-500' : 'w-1.5 bg-white/30'}`}></span>
              </div>
            )}
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 md:p-7 bg-white">
          
          {/* Notification Alert Banners */}
          {error && (
            <div className="mb-5 bg-red-50 border border-red-200/80 text-red-700 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs font-medium animate-fadeIn">
              <FaExclamationCircle className="text-red-500 shrink-0 text-base" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && step === 2 && (
            <div className="mb-5 bg-orange-50 border border-orange-200/80 text-orange-800 px-4 py-3 rounded-2xl flex items-center gap-3 text-xs font-medium animate-fadeIn">
              <FaCheckCircle className="text-orange-500 shrink-0 text-base" />
              <span>{successMsg}</span>
            </div>
          )}

          {step === 1 && (
            /* STEP 1: Enter Email */
            <form onSubmit={handleSendOTP} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                    <FaEnvelope className="text-sm" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                    placeholder="john@example.com"
                    className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 outline-none transition-all text-sm font-semibold text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all duration-200 shadow-md active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-base" />
                    <span>Sending Code...</span>
                  </>
                ) : (
                  <>
                    <span>Continue with OTP</span>
                    <FaKey className="text-xs" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === 2 && (
            /* STEP 2: Enter Telegram-style OTP */
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Enter Verification Code
                  </label>
                  <span className="text-[11px] font-semibold text-gray-400">6 digits</span>
                </div>

                <div className="flex justify-between gap-2" onPaste={handlePaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (inputRefs.current[idx] = el)}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleDigitChange(idx, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(idx, e)}
                      className="w-10 h-12 md:w-11 md:h-12 text-center text-lg font-bold border border-gray-300 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all bg-white text-gray-900 shadow-none"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otpDigits.join('').length !== 6}
                className="w-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-3.5 px-4 rounded-2xl transition-all duration-200 shadow-lg shadow-orange-500/25 active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-base" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <span>Verify & Login</span>
                )}
              </button>

              {/* Resend Timer */}
              <div className="text-center text-xs text-gray-500 pt-1">
                Didn't receive code?{' '}
                {timer > 0 ? (
                  <span className="font-bold text-orange-600">
                    Resend in {timer}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={loading}
                    className="font-bold text-orange-600 hover:text-orange-700 hover:underline cursor-pointer disabled:opacity-50"
                  >
                    Resend Code Now
                  </button>
                )}
              </div>
            </form>
          )}

          {step === 3 && (
            /* STEP 3: Success State */
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 text-green-600 shadow-inner">
                <FaCheckCircle className="text-3xl" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">Successfully Authenticated!</h4>
              <p className="text-xs text-gray-500 mt-1">Welcome back to Eacyclic Marketplace.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default OTPLoginModal;
