import { createAuthClient } from 'better-auth/react'
import { API_BASE_URL } from './env'

export const authClient = createAuthClient({
  baseURL: API_BASE_URL,
  fetchOptions: {
    credentials: 'include',
  },
})

export const { useSession, signIn, signUp, signOut } = authClient

export type SessionUser = {
  id: string
  email: string
  name: string | null
  role: 'user' | 'admin'
  emailVerified: boolean
}
