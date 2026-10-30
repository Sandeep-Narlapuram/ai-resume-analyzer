import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { emailPattern, nameRules, passwordRules } from '../utils/validators.js';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  async function onSubmit(values) {
    try {
      const { confirmPassword, agree, ...payload } = values;
      await registerUser(payload);
      toast.success('Account created — welcome to ScoreMyResume!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const message = err?.response?.data?.error?.message || 'Could not create account. Try again.';
      setError('root', { message });
    }
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-display font-semibold">Create your account</h1>
        <p className="text-sm text-ink_text-muted mt-1.5">Start with 5 free analyses every day</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {errors.root && (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {errors.root.message}
          </div>
        )}

        <div>
          <label htmlFor="name" className="block text-sm font-medium text-ink_text-primary mb-1.5">
            Full name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Priya Sharma"
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm focus:border-violet-400/60 focus:outline-none transition-colors"
            {...register('name', nameRules)}
          />
          {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name.message}</p>}
        </div>

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
          <label htmlFor="password" className="block text-sm font-medium text-ink_text-primary mb-1.5">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              placeholder="••••••••"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 pr-11 text-sm focus:border-violet-400/60 focus:outline-none transition-colors"
              {...register('password', passwordRules)}
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

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-ink_text-primary mb-1.5">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm focus:border-violet-400/60 focus:outline-none transition-colors"
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (value) => value === watch('password') || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        <label className="flex items-start gap-2.5 text-xs text-ink_text-muted">
          <input
            type="checkbox"
            className="mt-0.5 rounded border-white/20 bg-white/[0.04] text-violet-500 focus:ring-violet-500"
            {...register('agree', { required: 'You must accept the terms to continue' })}
          />
          I agree to the Terms of Service and Privacy Policy
        </label>
        {errors.agree && <p className="-mt-3 text-xs text-rose-400">{errors.agree.message}</p>}

        <Button type="submit" isLoading={isSubmitting} icon={UserPlus} iconPosition="right" fullWidth>
          Create account
        </Button>
      </form>

      <p className="text-center text-sm text-ink_text-muted mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-violet-400 hover:text-violet-300 font-medium">
          Log in
        </Link>
      </p>
    </div>
  );
}
