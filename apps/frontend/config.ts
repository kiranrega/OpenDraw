// Use environment variables with fallback for local development
export const BACKEND_URL =
    typeof window !== 'undefined'
        ? process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
        : process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'

export const WSS_URL =
    typeof window !== 'undefined'
        ? process.env.NEXT_PUBLIC_WSS_URL || 'ws://localhost:8080'
        : process.env.NEXT_PUBLIC_WSS_URL || 'ws://localhost:8080'