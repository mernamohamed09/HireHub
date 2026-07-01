import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { toast } from 'react-toastify';
import { login, register as registerUser } from '../store/slices/authSlice';

export function LoginRegister() {
  const location = useLocation();
  const navigate = useNavigate();
  const isLogin = location.pathname === '/login';
  
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state) => state.auth);

  const schema = yup.object().shape({
    email: yup.string().email('Invalid email address').required('Email is required'),
    password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    ...( !isLogin && {
      role: yup.string().required('Role is required'),
      fullName: yup.string().required('Full name is required'),
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
      <section className="relative w-full md:w-1/2 mesh-gradient flex flex-col justify-between p-lg md:p-xl overflow-hidden">
        <div className="absolute inset-0 decorative-pattern opacity-30 pointer-events-none"></div>
        <div className="relative z-10">
          <Link to="/" className="flex items-center gap-sm">
            <div className="w-10 h-10 bg-tertiary rounded-lg flex items-center justify-center shadow-lg shadow-tertiary/20">
              <span className="material-symbols-outlined text-on-tertiary font-bold">hub</span>
            </div>
            <span className="font-h3 text-h3 text-on-surface tracking-tight">HireHub</span>
          </Link>
        </div>
        
        <div className="relative z-10 mt-xl md:mt-0">
          <h1 className="font-h1 text-h1 text-white max-w-md mb-md leading-tight">
            Your career bridge to the future.
          </h1>
          <p className="text-on-surface-variant text-body max-w-sm">
            Join thousands of professionals and top-tier companies finding their perfect match through our AI-driven recruitment ecosystem.
          </p>
          
          <div className="mt-xl hidden md:block">
            <div className="glass-panel p-md rounded-xl flex items-center gap-md border-primary/20 max-w-xs transition-transform hover:scale-105 duration-300">
              <div className="flex -space-x-2">
                <div className="w-8 h-8 rounded-full border-2 border-surface-container bg-surface-variant overflow-hidden"></div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container bg-surface-variant overflow-hidden"></div>
                <div className="w-8 h-8 rounded-full border-2 border-surface-container bg-surface-variant overflow-hidden"></div>
              </div>
              <span className="text-caption font-label-tag text-tertiary uppercase tracking-widest">+500 Jobs today</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 pt-xl">
          <p className="text-caption text-on-surface-variant italic opacity-60">
            "The fastest way to build a high-performing team."
          </p>
        </div>
      </section>

      {/* Right Section: Form */}
      <section className="w-full md:w-1/2 bg-on-background dark:bg-surface flex items-center justify-center p-gutter relative">
        <div className="w-full max-w-md">
          <div className="bg-surface-container-low p-xl rounded-xl border border-outline-variant/30 shadow-2xl relative z-10">
            {/* Tabs */}
            <div className="flex gap-lg mb-xl border-b border-outline-variant/20">
              <Link 
                to="/login"
                className={`pb-sm text-body font-bold transition-all relative ${isLogin ? 'text-tertiary border-b-2 border-tertiary' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Login
              </Link>
              <Link 
                to="/register"
                className={`pb-sm text-body font-bold transition-all relative ${!isLogin ? 'text-tertiary border-b-2 border-tertiary' : 'text-on-surface-variant hover:text-primary'}`}
              >
                Register
              </Link>
            </div>

            <div className="mb-xl">
              <h2 className="font-h2 text-h2 text-on-surface">
                {isLogin ? 'Welcome back' : 'Create an account'}
              </h2>
              <p className="text-on-surface-variant text-body mt-xs">
                {isLogin ? 'Enter your details to access your account.' : 'Get started with your professional journey.'}
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-md">
              
              {!isLogin && (
                <div className="grid grid-cols-2 gap-sm mb-lg">
                  <label className="cursor-pointer group">
                    <input 
                      {...register('role', { required: true })} 
                      type="radio" 
                      value="candidate" 
                      className="sr-only peer" 
                      defaultChecked
                    />
                    <div className="p-md rounded-lg border border-outline-variant bg-surface-container-high peer-checked:border-tertiary peer-checked:bg-tertiary-container/10 transition-all text-center">
                      <span className="material-symbols-outlined block mb-xs text-on-surface-variant peer-checked:text-tertiary">person</span>
                      <span className="text-label-tag text-on-surface uppercase">Candidate</span>
                    </div>
                  </label>
                  <label className="cursor-pointer group">
                    <input 
                      {...register('role', { required: true })} 
                      type="radio" 
                      value="company" 
                      className="sr-only peer" 
                    />
                    <div className="p-md rounded-lg border border-outline-variant bg-surface-container-high peer-checked:border-tertiary peer-checked:bg-tertiary-container/10 transition-all text-center">
                      <span className="material-symbols-outlined block mb-xs text-on-surface-variant peer-checked:text-tertiary">business</span>
                      <span className="text-label-tag text-on-surface uppercase">Company</span>
                    </div>
                  </label>
                </div>
              )}

              {!isLogin && (
                <div className="space-y-sm">
                  <label className="block text-caption text-on-surface-variant font-medium">Full Name</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">badge</span>
                    <input 
                      {...register('fullName')}
                      className={`w-full bg-surface-container border ${errors.fullName ? 'border-error focus:border-error' : 'border-outline-variant focus:border-tertiary'} rounded-lg pl-[44px] pr-md py-sm text-on-surface focus:ring-1 focus:ring-tertiary outline-none transition-all`} 
                      placeholder="Enter your name" 
                      type="text" 
                    />
                  </div>
                  {errors.fullName && <p className="text-error text-caption mt-1">{errors.fullName.message}</p>}
                </div>
              )}

              <div className="space-y-sm">
                <label className="block text-caption text-on-surface-variant font-medium">Email Address</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">mail</span>
                  <input 
                    {...register('email')}
                    className={`w-full bg-surface-container border ${errors.email ? 'border-error focus:border-error' : 'border-outline-variant focus:border-tertiary'} rounded-lg pl-[44px] pr-md py-sm text-on-surface focus:ring-1 focus:ring-tertiary outline-none transition-all`} 
                    placeholder="email@example.com" 
                    type="email" 
                  />
                </div>
                {errors.email && <p className="text-error text-caption mt-1">{errors.email.message}</p>}
              </div>

              <div className={`grid gap-md ${!isLogin ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
                <div className="space-y-sm">
                  <label className="block text-caption text-on-surface-variant font-medium">Password</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">lock</span>
                    <input 
                      {...register('password')}
                      className={`w-full bg-surface-container border ${errors.password ? 'border-error focus:border-error' : 'border-outline-variant focus:border-tertiary'} rounded-lg pl-[44px] pr-md py-sm text-on-surface focus:ring-1 focus:ring-tertiary outline-none transition-all`} 
                      placeholder="••••••••" 
                      type="password" 
                    />
                  </div>
                  {errors.password && <p className="text-error text-caption mt-1">{errors.password.message}</p>}
                </div>

                {!isLogin && (
                  <div className="space-y-sm">
                    <label className="block text-caption text-on-surface-variant font-medium">Confirm</label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-md top-1/2 -translate-y-1/2 text-outline text-[20px]">key</span>
                      <input 
                        {...register('confirmPassword')}
                        className={`w-full bg-surface-container border ${errors.confirmPassword ? 'border-error focus:border-error' : 'border-outline-variant focus:border-tertiary'} rounded-lg pl-[44px] pr-md py-sm text-on-surface focus:ring-1 focus:ring-tertiary outline-none transition-all`} 
                        placeholder="••••••••" 
                        type="password" 
                      />
                    </div>
                    {errors.confirmPassword && <p className="text-error text-caption mt-1">{errors.confirmPassword.message}</p>}
                  </div>
                )}
              </div>

              <button 
                className={`w-full bg-secondary-container hover:bg-secondary-container/80 text-on-secondary-container font-bold py-md rounded-lg mt-lg transition-transform ${isLoading ? 'opacity-70 cursor-not-allowed' : 'active:scale-[0.98]'} shadow-lg shadow-secondary-container/20`} 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-sm">
                    <span className="material-symbols-outlined animate-spin text-[20px]">progress_activity</span>
                    <span>Processing...</span>
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>

              <div className="relative flex items-center py-md">
                <div className="flex-grow border-t border-outline-variant/30"></div>
                <span className="flex-shrink mx-md text-caption text-outline uppercase tracking-widest">or continue with</span>
                <div className="flex-grow border-t border-outline-variant/30"></div>
              </div>

              <button 
                className="w-full flex items-center justify-center gap-sm bg-white text-surface p-md rounded-lg font-medium hover:bg-white/90 transition-colors" 
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

            <p className="mt-xl text-center text-caption text-on-surface-variant">
              By continuing, you agree to our <Link className="text-tertiary underline hover:text-tertiary-fixed transition-colors" to="/terms">Terms of Service</Link> and <Link className="text-tertiary underline hover:text-tertiary-fixed transition-colors" to="/privacy">Privacy Policy</Link>.
            </p>
          </div>
        </div>

        <div className="absolute bottom-md right-md opacity-10 pointer-events-none select-none">
          <span className="material-symbols-outlined text-[120px] text-primary">rocket_launch</span>
        </div>
      </section>
    </main>
  );
}
