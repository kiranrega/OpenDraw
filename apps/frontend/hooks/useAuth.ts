'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Hook to protect routes - redirects to signin if no token exists
 * Use this in components that require authentication
 */
export function useProtectedRoute() {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/signin')
    }
  }, [router])
}

/**
 * Hook to check if user is authenticated
 * Returns true if token exists, false otherwise
 */
export function useIsAuthenticated() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsAuth(!!token)
  }, [])

  return isAuth
}

/**
 * Hook to redirect authenticated users away from public pages (signin/signup)
 * Use this on auth pages to prevent access if already logged in
 */
export function useRedirectIfAuthenticated(redirectTo = '/dashboard') {
  const router = useRouter()

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      router.push(redirectTo)
    }
  }, [router, redirectTo])
}
