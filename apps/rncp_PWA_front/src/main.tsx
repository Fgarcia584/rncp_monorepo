import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './store/store';
import { initSentry } from './sentry';
import { SentryErrorBoundary } from './components/error/SentryErrorBoundary';
import './index.css';
import App from './App.tsx';

// Import des utilitaires de test hors ligne
import './utils/testOfflineMode';

// Initialize Sentry before rendering the app
initSentry();

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <SentryErrorBoundary>
            <Provider store={store}>
                <App />
            </Provider>
        </SentryErrorBoundary>
    </StrictMode>,
);
