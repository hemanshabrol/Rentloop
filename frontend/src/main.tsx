// ============================================================================
// FILE: main.tsx
// Purpose: Entry point of the React application.
// Finds the <div id="root"> element in index.html and mounts the <App /> component.
// ============================================================================

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';

// Locate the root container inside index.html
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found in index.html');
}

// Mount the React application into the DOM
createRoot(rootElement).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>
);


