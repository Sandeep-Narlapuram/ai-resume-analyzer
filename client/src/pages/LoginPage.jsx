import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { emailPattern } from '../utils/validators.js';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const redirectTo = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  async function onSubmit(values) {
    try {
      await login(values);
      toast.success('Welcome back!');
      navigate(redirectTo, { replace: true });
    } catch (err) {
      const message = err?.response?.data?.error?.message || 'Invalid email or password';
      setError('root', { message });
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-display font-semibold">Welcome back</h1>
        <p className="text-sm text-ink_text-muted mt-1.5">Log in to continue analyzing your resume</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {errors.root && (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {errors.root.message}
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-ink_text-primary mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm focus:border-violet-400/60 focus:outline-none transition-colors"
            {...register('email', { required: 'Email is required', pattern: emailPattern })}
          />
          {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="password" className="block text-sm font-medium text-ink_text-primary">
              Password
            </label>
            <Link to="/forgot-password" className="text-xs text-violet-400 hover:text-violet-300">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 pr-11 text-sm focus:border-violet-400/60 focus:outline-none transition-colors"
              {...register('password', { required: 'Password is required' })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-ink_text-faint hover:text-ink_text-primary"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-rose-400">{errors.password.message}</p>}
        </div>

        <Button type="submit" isLoading={isSubmitting} icon={LogIn} iconPosition="right" fullWidth>
          Log in
        </Button>
      </form>

      <p className="text-center text-sm text-ink_text-muted mt-6">
        Don't have an account?{' '}
        <Link to="/register" className="text-violet-400 hover:text-violet-300 font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}
