// Tiny global toast emitter — usable from components, thunks, or callbacks (no provider needed)
const listeners = new Set();
let nextId = 1;

const emit = (type, message, opts = {}) => {
  const t = {
    id: nextId++,
    type,
    message: String(message ?? ''),
    title: opts.title,
    duration: opts.duration ?? (type === 'error' ? 5500 : 3800),
  };
  listeners.forEach(fn => fn(t));
  return t.id;
};

export const toast = {
  success: (msg, opts) => emit('success', msg, opts),
  error: (msg, opts) => emit('error', msg, opts),
  info: (msg, opts) => emit('info', msg, opts),
  warning: (msg, opts) => emit('warning', msg, opts),
};

export const subscribeToasts = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export default toast;
