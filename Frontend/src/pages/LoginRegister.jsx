import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { login, register as registerUser } from '../store/slices/authSlice';
import { 
  Orbit, Briefcase, BadgeCheck, Mail, Lock, Key, Loader2, Rocket, 
  Search, Bell, Globe, Moon, FileText, Bot, Brain, Video, Award, BarChart, TrendingUp, User
} from 'lucide-react';

export function LoginRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === '/login';
  
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated, user } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated && user) {
      const role = user.role?.toLowerCase();
      if (role === 'candidate') {
        navigate('/candidate/dashboard', { replace: true });
      } else if (role === 'company') {
        navigate('/company/dashboard', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const [aiStatusIdx, setAiStatusIdx] = useState(0);
  const aiStatuses = [
    "Resume Parsing...",
    "Matching Candidates...",
    "Interview Scheduling...",
    "Assessment Ready...",
    "Analyzing Skills..."
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setAiStatusIdx(prev => (prev + 1) % aiStatuses.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const schema = yup.object().shape({
    email: yup.string().email('Invalid email address').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    ...(!isLogin && {
      role: yup.string().required('Role is required'),
      name: yup.string().required('Name is required'),
      confirmPassword: yup.string().oneOf([yup.ref('password'), null], 'Passwords must match').required('Confirm Password is required'),
    })
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      let resultAction;
      if (isLogin) {
        resultAction = await dispatch(login({ email: data.email, password: data.password }));
      } else {
        resultAction = await dispatch(registerUser(data));
      }
      
      if (resultAction.error) {
        toast.error(resultAction.payload || 'Authentication failed');
        return;
      }

      toast.success(isLogin ? 'Logged in successfully!' : 'Account created successfully!');
      
      const role = resultAction.payload.user.role.toLowerCase();
      if (role === 'candidate') {
        navigate('/candidate/dashboard');
      } else if (role === 'company') {
        navigate('/company/dashboard');
      } else {
        navigate('/admin/dashboard');
      }
    } catch {
      toast.error('An unexpected error occurred');
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-col md:flex-row bg-background relative overflow-hidden animate-fade-in">
      
      {/* Global Background & Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
        {/* Tiny stars/noise */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/noise-pattern-with-subtle-cross-lines.png')] opacity-[0.03]"></div>
        {/* Grid lines opacity 2% */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Radial lights */}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-neon-purple/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-neon-cyan/10 blur-[150px] rounded-full"></div>
      </div>

      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 w-full p-6 flex justify-between items-center z-50 pointer-events-none animate-slide-up">
        <div className="flex items-center gap-3 ml-4">
          <div className="w-10 h-10 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(188,19,254,0.6)] border border-white/20">
            <Orbit className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-2xl text-white tracking-tight drop-shadow-md">HireHub</span>
        </div>
      </nav>

      {/* Left Section: Form & Hero Text */}
      <section className="w-full md:w-1/2 flex flex-col items-center justify-center p-6 md:p-12 relative z-20 overflow-y-auto">
        <div className="w-full max-w-lg relative z-20 mt-24 md:mt-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          
          <div className="mb-10 text-center md:text-left">
            <h1 className="font-bold text-5xl md:text-6xl text-white mb-6 leading-tight drop-shadow-lg">
              Your career bridge<br/>to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-purple via-neon-cyan to-neon-pink bg-[length:200%_auto] animate-gradient">future.</span>
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-lg mx-auto md:mx-0 font-medium tracking-wide">
              Join thousands of professionals and top-tier companies finding their perfect match through our advanced AI-driven ecosystem.
            </p>
          </div>

          <div className="glass-card p-10 rounded-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.2)] bg-surface-container/40 backdrop-blur-2xl relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-50"></div>
            
            <div className="flex gap-8 mb-10 border-b border-white/10 relative">
              <Link 
                to="/login"
                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all relative ${isLogin ? 'text-neon-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]' : 'text-on-surface-variant hover:text-white'}`}
              >
                Login
                {isLogin && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-neon-cyan shadow-glow-cyan"></div>}
              </Link>
              <Link 
                to="/register"
                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all relative ${!isLogin ? 'text-neon-purple drop-shadow-[0_0_8px_rgba(188,19,254,0.8)]' : 'text-on-surface-variant hover:text-white'}`}
              >
                Register
                {!isLogin && <div className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-neon-purple shadow-glow-purple"></div>}
              </Link>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <label className="cursor-pointer group/role">
                    <input {...register('role', { required: true })} type="radio" value="candidate" className="sr-only peer" />
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 peer-checked:border-neon-cyan peer-checked:bg-neon-cyan/10 peer-checked:shadow-glow-cyan transition-all text-center group-hover/role:border-white/30 backdrop-blur-md">
                      <User className="mx-auto mb-2 text-on-surface-variant peer-checked:text-neon-cyan transition-colors" size={24} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider peer-checked:text-neon-cyan transition-colors">Candidate</span>
                    </div>
                  </label>
                  <label className="cursor-pointer group/role">
                    <input {...register('role', { required: true })} type="radio" value="company" className="sr-only peer" />
                    <div className="p-4 rounded-2xl border border-white/10 bg-white/5 peer-checked:border-neon-purple peer-checked:bg-neon-purple/10 peer-checked:shadow-glow-purple transition-all text-center group-hover/role:border-white/30 backdrop-blur-md">
                      <Briefcase className="mx-auto mb-2 text-on-surface-variant peer-checked:text-neon-purple transition-colors" size={24} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider peer-checked:text-neon-purple transition-colors">Company</span>
                    </div>
                  </label>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white/80 uppercase tracking-wider ml-1">Name</label>
                  <div className="relative group/input">
                    <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-neon-cyan transition-colors z-10 pointer-events-none" size={20} />
                    <input 
                      {...register('name')}
                      className={`w-full bg-white/10 backdrop-blur-md border ${errors.name ? 'border-neon-pink' : 'border-white/10'} rounded-2xl pl-12 pr-4 py-4 text-white focus:border-neon-cyan focus:shadow-glow-cyan outline-none transition-all placeholder-white/30 shadow-inner`} 
                      placeholder="Enter your name" type="text" 
                    />
                  </div>
                  {errors.name && <p className="text-neon-pink text-[10px] font-bold uppercase tracking-wider ml-1">{errors.name.message}</p>}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-white/80 uppercase tracking-wider ml-1">Email Address</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-neon-cyan transition-colors z-10 pointer-events-none" size={20} />
                  <input 
                    {...register('email')}
                    className={`w-full bg-white/10 backdrop-blur-md border ${errors.email ? 'border-neon-pink' : 'border-white/10'} rounded-2xl pl-12 pr-4 py-4 text-white focus:border-neon-cyan focus:shadow-glow-cyan outline-none transition-all placeholder-white/30 shadow-inner`} 
                    placeholder="name@example.com" type="email" 
                  />
                </div>
                {errors.email && <p className="text-neon-pink text-[10px] font-bold uppercase tracking-wider ml-1">{errors.email.message}</p>}
              </div>

              <div className={`grid gap-5 ${!isLogin ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-white/80 uppercase tracking-wider ml-1">Password</label>
                  <div className="relative group/input">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-neon-purple transition-colors z-10 pointer-events-none" size={20} />
                    <input 
                      {...register('password')}
                      className={`w-full bg-white/10 backdrop-blur-md border ${errors.password ? 'border-neon-pink' : 'border-white/10'} rounded-2xl pl-12 pr-4 py-4 text-white focus:border-neon-purple focus:shadow-glow-purple outline-none transition-all placeholder-white/30 shadow-inner`} 
                      placeholder="••••••••" type="password" 
                    />
                  </div>
                  {errors.password && <p className="text-neon-pink text-[10px] font-bold uppercase tracking-wider ml-1">{errors.password.message}</p>}
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-white/80 uppercase tracking-wider ml-1">Confirm</label>
                    <div className="relative group/input">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within/input:text-neon-purple transition-colors z-10 pointer-events-none" size={20} />
                      <input 
                        {...register('confirmPassword')}
                        className={`w-full bg-white/10 backdrop-blur-md border ${errors.confirmPassword ? 'border-neon-pink' : 'border-white/10'} rounded-2xl pl-12 pr-4 py-4 text-white focus:border-neon-purple focus:shadow-glow-purple outline-none transition-all placeholder-white/30 shadow-inner`} 
                        placeholder="••••••••" type="password" 
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-neon-pink text-[10px] font-bold uppercase tracking-wider ml-1">{errors.confirmPassword.message}</p>}
                  </div>
                )}
              </div>

              <button 
                className={`w-full bg-gradient-to-r from-neon-cyan via-neon-purple to-neon-pink bg-[length:200%_auto] animate-gradient text-white font-bold py-5 rounded-2xl mt-8 uppercase tracking-widest text-sm border border-white/20 hover:opacity-90 shadow-[0_0_30px_rgba(188,19,254,0.5)] transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`} 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={20} />
                    <span>Processing...</span>
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-[10px] font-bold text-white/50 uppercase tracking-wider leading-relaxed">
              By continuing, you agree to our <Link className="text-neon-cyan hover:text-white transition-colors underline" to="/terms">Terms</Link> and <Link className="text-neon-cyan hover:text-white transition-colors underline" to="/privacy">Privacy</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Right Section: VisionOS Style Video & AI */}
      <section className="hidden md:flex w-full md:w-1/2 p-12 items-center justify-center relative z-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        
        {/* Animated Background Aura for AI Effect */}
        <div className="absolute inset-0 z-0 flex items-center justify-center opacity-40 mix-blend-screen pointer-events-none">
           <div className="w-[600px] h-[600px] bg-neon-purple rounded-full blur-[150px] animate-pulse"></div>
           <div className="w-[400px] h-[400px] bg-neon-cyan rounded-full blur-[120px] absolute mix-blend-overlay"></div>
        </div>

        {/* Orbiting Icons */}
        <div className="absolute w-[700px] h-[700px] z-10 animate-orbit pointer-events-none rounded-full border border-white/5">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-surface-container/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-lg animate-orbit" style={{ animationDirection: 'reverse' }}><FileText className="text-neon-cyan w-5 h-5" /></div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 bg-surface-container/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-lg animate-orbit" style={{ animationDirection: 'reverse' }}><Bot className="text-neon-purple w-5 h-5" /></div>
          <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-surface-container/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-lg animate-orbit" style={{ animationDirection: 'reverse' }}><Briefcase className="text-neon-pink w-5 h-5" /></div>
          <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-surface-container/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-lg animate-orbit" style={{ animationDirection: 'reverse' }}><Brain className="text-white w-5 h-5" /></div>
          <div className="absolute top-1/4 left-4 w-12 h-12 bg-surface-container/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-lg animate-orbit" style={{ animationDirection: 'reverse' }}><Video className="text-neon-cyan w-5 h-5" /></div>
          <div className="absolute bottom-1/4 right-4 w-12 h-12 bg-surface-container/80 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center shadow-lg animate-orbit" style={{ animationDirection: 'reverse' }}><Award className="text-neon-purple w-5 h-5" /></div>
        </div>

        {/* Floating Stats Card */}
        <div className="absolute top-20 right-20 z-30 bg-surface-container/60 backdrop-blur-2xl border border-white/20 rounded-2xl p-5 shadow-[0_20px_40px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.3)] flex items-center gap-4 animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-purple to-neon-cyan flex items-center justify-center shadow-glow-cyan">
             <TrendingUp className="text-white w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white tracking-tight">500+</div>
            <div className="text-[10px] font-bold text-white/60 uppercase tracking-widest">Jobs Posted Today</div>
            <div className="text-[10px] font-bold text-neon-mint mt-1">▲ 12% this week</div>
          </div>
        </div>

        {/* LIVE AI Indicator */}
        <div className="absolute top-[18%] left-1/2 -translate-x-1/2 z-30 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-5 py-2 flex items-center gap-3 shadow-lg animate-float">
          <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse shadow-glow-cyan"></div>
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">LIVE AI</span>
          <span className="text-white/40">|</span>
          <span className="text-xs font-bold text-neon-cyan min-w-[150px]">{aiStatuses[aiStatusIdx]}</span>
        </div>

        <div className="relative z-20 animate-float w-[500px] h-[500px]">
          {/* Main Video Glass Container */}
          <div className="absolute inset-0 rounded-[32px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.6),inset_0_2px_4px_rgba(255,255,255,0.2)] border-2 border-white/10 bg-white/5 backdrop-blur-xl">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-80 z-30"></div>
            
            <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover z-0">
              <source src="/bg_video.mp4" type="video/mp4" />
            </video>
            
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background/90 z-10 pointer-events-none"></div>
          </div>

          {/* Flow Text */}
          <div className="absolute top-[calc(100%+120px)] left-1/2 -translate-x-1/2 w-[500px] text-center flex flex-col items-center bg-surface-container/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 shadow-lg">
            <h3 className="text-white font-bold text-lg mb-4 drop-shadow-md">AI Hiring Flow</h3>
            <div className="flex items-center justify-center gap-2 text-xs text-white/80 font-bold uppercase tracking-wider flex-wrap">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">Resume</span>
              <span className="text-neon-cyan">↓</span>
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">Analysis</span>
              <span className="text-neon-cyan">↓</span>
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">Matching</span>
              <span className="text-neon-cyan">↓</span>
              <span className="px-3 py-1 rounded-full bg-neon-purple/30 backdrop-blur-md border border-neon-purple/50 shadow-glow-purple text-white">Hiring</span>
            </div>
          </div>
        </div>

      </section>
    </main>
  );
}