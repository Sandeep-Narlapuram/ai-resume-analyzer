import { useForm } from 'react-hook-form';
import { Save, User } from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { authApi } from '../services/authApi.js';
import { emailPattern, nameRules } from '../utils/validators.js';
import { initialsFromName, formatDate } from '../utils/formatters.js';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isDirty },
  } = useForm({
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  async function onSubmit(values) {
    try {
      const { data } = await authApi.updateProfile(values);
      updateUser(data?.data ?? values);
      toast.success('Profile updated');
    } catch {
      toast.error('Could not update your profile');
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Profile</h1>
        <p className="text-sm text-ink_text-muted mt-1">Manage your account information</p>
      </div>

      <Card className="flex items-center gap-4">
        <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-violet-500 to-aqua-500 text-lg font-semibold text-white">
          {initialsFromName(user?.name) || <User className="h-6 w-6" />}
        </span>
        <div>
          <p className="font-display font-semibold text-lg">{user?.name}</p>
          <p className="text-sm text-ink_text-muted">{user?.email}</p>
          <p className="text-xs text-ink_text-faint mt-1">Member since {formatDate(user?.createdAt)}</p>
        </div>
      </Card>

      <Card>
        <CardHeader title="Account details" />
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-ink_text-primary mb-1.5">
              Full name
            </label>
            <input
              id="name"
              type="text"
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
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm focus:border-violet-400/60 focus:outline-none transition-colors"
              {...register('email', { required: 'Email is required', pattern: emailPattern })}
            />
            {errors.email && <p className="mt-1 text-xs text-rose-400">{errors.email.message}</p>}
          </div>

          <Button type="submit" isLoading={isSubmitting} disabled={!isDirty} icon={Save} iconPosition="right">
            Save changes
          </Button>
        </form>
      </Card>
    </div>
  );
}
