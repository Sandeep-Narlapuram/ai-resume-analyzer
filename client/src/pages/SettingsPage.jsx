import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Moon, Sun, Bell, Trash2 } from 'lucide-react';
import Card, { CardHeader } from '../components/common/Card.jsx';
import Button from '../components/common/Button.jsx';
import Modal from '../components/common/Modal.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { useToast } from '../hooks/useToast.js';
import { useAuth } from '../hooks/useAuth.js';
import { authApi } from '../services/authApi.js';
import { passwordRules } from '../utils/validators.js';

export default function SettingsPage() {
  const { isDark, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setError,
    formState: { errors, isSubmitting },
  } = useForm();

  async function onSubmitPassword({ currentPassword, newPassword }) {
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Password updated');
      reset();
    } catch (err) {
      const code = err?.response?.data?.error?.code;
      if (code === 'INVALID_CURRENT_PASSWORD') {
        setError('currentPassword', { message: 'Current password is incorrect' });
      } else {
        toast.error(err?.response?.data?.error?.message || 'Could not update your password');
      }
    }
  }

  async function handleDeleteAccount() {
    setDeleteError('');
    setIsDeleting(true);
    try {
      await authApi.deleteAccount({ password: deletePassword });
      setConfirmOpen(false);
      toast.success('Account deleted');
      await logout();
      navigate('/', { replace: true });
    } catch (err) {
      const message = err?.response?.data?.error?.message || 'Could not delete your account';
      setDeleteError(message);
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Settings</h1>
        <p className="text-sm text-ink_text-muted mt-1">Manage your preferences and security</p>
      </div>

      <Card>
        <CardHeader title="Appearance" subtitle="Choose how ScoreMyResume looks on your device" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="h-5 w-5 text-violet-300" /> : <Sun className="h-5 w-5 text-amber-400" />}
            <div>
              <p className="text-sm font-medium text-ink_text-primary">Dark mode</p>
              <p className="text-xs text-ink_text-faint">Currently {isDark ? 'on' : 'off'}</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            role="switch"
            aria-checked={isDark}
            className={`relative h-7 w-12 rounded-full transition-colors ${isDark ? 'bg-violet-500' : 'bg-white/15'}`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                isDark ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </Card>

      <Card>
        <CardHeader title="Notifications" />
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-aqua-400" />
            <div>
              <p className="text-sm font-medium text-ink_text-primary">Email me when an analysis completes</p>
              <p className="text-xs text-ink_text-faint">Useful if you upload and step away</p>
            </div>
          </div>
          <button
            onClick={() => setEmailNotifications((v) => !v)}
            role="switch"
            aria-checked={emailNotifications}
            className={`relative h-7 w-12 rounded-full transition-colors ${
              emailNotifications ? 'bg-violet-500' : 'bg-white/15'
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                emailNotifications ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="text-xs text-ink_text-faint mt-3">
          This preference isn't saved to your account yet — it resets on reload. Email delivery
          itself also isn't wired up on the backend yet (see server/README.md).
        </p>
      </Card>

      <Card>
        <CardHeader title="Change password" />
        <form onSubmit={handleSubmit(onSubmitPassword)} className="space-y-5" noValidate>
          <div>
            <label htmlFor="currentPassword" className="block text-sm font-medium text-ink_text-primary mb-1.5">
              Current password
            </label>
            <input
              id="currentPassword"
              type="password"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm focus:border-violet-400/60 focus:outline-none transition-colors"
              {...register('currentPassword', { required: 'Current password is required' })}
            />
            {errors.currentPassword && (
              <p className="mt-1 text-xs text-rose-400">{errors.currentPassword.message}</p>
            )}
          </div>
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-ink_text-primary mb-1.5">
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm focus:border-violet-400/60 focus:outline-none transition-colors"
              {...register('newPassword', passwordRules)}
            />
            {errors.newPassword && <p className="mt-1 text-xs text-rose-400">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-ink_text-primary mb-1.5">
              Confirm new password
            </label>
            <input
              id="confirmNewPassword"
              type="password"
              className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm focus:border-violet-400/60 focus:outline-none transition-colors"
              {...register('confirmNewPassword', {
                required: 'Please confirm your new password',
                validate: (v) => v === watch('newPassword') || 'Passwords do not match',
              })}
            />
            {errors.confirmNewPassword && (
              <p className="mt-1 text-xs text-rose-400">{errors.confirmNewPassword.message}</p>
            )}
          </div>
          <Button type="submit" isLoading={isSubmitting} icon={KeyRound} iconPosition="right">
            Update password
          </Button>
        </form>
      </Card>

      <Card className="border border-rose-400/20">
        <CardHeader title="Danger zone" subtitle="Irreversible actions" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-ink_text-primary">Delete account</p>
            <p className="text-xs text-ink_text-faint">Permanently deletes your account, resumes, and analyses</p>
          </div>
          <Button variant="danger" size="sm" icon={Trash2} onClick={() => setConfirmOpen(true)}>
            Delete
          </Button>
        </div>
      </Card>

      <Modal
        isOpen={confirmOpen}
        onClose={() => {
          setConfirmOpen(false);
          setConfirmText('');
          setDeletePassword('');
          setDeleteError('');
        }}
        title="Delete your account?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              isLoading={isDeleting}
              disabled={confirmText !== 'DELETE' || !deletePassword}
              onClick={handleDeleteAccount}
            >
              Delete permanently
            </Button>
          </>
        }
      >
        <p className="mb-3">
          This deletes your account and all resumes and analyses permanently. This can't be undone.
        </p>
        <label htmlFor="confirmDelete" className="block text-xs text-ink_text-faint mb-1.5">
          Type <span className="font-mono text-ink_text-primary">DELETE</span> to confirm
        </label>
        <input
          id="confirmDelete"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm focus:border-rose-400/60 focus:outline-none mb-4"
        />
        <label htmlFor="deletePassword" className="block text-xs text-ink_text-faint mb-1.5">
          Enter your password
        </label>
        <input
          id="deletePassword"
          type="password"
          value={deletePassword}
          onChange={(e) => setDeletePassword(e.target.value)}
          className="w-full rounded-xl bg-white/[0.04] border border-white/10 px-4 py-2.5 text-sm focus:border-rose-400/60 focus:outline-none"
        />
        {deleteError && <p className="mt-2 text-xs text-rose-400">{deleteError}</p>}
      </Modal>
    </div>
  );
}
