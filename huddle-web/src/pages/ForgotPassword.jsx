import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('loading');
    try {
      await api.post('/auth/forgot-password', { email });
      setStatus('success');
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'Failed to send reset link');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      
      <div className="w-full max-w-md bg-gray-900/60 backdrop-blur-xl p-8 rounded-2xl border border-gray-800 shadow-2xl relative z-10">
        <Link to="/login" className="inline-flex items-center text-sm font-medium text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to login
        </Link>
        
        {status === 'success' ? (
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-500/20 mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-gray-400 mb-6">
              We sent a password reset link to <span className="font-medium text-gray-200">{email}</span>.
            </p>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white tracking-tight">Forgot password?</h1>
              <p className="text-gray-400 mt-2">No worries, we'll send you reset instructions.</p>
            </div>

            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-500" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-700 rounded-xl bg-gray-950/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={status === 'loading'}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 focus:ring-offset-gray-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? 'Sending...' : (
                  <>
                    Reset Password <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
