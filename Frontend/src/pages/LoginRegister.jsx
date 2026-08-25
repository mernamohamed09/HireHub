import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { login, register as registerUser } from '../store/slices/authSlice';
import { 
  Orbit, Briefcase, BadgeCheck, Mail, Lock, Key, Loader2, Rocket, 
  Search, Bell, Globe, Moon, FileText, Bot, Brain, Video, Award, BarChart, TrendingUp, User, ShieldCheck, Zap
} from 'lucide-react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Torus, MeshDistortMaterial, OrthographicCamera, OrbitControls } from '@react-three/drei';
import { BackgroundScene } from '../components/ui/BackgroundScene';

function VisionOSGyroscope() {
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();

  useFrame((state, delta) => {
    if (ring1.current) { ring1.current.rotation.x += delta * 0.2; ring1.current.rotation.y += delta * 0.1; }
    if (ring2.current) { ring2.current.rotation.x -= delta * 0.1; ring2.current.rotation.z += delta * 0.15; }
    if (ring3.current) { ring3.current.rotation.y += delta * 0.25; ring3.current.rotation.z -= delta * 0.05; }
  });

  return (
    <group>
      {/* Inner Ring hugging the video */}
      <Torus ref={ring1} args={[3.3, 0.02, 32, 100]}>
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.5} wireframe />
      </Torus>
      {/* Middle Ring */}
      <Torus ref={ring2} args={[3.5, 0.04, 32, 100]}>
         <MeshDistortMaterial color="#f59e0b" distort={0.1} speed={2} roughness={0.1} metalness={0.9} />
      </Torus>
      {/* Outer Ring */}
      <Torus ref={ring3} args={[3.7, 0.01, 32, 100]}>
         <meshStandardMaterial color="#0ea5e9" emissive="#0ea5e9" emissiveIntensity={0.8} />
      </Torus>
    </group>
  );
}

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
    "Assessing Skills...",
    "Matching Profiles...",
    "Scheduling...",
    "Analyzing Fit..."
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
    <main className="min-h-screen w-full bg-[#0A0F1A] text-slate-200 relative overflow-hidden flex flex-col md:flex-row">
      
      {/* Moving 3D Stars Background */}
      <BackgroundScene />

      {/* Top Navigation */}
      <nav className="absolute top-0 left-0 w-full p-8 flex justify-between items-center z-50 pointer-events-none">
        <div className="absolute top-12 left-12 z-20 flex items-center">
          <img src="/Logo.svg" alt="HireHub Logo" className="h-14 md:h-16 w-auto -ml-4 -mr-8 md:-mr-12 scale-125" />
          <span className="font-bold text-3xl text-white tracking-tight drop-shadow-md">HireHub</span>
        </div>
      </nav>

      {/* Left Section: Form Area */}
      <section className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-12 lg:p-24 relative z-20">
        <div className="w-full max-w-lg mt-16 md:mt-0 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 mb-6 backdrop-blur-md">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-bold tracking-widest uppercase">Executive Access</span>
            </div>
            <h1 className="font-bold text-4xl md:text-5xl text-white mb-4 tracking-tight drop-shadow-md">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h1>
            <p className="text-slate-400 font-medium">
              Join the elite network of tech professionals.
            </p>
          </div>

          <div className="glass-card-pro rounded-3xl p-8 relative overflow-hidden group">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50"></div>
            
            <div className="flex gap-8 mb-8 border-b border-white/5 relative">
              <Link 
                to="/login"
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${isLogin ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-slate-400 hover:text-white'}`}
              >
                Login
                {isLogin && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-400 rounded-t-full shadow-[0_-2px_10px_rgba(16,185,129,1)]"></div>}
              </Link>
              <Link 
                to="/register"
                className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative ${!isLogin ? 'text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-slate-400 hover:text-white'}`}
              >
                Register
                {!isLogin && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-emerald-400 rounded-t-full shadow-[0_-2px_10px_rgba(16,185,129,1)]"></div>}
              </Link>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <label className="cursor-pointer group/role">
                    <input {...register('role', { required: true })} type="radio" value="candidate" className="sr-only peer" />
                    <div className="p-4 rounded-2xl border border-white/5 bg-black/20 peer-checked:border-emerald-500/50 peer-checked:bg-emerald-500/10 transition-all text-center group-hover/role:border-white/10">
                      <User className="mx-auto mb-2 text-slate-500 peer-checked:text-emerald-400 transition-colors" size={20} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider peer-checked:text-emerald-400">Candidate</span>
                    </div>
                  </label>
                  <label className="cursor-pointer group/role">
                    <input {...register('role', { required: true })} type="radio" value="company" className="sr-only peer" />
                    <div className="p-4 rounded-2xl border border-white/5 bg-black/20 peer-checked:border-amber-500/50 peer-checked:bg-amber-500/10 transition-all text-center group-hover/role:border-white/10">
                      <Briefcase className="mx-auto mb-2 text-slate-500 peer-checked:text-amber-400 transition-colors" size={20} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider peer-checked:text-amber-400">Company</span>
                    </div>
                  </label>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Name</label>
                  <input 
                    {...register('name')}
                    className={`w-full bg-black/30 border ${errors.name ? 'border-red-500/50' : 'border-white/5'} rounded-xl px-4 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all placeholder-white/20`} 
                    placeholder="John Doe" type="text" 
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Email Address</label>
                <input 
                  {...register('email')}
                  className={`w-full bg-black/30 border ${errors.email ? 'border-red-500/50' : 'border-white/5'} rounded-xl px-4 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all placeholder-white/20`} 
                  placeholder="name@example.com" type="email" 
                />
              </div>

              <div className={`grid gap-5 ${!isLogin ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Password</label>
                  <input 
                    {...register('password')}
                    className={`w-full bg-black/30 border ${errors.password ? 'border-red-500/50' : 'border-white/5'} rounded-xl px-4 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all placeholder-white/20`} 
                    placeholder="••••••••" type="password" 
                  />
                </div>

                {!isLogin && (
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1">Confirm</label>
                    <input 
                      {...register('confirmPassword')}
                      className={`w-full bg-black/30 border ${errors.confirmPassword ? 'border-red-500/50' : 'border-white/5'} rounded-xl px-4 py-3.5 text-white focus:border-emerald-500/50 outline-none transition-all placeholder-white/20`} 
                      placeholder="••••••••" type="password" 
                    />
                  </div>
                )}
              </div>

              <button 
                className="w-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold hover:bg-emerald-500/20 hover:text-white py-3.5 rounded-xl mt-6 hover:bg-emerald-400 transition-colors shadow-none disabled:opacity-50" 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="animate-spin" size={16} />
                    <span>Processing...</span>
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              By continuing, you agree to our <Link className="text-amber-500 hover:text-amber-400 transition-colors" to="/terms">Terms</Link> and <Link className="text-amber-500 hover:text-amber-400 transition-colors" to="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </section>

      {/* Right Section: Visual Assets (3D Canvas & Badges) */}
      <section className="hidden md:flex w-full md:w-1/2 p-12 items-center justify-center relative z-10">
        
        {/* Layer 1: The 3D Gyroscope (Rendered BEHIND the video) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] z-10 flex items-center justify-center">
          <Canvas className="w-full h-full cursor-grab active:cursor-grabbing">
            <OrthographicCamera makeDefault position={[0, 0, 100]} zoom={100} />
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 5]} intensity={2} color="#10b981" />
            <directionalLight position={[-10, -10, -5]} intensity={2} color="#f59e0b" />
            
            <OrbitControls 
              enableZoom={false}
              enablePan={false}
              enableRotate={true}
              minAzimuthAngle={-Math.PI / 4}
              maxAzimuthAngle={Math.PI / 4}
              minPolarAngle={Math.PI / 3}
              maxPolarAngle={2 * Math.PI / 3}
            />
            <VisionOSGyroscope />
          </Canvas>
        </div>

        {/* Orbiting Icons - Centering Wrapper */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] z-10 pointer-events-none">
          <div className="w-full h-full rounded-full border border-white/5 animate-orbit">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-xl border border-emerald-500/30 rounded-full flex items-center justify-center shadow-lg animate-orbit" style={{ animationDirection: 'reverse' }}><FileText className="text-emerald-400 w-5 h-5" /></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-xl border border-amber-500/30 rounded-full flex items-center justify-center shadow-lg animate-orbit" style={{ animationDirection: 'reverse' }}><Bot className="text-amber-400 w-5 h-5" /></div>
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-xl border border-emerald-500/30 rounded-full flex items-center justify-center shadow-lg animate-orbit" style={{ animationDirection: 'reverse' }}><Briefcase className="text-emerald-400 w-5 h-5" /></div>
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-black/40 backdrop-blur-xl border border-amber-500/30 rounded-full flex items-center justify-center shadow-lg animate-orbit" style={{ animationDirection: 'reverse' }}><Brain className="text-white w-5 h-5" /></div>
            <div className="absolute top-1/4 left-4 w-12 h-12 bg-black/40 backdrop-blur-xl border border-emerald-500/30 rounded-full flex items-center justify-center shadow-lg animate-orbit" style={{ animationDirection: 'reverse' }}><Video className="text-emerald-400 w-5 h-5" /></div>
            <div className="absolute bottom-1/4 right-4 w-12 h-12 bg-black/40 backdrop-blur-xl border border-amber-500/30 rounded-full flex items-center justify-center shadow-lg animate-orbit" style={{ animationDirection: 'reverse' }}><Award className="text-amber-400 w-5 h-5" /></div>
          </div>
        </div>

        {/* Layer 2: The Circular Video */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20 w-[500px] h-[500px] rounded-full overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] border-[3px] border-white/5 bg-[#0B111A] pointer-events-none">
          <video autoPlay loop muted playsInline draggable="false" className="absolute inset-0 w-full h-full object-cover mix-blend-screen pointer-events-none select-none z-10">
            <source src="/bg_video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[#0B111A]/20 z-20" />
        </div>

        {/* Layer 3: Floating UI Badges exactly matching screenshot */}
        
        {/* Top Right LIVE AI Badge */}
        <div className="absolute top-[10%] right-[15%] z-30 bg-black/60 backdrop-blur-md border border-white/10 rounded-full px-4 py-2 flex items-center gap-3 pointer-events-none animate-float">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.3)]"></div>
          <span className="text-[10px] font-bold text-white uppercase tracking-widest">LIVE AI</span>
          <span className="text-white/20">|</span>
          <span className="text-xs font-bold text-emerald-400 min-w-[120px]">{aiStatuses[aiStatusIdx]}</span>
        </div>

        {/* Far Right ATS ENGINE Badge */}
        <div className="absolute top-[25%] right-[-5%] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-2xl z-30 pointer-events-none animate-float" style={{ animationDelay: '1s' }}>
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <ShieldCheck size={16} />
          </div>
          <div>
            <div className="text-[8px] uppercase tracking-wider text-slate-500">ATS Engine</div>
            <div className="text-xs font-bold text-white">Smart Profile Scoring</div>
          </div>
        </div>

        {/* Bottom Left HIREHUB NETWORK Badge */}
        <div className="absolute bottom-[20%] left-[5%] bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-4 flex items-center gap-4 shadow-2xl z-30 pointer-events-none animate-float" style={{ animationDelay: '2s' }}>
          <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Zap size={16} />
          </div>
          <div>
            <div className="text-[8px] uppercase tracking-wider text-slate-500">HireHub Network</div>
            <div className="text-xs font-bold text-white">Seamless Recruitment</div>
          </div>
        </div>

      </section>
    </main>
  );
}