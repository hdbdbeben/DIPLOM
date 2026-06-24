import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './index.css';

async function startApp() {
  const USE_MOCKS = import.meta.env.VITE_USE_MOCKS === 'true';

  if (USE_MOCKS) {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'bypass' });
    console.log('[MSW] Mocking enabled');
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
      <App />
  );
}

startApp();
