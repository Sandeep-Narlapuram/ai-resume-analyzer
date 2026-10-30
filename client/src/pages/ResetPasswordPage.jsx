import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, CheckCircle2, ShieldAlert } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import { authApi } from '../services/authApi.js';
import { passwordRules } from '../utils/validators.js';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  async function onSubmit({ password }) {
    try {
      await authApi.resetPassword({ token, password });
      setDone(true);
    } catch (err) {
      const message =
        err?.response?.data?.error?.message || 'This reset link is invalid or has expired.';
      setError('root', { message });
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <span className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-rose-500/15 text-rose-400 mb-5">
          <ShieldAlert className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-display font-semibold mb-2">Missing reset link</h1>
        <p className="text-sm text-ink_text-muted mb-8">
          This page needs a reset token from the link in your email. Request a new one below.
        </p>
        <Link to="/forgot-password">
          <Button variant="secondary" fullWidth>
            Request a new reset link
          </Button>
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="text-center">
        <span className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400 mb-5">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-display font-semibold mb-2">Password updated</h1>
        <p className="text-sm text-ink_text-muted mb-8">You can now log in with your new password.</p>
        <Button fullWidth onClick={() => navigate('/login')}>
          Go to login
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-display font-semibold">Set a new password</h1>
        <p className="text-sm text-ink_text-muted mt-1.5">Choose a strong password for your account</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
        {errors.root && (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">
            {errors.root.message}
          </div>
        )}

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-ink_text-primary mb-1.5">
            New password
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
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="••••••••"
            className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm focus:border-violet-400/60 focus:outline-none transition-colors"
            {...register('confirmPassword', {
              required: 'Please confirm your new password',
              validate: (value) => value === watch('password') || 'Passwords do not match',
            })}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs text-rose-400">{errors.confirmPassword.message}</p>
          )}
        </div>

        <Button type="submit" isLoading={isSubmitting} fullWidth>
          Update password
        </Button>
      </form>
    </div>
  );
}
