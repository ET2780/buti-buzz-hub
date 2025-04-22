import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

console.log("Starting application initialization...");

const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Root element not found!");
  throw new Error("Root element not found!");
}

console.log("Root element found, creating root...");
const root = createRoot(rootElement);

console.log("Rendering App component...");
root.render(<App />);
