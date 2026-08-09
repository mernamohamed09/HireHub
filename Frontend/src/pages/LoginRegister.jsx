import { useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { login, register as registerUser } from '../store/slices/authSlice';
import { Orbit, User, Briefcase, BadgeCheck, Mail, Lock, Key, Loader2, Rocket } from 'lucide-react';

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

  const schema = yup.object().shape({
    email: yup.string().email('Invalid email address').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    ...(!isLogin && {
      role: yup.string().required('Role is required'),
      name: yup.string().required('Name is required'), // تم التعديل من fullName إلى name
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
    <main className="flex min-h-screen w-full flex-col md:flex-row bg-background">
      {/* Left Section: Brand & Atmosphere */}
      <section className="relative w-full md:w-1/2 flex flex-col justify-between p-8 md:p-12 overflow-hidden border-r border-white/10">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-background via-surface-container to-background z-0"></div>
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-neon-purple/20 blur-[120px] rounded-full pointer-events-none z-0 translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-neon-cyan/20 blur-[120px] rounded-full pointer-events-none z-0 -translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none z-0 mix-blend-overlay"></div>
        
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-neon-purple to-neon-cyan rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(188,19,254,0.4)]">
              <Orbit className="text-white w-7 h-7" />
            </div>
            <span className="font-bold text-3xl text-white tracking-tight">HireHub</span>
          </Link>
        </div>
        
        <div className="relative z-10 mt-12 md:mt-0">
          <h1 className="font-bold text-5xl text-white max-w-md mb-6 leading-tight">
            Your career bridge to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">future.</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-sm leading-relaxed">
            Join thousands of professionals and top-tier companies finding their perfect match through our AI-driven recruitment ecosystem.
          </p>
          
          <div className="mt-12 hidden md:block">
            <div className="glass-panel p-4 rounded-2xl flex items-center gap-4 border-neon-cyan/20 max-w-xs transition-transform hover:scale-105 duration-300 shadow-glow-cyan bg-neon-cyan/5">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-background bg-surface-container overflow-hidden"></div>
                <div className="w-10 h-10 rounded-full border-2 border-background bg-surface-container overflow-hidden"></div>
                <div className="w-10 h-10 rounded-full border-2 border-background bg-neon-purple flex items-center justify-center text-[10px] font-bold text-white shadow-glow-purple">+500</div>
              </div>
              <span className="text-xs font-bold text-neon-cyan uppercase tracking-widest">Jobs today</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 pt-12">
          <p className="text-sm font-medium text-on-surface-variant italic opacity-80">
            "The fastest way to build a high-performing team."
          </p>
        </div>
      </section>

      {/* Right Section: Form */}
      <section className="w-full md:w-1/2 bg-background flex items-center justify-center p-6 relative overflow-hidden">
        <div className="w-full max-w-md relative z-10">
          <div className="glass-card p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neon-pink/10 blur-[40px] rounded-full pointer-events-none"></div>
            
            {/* Tabs */}
            <div className="flex gap-8 mb-10 border-b border-white/10">
              <Link 
                to="/login"
                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all relative ${isLogin ? 'text-neon-cyan border-b-2 border-neon-cyan drop-shadow-[0_0_8px_rgba(0,255,255,0.8)]' : 'text-on-surface-variant hover:text-white'}`}
              >
                Login
              </Link>
              <Link 
                to="/register"
                className={`pb-3 text-sm font-bold uppercase tracking-wider transition-all relative ${!isLogin ? 'text-neon-purple border-b-2 border-neon-purple drop-shadow-[0_0_8px_rgba(188,19,254,0.8)]' : 'text-on-surface-variant hover:text-white'}`}
              >
                Register
              </Link>
            </div>

            <div className="mb-8">
              <h2 className="font-bold text-3xl text-white">
                {isLogin ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-on-surface-variant text-sm mt-2 font-medium">
                {isLogin ? 'Enter your details to access your account.' : 'Get started with your professional journey.'}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {!isLogin && (
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <label className="cursor-pointer group">
                    <input 
                      {...register('role', { required: true })} 
                      type="radio" 
                      value="candidate" 
                      className="sr-only peer" 
                      defaultChecked
                    />
                    <div className="p-4 rounded-xl border border-white/10 bg-surface-container/50 peer-checked:border-neon-cyan peer-checked:bg-neon-cyan/10 peer-checked:shadow-glow-cyan transition-all text-center group-hover:border-white/30">
                      <User className="mx-auto mb-2 text-on-surface-variant peer-checked:text-neon-cyan transition-colors" size={24} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider peer-checked:text-neon-cyan transition-colors">Candidate</span>
                    </div>
                  </label>
                  <label className="cursor-pointer group">
                    <input 
                      {...register('role', { required: true })} 
                      type="radio" 
                      value="company" 
                      className="sr-only peer" 
                    />
                    <div className="p-4 rounded-xl border border-white/10 bg-surface-container/50 peer-checked:border-neon-purple peer-checked:bg-neon-purple/10 peer-checked:shadow-glow-purple transition-all text-center group-hover:border-white/30">
                      <Briefcase className="mx-auto mb-2 text-on-surface-variant peer-checked:text-neon-purple transition-colors" size={24} />
                      <span className="text-[10px] font-bold text-white uppercase tracking-wider peer-checked:text-neon-purple transition-colors">Company</span>
                    </div>
                  </label>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Name</label>
                  <div className="relative group">
                    <BadgeCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-neon-cyan transition-colors" size={20} />
                    <input 
                      {...register('name')}
                      className={`w-full bg-surface-container/50 border ${errors.name ? 'border-neon-pink focus:border-neon-pink focus:ring-neon-pink' : 'border-white/10 focus:border-neon-cyan focus:ring-neon-cyan'} rounded-xl pl-12 pr-4 py-3 text-white focus:ring-1 outline-none transition-all placeholder-white/20`} 
                      placeholder="Enter your name" 
                      type="text" 
                    />
                  </div>
                  {errors.name && <p className="text-neon-pink text-[10px] font-bold uppercase tracking-wider mt-1">{errors.name.message}</p>}
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-neon-cyan transition-colors" size={20} />
                  <input 
                    {...register('email')}
                    className={`w-full bg-surface-container/50 border ${errors.email ? 'border-neon-pink focus:border-neon-pink focus:ring-neon-pink' : 'border-white/10 focus:border-neon-cyan focus:ring-neon-cyan'} rounded-xl pl-12 pr-4 py-3 text-white focus:ring-1 outline-none transition-all placeholder-white/20`} 
                    placeholder="email@example.com" 
                    type="email" 
                  />
                </div>
                {errors.email && <p className="text-neon-pink text-[10px] font-bold uppercase tracking-wider mt-1">{errors.email.message}</p>}
              </div>

              <div className={`grid gap-6 ${!isLogin ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Password</label>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-neon-purple transition-colors" size={20} />
                    <input 
                      {...register('password')}
                      className={`w-full bg-surface-container/50 border ${errors.password ? 'border-neon-pink focus:border-neon-pink focus:ring-neon-pink' : 'border-white/10 focus:border-neon-purple focus:ring-neon-purple'} rounded-xl pl-12 pr-4 py-3 text-white focus:ring-1 outline-none transition-all placeholder-white/20`} 
                      placeholder="••••••••" 
                      type="password" 
                    />
                  </div>
                  {errors.password && <p className="text-neon-pink text-[10px] font-bold uppercase tracking-wider mt-1">{errors.password.message}</p>}
                </div>

                {!isLogin && (
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-on-surface-variant uppercase tracking-wider">Confirm</label>
                    <div className="relative group">
                      <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-neon-purple transition-colors" size={20} />
                      <input 
                        {...register('confirmPassword')}
                        className={`w-full bg-surface-container/50 border ${errors.confirmPassword ? 'border-neon-pink focus:border-neon-pink focus:ring-neon-pink' : 'border-white/10 focus:border-neon-purple focus:ring-neon-purple'} rounded-xl pl-12 pr-4 py-3 text-white focus:ring-1 outline-none transition-all placeholder-white/20`} 
                        placeholder="••••••••" 
                        type="password" 
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-neon-pink text-[10px] font-bold uppercase tracking-wider mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                )}
              </div>

              <button 
                className={`w-full bg-gradient-to-r ${isLogin ? 'from-neon-cyan to-neon-purple shadow-[0_0_20px_rgba(0,255,255,0.3)]' : 'from-neon-purple to-neon-cyan shadow-[0_0_20px_rgba(188,19,254,0.3)]'} text-white font-bold py-4 rounded-xl mt-8 uppercase tracking-widest text-xs border-none hover:opacity-90 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'}`} 
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

              <div className="relative flex items-center py-6">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-[10px] font-bold text-white/40 uppercase tracking-widest">or continue with</span>
                <div className="flex-grow border-t border-white/10"></div>
              </div>

              <button 
                className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white p-4 rounded-xl font-bold hover:bg-white/10 transition-all" 
                type="button"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Google
              </button>
            </form>

            <p className="mt-8 text-center text-[10px] font-bold text-on-surface-variant uppercase tracking-wider leading-relaxed">
              By continuing, you agree to our <Link className="text-neon-cyan hover:text-white transition-colors underline" to="/terms">Terms of Service</Link> and <Link className="text-neon-cyan hover:text-white transition-colors underline" to="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        <div className="absolute bottom-8 right-8 opacity-10 pointer-events-none select-none">
          <Rocket className="text-white w-32 h-32" />
        </div>
      </section>
    </main>
  );
}