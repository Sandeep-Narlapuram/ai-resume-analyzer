import { Loader2 } from 'lucide-react';

const SIZE_MAP = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10', xl: 'h-14 w-14' };

export default function LoadingSpinner({ size = 'md', label, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`} role="status">
      <Loader2 className={`${SIZE_MAP[size]} animate-spin text-violet-400`} aria-hidden="true" />
      {label && <p className="text-sm text-ink_text-muted">{label}</p>}
      <span className="sr-only">Loading…</span>
    </div>
  );
}

export function FullPageSpinner({ label = 'Loading…' }) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="xl" label={label} />
    </div>
  );
}
