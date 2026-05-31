// Detect if running locally
const isLocalhost = 
  typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname.startsWith('192.168'));

// Use localhost URLs for local development, otherwise use environment variables or production URLs
export const BACKEND_URL = isLocalhost
  ? 'http://localhost:3001'
  : (process.env.NEXT_PUBLIC_BACKEND_URL || 'https://opendraw-http-backend.onrender.com');

export const WSS_URL = isLocalhost
  ? 'ws://localhost:3002'
  : (process.env.NEXT_PUBLIC_WSS_URL || 'wss://opendraw-ws-backend.onrender.com');


        