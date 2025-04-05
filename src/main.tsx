
import React from 'react'; // Add explicit React import
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add a style tag for animations
const styleEl = document.createElement('style');
styleEl.textContent = `
  @keyframes progress {
    from { width: 0; }
    to { width: 100%; }
  }
  
  .animate-progress {
    animation: progress 5s linear forwards;
  }
`;
document.head.appendChild(styleEl);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
