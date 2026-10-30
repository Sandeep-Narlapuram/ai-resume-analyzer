import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Button from '../components/common/Button.jsx';
import { authApi } from '../services/authApi.js';
import { emailPattern } from '../utils/validators.js';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
    setError,
  } = useForm();

  async function onSubmit(values) {
    try {
      await authApi.forgotPassword(values);
      setSent(true);
    } catch {
      setError('root', { message: 'Something went wrong. Please try again.' });
    }
  }

  if (sent) {
    return (
      <div className="text-center">
        <span className="grid h-14 w-14 mx-auto place-items-center rounded-2xl bg-emerald-500/15 text-emerald-400 mb-5">
          <CheckCircle2 className="h-7 w-7" />
        </span>
        <h1 className="text-2xl font-display font-semibold mb-2">Check your email</h1>
        <p className="text-sm text-ink_text-muted mb-8">
          If an account exists for <span className="text-ink_text-primary">{getValues('email')}</span>, we've
          sent a link to reset your password.
        </p>
        <Link to="/login">
          <Button variant="secondary" icon={ArrowLeft} fullWidth>
            Back to log in
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="text-center mb-8">
        <h1 className="text-2xl font-display font-semibold">Reset your password</h1>
        <p className="text-sm text-ink_text-muted mt-1.5">
          Enter your email and we'll send you a link to reset it
        </p>
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

        <Button type="submit" isLoading={isSubmitting} icon={Mail} iconPosition="right" fullWidth>
          Send reset link
        </Button>
      </form>

      <Link
        to="/login"
        className="mt-6 flex items-center justify-center gap-1.5 text-sm text-ink_text-muted hover:text-ink_text-primary"
      >
        <ArrowLeft className="h-4 w-4" /> Back to log in
      </Link>
    </div>
  );
}
