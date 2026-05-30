// Use environment variables with fallback for local development
export const BACKEND_URL =
    typeof window !== 'undefined'
        ? process.env.NEXT_PUBLIC_BACKEND_URL || 'https://opendraw-http-backend.onrender.com'
        : process.env.NEXT_PUBLIC_BACKEND_URL || 'https://opendraw-http-backend.onrender.com'

export const WSS_URL =
    typeof window !== 'undefined'
        ? process.env.NEXT_PUBLIC_WSS_URL || 'wss://opendraw-ws-backend.onrender.com'
        : process.env.NEXT_PUBLIC_WSS_URL || 'wss://opendraw-ws-backend.onrender.com'


        