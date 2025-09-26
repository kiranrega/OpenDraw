"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Palette, User, Mail, Lock, ArrowRight, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import axios from 'axios';
import { useRouter } from "next/navigation";

const SignUpPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const router = useRouter();

  // New state for server error message and field-level validation errors
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[] | string> | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear local and server errors when user types
    setErrors([]);
    setErrorMessage(null);
    setFieldErrors(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // client-side check -> treat like API field error
    if (formData.password !== formData.confirmPassword) {
      setErrors([]);
      setErrorMessage(null);
      setFieldErrors({ confirmPassword: ['Passwords do not match.'] });
      return;
    }
    setErrors([]);
    setErrorMessage(null);
    setFieldErrors(null);
    setIsLoading(true);
    try {
      const response = await axios.post('http://localhost:3001/signup', formData);
      console.log('Sign up successful:', response.data);
      router.push('/signin');
      // keep original behavior (could redirect or show success)
    } catch (err) {
      const axiosErr = err as any;
      if (axiosErr?.response?.data) {
        const data = axiosErr.response.data;
        if (typeof data === 'string') {
          setErrorMessage(data);
        } else {
          if (data.message) setErrorMessage(data.message);
          if (data.errors) setFieldErrors(data.errors);
        }
      } else {
        setErrors([axiosErr?.message || 'An unexpected error occurred.']);
      }
      console.error('Sign up error:', axiosErr);
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
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
              <Palette className="w-4 h-4 text-gray-900" />
            </div>
            <span className="text-2xl font-semibold text-white">DrawFlow</span>
          </Link>
          <h1 className="text-4xl font-light text-white">Create an Account</h1>
          <p className="text-gray-400 mt-2">Join to start collaborating and creating.</p>
        </motion.div>

        {/* Form */}
        <motion.div variants={itemVariants}>
          {/* Error alert (server message + field errors) */}
          {errorMessage || fieldErrors ? (
            <div className="mb-4 bg-red-600 text-white p-3 rounded-lg flex flex-col gap-2">
              <div className="flex items-start justify-between">
                <div className="text-sm font-medium">{errorMessage ?? 'There was a problem'}</div>
                <button
                  type="button"
                  onClick={() => { setErrorMessage(null); setFieldErrors(null); }}
                  className="text-white/80 hover:text-white text-xs"
                >
                  Close
                </button>
              </div>
              {fieldErrors && (
                <div className="text-sm text-white/90">
                  {Object.entries(fieldErrors).map(([field, msgs]) => (
                    <div key={field}>
                      <strong className="capitalize">{field}:</strong>{' '}
                      {Array.isArray(msgs) ? msgs.join(', ') : String(msgs)}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${fieldErrors?.name ? 'border-red-500' : 'border-gray-700 focus:border-gray-400'}`}
                placeholder="Full Name"
                
              />
            </div>
            
            {/* Email Field */}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full pl-10 pr-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${fieldErrors?.email ? 'border-red-500' : 'border-gray-700 focus:border-gray-400'}`}
                placeholder="Email Address"
                
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${fieldErrors?.password ? 'border-red-500' : 'border-gray-700 focus:border-gray-400'}`}
                placeholder="Password"
                
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* Confirm Password Field */}
            <div className="relative">
              <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                className={`w-full pl-10 pr-12 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-colors ${fieldErrors?.confirmPassword ? 'border-red-500' : 'border-gray-700 focus:border-gray-400'}`}
                placeholder="Confirm Password"
                
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            
            {/* display client-side (errors) and server messages */}
            {errors.length > 0 && (
              <div className="text-red-400 text-sm text-center">
                {errors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-white text-gray-900 font-semibold rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
            >
              {isLoading ? (
                <>
                  <motion.div
                    className="w-5 h-5 border-2 border-gray-400 border-t-gray-900 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span className="ml-2">Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Free Account</span>
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </motion.div>
        
        {/* Divider */}
        <motion.div variants={itemVariants} className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-900 text-gray-500">Or</span>
          </div>
        </motion.div>
        
        {/* Social Login */}
         <motion.div variants={itemVariants}>
          <button
            type="button"
            className="w-full flex items-center justify-center px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 mr-3 opacity-50" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
            <span className="ml-2 text-xs bg-blue-600 text-white font-semibold px-2 py-0.5 rounded-full">
                Coming Soon
              </span>
          </button>
          
        </motion.div>

        {/* Sign In Link */}
        <motion.div variants={itemVariants} className="text-center">
          <p className="text-gray-400">
            Already have an account?{' '}
            <Link 
              href="/signin" 
              className="font-medium text-white hover:underline"
            >
              Sign in
            </Link>
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignUpPage;