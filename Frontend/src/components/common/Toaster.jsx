import { useEffect, useState, useCallback } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';
import { subscribeToasts } from '../../utils/toast';

const STYLES = {
  success: { icon: FiCheckCircle, ring: 'text-emerald-500', bar: 'bg-emerald-500', title: 'Success' },
  error: { icon: FiAlertCircle, ring: 'text-rose-500', bar: 'bg-rose-500', title: 'Something went wrong' },
  info: { icon: FiInfo, ring: 'text-sky-500', bar: 'bg-sky-500', title: 'Heads up' },
  warning: { icon: FiAlertTriangle, ring: 'text-amber-500', bar: 'bg-amber-500', title: 'Warning' },
};

const ToastItem = ({ t, onClose }) => {
  const [leaving, setLeaving] = useState(false);
  const [paused, setPaused] = useState(false);
  const s = STYLES[t.type] || STYLES.info;
  const Icon = s.icon;

  const close = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onClose(t.id), 280);
  }, [onClose, t.id]);

  useEffect(() => {
    if (paused) return;
    const timer = setTimeout(close, t.duration);
    return () => clearTimeout(timer);
  }, [paused, close, t.duration]);

  return (
    <div
      role="status"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      className={`pointer-events-auto relative w-full sm:w-[360px] overflow-hidden rounded-2xl glass shadow-large ${leaving ? 'animate-toast-out' : 'animate-toast-in'}`}
    >
      <div className="flex items-start gap-3 p-4 pr-10">
        <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${s.ring}`} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white">{t.title || s.title}</p>
          <p className="text-[13px] text-gray-600 dark:text-gray-300 mt-0.5 leading-snug break-words">{t.message}</p>
        </div>
      </div>
      <button
        onClick={close}
        aria-label="Dismiss notification"
        className="absolute top-3 right-3 p-1 rounded-full text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <FiX className="w-4 h-4" />
      </button>
      <div className="absolute bottom-0 left-0 h-[3px] w-full bg-black/5 dark:bg-white/5">
        <div
          className={`h-full ${s.bar} animate-progress`}
          style={{ animationDuration: `${t.duration}ms`, animationPlayState: paused ? 'paused' : 'running' }}
        />
      </div>
    </div>
  );
};

const Toaster = () => {
  const [toasts, setToasts] = useState([]);

  useEffect(() => subscribeToasts(t => setToasts(prev => [...prev.slice(-3), t])), []);

  const remove = useCallback(id => setToasts(prev => prev.filter(x => x.id !== id)), []);

  return (
    <div
      aria-live="polite"
      className="fixed z-[100] bottom-20 md:bottom-6 right-0 left-0 sm:left-auto sm:right-6 px-4 sm:px-0 flex flex-col gap-3 pointer-events-none"
    >
      {toasts.map(t => <ToastItem key={t.id} t={t} onClose={remove} />)}
    </div>
  );
};

export default Toaster;
