import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../../redux/slices/authSlice';
import { useLoginMutation } from '../../redux/api/authApi';
import toast from 'react-hot-toast';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // RTK Query unwraps the payload or throws an error
      const response = await login({ email, password }).unwrap();
      
      dispatch(setCredentials({ user: response.user }));
      
      if (response.token) sessionStorage.setItem('sessionid', response.token);
      else sessionStorage.setItem('sessionid', 'true');
      
      toast.success('Logged in successfully!');
      navigate('/drive');
    } catch (err) {
      let errorMessage = 'Failed to login';
      if (err.data?.errors && err.data.errors.length > 0) {
        errorMessage = err.data.errors[0].message;
      } else if (err.data?.message) {
        errorMessage = err.data.message;
      }
      toast.error(errorMessage);
    }
  };

  return (
    <div className="w-full max-w-[420px] bg-white rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] p-10">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-azure-500 to-sky-400 flex items-center justify-center shadow-raised">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
          </div>
          <span className="font-display font-bold text-xl text-slate-900 tracking-tight">CloudVault</span>
        </div>
        <h1 className="font-display font-bold text-3xl tracking-tight text-slate-900">Welcome back</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block font-body text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Email</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-cloud-50/70 border-0 rounded-xl px-4 py-3.5 font-body text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-azure-500/30 focus:bg-white transition-all"
            placeholder="you@example.com"
            required
          />
        </div>
        <div>
          <label className="block font-body text-[11px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-cloud-50/70 border-0 rounded-xl px-4 py-3.5 font-body text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-azure-500/30 focus:bg-white transition-all"
            placeholder="••••••••"
            required
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading}
          className="w-full bg-azure-500 hover:bg-azure-600 active:scale-[0.98] text-white font-body font-medium text-[15px] px-5 py-3.5 rounded-full shadow-raised hover:shadow-raised-hover transition-all duration-200 mt-4"
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="mt-8 flex justify-center">
        <p className="font-body text-sm text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-azure-600 hover:text-azure-700 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginForm;
