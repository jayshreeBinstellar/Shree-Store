import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
createRoot(document.getElementById('root')).render(


  <StrictMode>
    <App />
  </StrictMode>,

)
// Remove loader AFTER render
setTimeout(() => {
  const loader = document.getElementById("initial-loader");
  if (loader) loader.remove();
}, 0);