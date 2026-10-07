import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { injectStore } from './api/axios';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import './index.css';
import 'leaflet/dist/leaflet.css';

injectStore(store);

// Suppress benign browser extension content script communication errors
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const msg = event?.reason?.message || String(event?.reason || '');
    if (
      msg.includes('Could not establish connection') ||
      msg.includes('Receiving end does not exist') ||
      msg.includes('message channel closed')
    ) {
      event.preventDefault();
      event.stopImmediatePropagation?.();
    }
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
