"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Palette, ArrowRight, Mail, Lock, X } from 'lucide-react';
import Link from 'next/link';
import axios, { AxiosError } from 'axios';
import { useRouter } from "next/navigation";
import { BACKEND_URL } from '@/config';
import { useRedirectIfAuthenticated } from '@/hooks/useAuth';

const Login: React.FC = () => {
  useRedirectIfAuthenticated();
  
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  // New state to show server errors and optional field-level validation errors
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | string> | null>(null);
  
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setFieldErrors(null);
    try {
      const response = await axios.post(`${BACKEND_URL}/signin`, formData);
      localStorage.setItem('token', response.data.token);
      router.push('/dashboard');
    } catch (err) {
      const axiosErr = err as AxiosError<{ message?: string; errors?: Record<string, string[] | string> }>;
      // Try to parse typical server error shapes
      if (axiosErr?.response?.data) {
        const data = axiosErr.response.data;
        if (typeof data === 'string') {
          setErrorMessage(data);
        } else {
          if (data.message) setErrorMessage(data.message);
          if (data.errors) setFieldErrors(data.errors);
        }
      } else {
        setErrorMessage(axiosErr?.message || 'An unexpected error occurred.');
      }
      console.error('Sign in error:', axiosErr);
    } finally {
      setIsLoading(false);
    }
  };
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 selection:bg-gray-800">
      {/* Background Decorative Element (Sketchy) */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-[0.03]">
        <svg className="absolute -top-24 -left-24 w-96 h-96 text-white transform -rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <svg className="absolute -bottom-24 -right-24 w-96 h-96 text-white transform rotate-12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M8 14s1.5 2 4 2 4-2 4-2" />
          <line x1="9" y1="9" x2="9.01" y2="9" />
          <line x1="15" y1="9" x2="15.01" y2="9" />
        </svg>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        {/* Header/Logo */}
        <motion.div variants={itemVariants} className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6 group">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <Palette className="w-5 h-5 text-gray-950" />
            </div>
            <span className="text-2xl font-semibold text-white tracking-tight">OpenDraw</span>
          </Link>
          <h1 className="text-4xl font-light text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-400">Sign in to your collaborative workspace.</p>
        </motion.div>

        {/* Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-900/40 backdrop-blur-xl border border-gray-800 rounded-3xl p-8 shadow-2xl"
        >
         {/* Error alert */}
         {errorMessage || fieldErrors ? (
           <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl flex flex-col gap-2">
             <div className="flex items-start justify-between">
               <div className="text-sm font-semibold">{errorMessage ?? 'Authentication failed'}</div>
               <button
                 type="button"
                 onClick={() => { setErrorMessage(null); setFieldErrors(null); }}
                 className="text-red-400/60 hover:text-red-400 transition-colors"
               >
                 <X size={16} />
               </button>
             </div>
             {fieldErrors && (
               <div className="text-xs space-y-1">
                 {Object.entries(fieldErrors).map(([field, msgs]) => (
                   <div key={field}>
                     <span className="capitalize font-medium">{field}:</span>{' '}
                     {Array.isArray(msgs) ? msgs.join(', ') : String(msgs)}
                   </div>
                 ))}
               </div>
             )}
           </div>
         ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-400 ml-1">Email Address</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-12 pr-4 py-3.5 bg-gray-950 border rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all ${fieldErrors?.email ? 'border-red-500/50' : 'border-gray-800 focus:border-gray-600'}`}
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="text-sm font-medium text-gray-400">Password</label>
                <a href="#" className="text-xs text-gray-500 hover:text-white transition-colors">
                  Forgot?
                </a>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-white transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-12 pr-12 py-3.5 bg-gray-950 border rounded-xl text-white placeholder-gray-600 focus:outline-none transition-all ${fieldErrors?.password ? 'border-red-500/50' : 'border-gray-800 focus:border-gray-600'}`}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-white text-gray-950 font-bold rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group shadow-lg hover:shadow-xl mt-8 cursor-pointer"
            >
              {isLoading ? (
                <motion.div
                  className="w-5 h-5 border-2 border-gray-400 border-t-gray-950 rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-800"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-transparent text-gray-500 uppercase tracking-widest font-semibold">Or continue with</span>
            </div>
          </div>

          {/* Social Login */}
          <button
            type="button"
            className="w-full flex items-center justify-center px-4 py-3.5 bg-gray-950 border border-gray-800 rounded-xl text-gray-300 hover:bg-gray-900 transition-all hover:border-gray-700 font-medium group cursor-pointer"
          >
            <svg className="w-5 h-5 mr-3 opacity-70 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
            <span className="ml-2 text-[10px] bg-blue-500/20 text-blue-400 font-bold px-1.5 py-0.5 rounded border border-blue-500/20">
                SOON
             </span>
          </button>
        </motion.div>

        {/* Footer Link */}
        <motion.p variants={itemVariants} className="text-center mt-8 text-gray-500 text-sm">
          New to OpenDraw?{' '}
          <Link 
            href="/signup" 
            className="font-semibold text-white hover:underline decoration-gray-600 underline-offset-4"
          >
            Create an account
          </Link>
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;