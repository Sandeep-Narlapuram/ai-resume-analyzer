import { createContext, useCallback, useMemo, useState } from 'react';
import ToastContainer from '../components/common/Toast.jsx';

export const ToastContext = createContext(null);

let toastId = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (message, options = {}) => {
      const id = ++toastId;
      const toast = {
        id,
        message,
        type: options.type || 'info', // 'success' | 'error' | 'info' | 'warning'
        duration: options.duration ?? 4000,
      };
      setToasts((prev) => [...prev, toast]);
      if (toast.duration > 0) {
        setTimeout(() => removeToast(id), toast.duration);
      }
      return id;
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      show: showToast,
      success: (msg, opts) => showToast(msg, { ...opts, type: 'success' }),
      error: (msg, opts) => showToast(msg, { ...opts, type: 'error' }),
      warning: (msg, opts) => showToast(msg, { ...opts, type: 'warning' }),
      info: (msg, opts) => showToast(msg, { ...opts, type: 'info' }),
      dismiss: removeToast,
    }),
    [showToast, removeToast]
  );

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}
