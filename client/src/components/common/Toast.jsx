import { createPortal } from 'react-dom';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const TONE_CLASSES = {
  success: 'border-emerald-400/30 text-emerald-300',
  error: 'border-rose-400/30 text-rose-300',
  warning: 'border-amber-400/30 text-amber-300',
  info: 'border-violet-400/30 text-violet-300',
};

export default function ToastContainer({ toasts, onDismiss }) {
  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-3 w-full max-w-sm"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => {
        const Icon = ICONS[t.type] || Info;
        return (
          <div
            key={t.id}
            role="alert"
            className={`glass-panel flex items-start gap-3 p-4 animate-fade-up border ${TONE_CLASSES[t.type]}`}
          >
            <Icon className="h-5 w-5 shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-sm text-ink_text-primary flex-1">{t.message}</p>
            <button
              onClick={() => onDismiss(t.id)}
              aria-label="Dismiss notification"
              className="text-ink_text-faint hover:text-ink_text-primary"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>,
    document.body
  );
}
