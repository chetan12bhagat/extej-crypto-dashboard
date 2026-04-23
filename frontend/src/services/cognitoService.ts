import {
  signIn,
  signUp,
  signOut,
  confirmSignUp,
  resendSignUpCode,
  resetPassword,
  confirmResetPassword,
  fetchAuthSession,
  getCurrentUser,
  fetchUserAttributes,
  signInWithRedirect,
} from 'aws-amplify/auth'

export const cognitoService = {
  // Sign up with email/password
  signUp: async (email: string, password: string, name: string) => {
    return signUp({
      username: email,
      password,
      options: {
        userAttributes: { email, name },
      },
    })
  },

  // Confirm email with OTP
  confirmSignUp: async (email: string, code: string) => {
    return confirmSignUp({ username: email, confirmationCode: code })
  },

  // Resend confirmation code
  resendCode: async (email: string) => {
    return resendSignUpCode({ username: email })
  },

  // Sign in
  signIn: async (email: string, password: string) => {
    return signIn({ username: email, password })
  },

  // Google OAuth
  signInWithGoogle: async () => {
    return signInWithRedirect({ provider: 'Google' })
  },

  // Sign out
  signOut: async (global = false) => {
    return signOut({ global })
  },

  // Forgot password — send code
  forgotPassword: async (email: string) => {
    return resetPassword({ username: email })
  },

  // Confirm new password
  confirmForgotPassword: async (email: string, code: string, newPassword: string) => {
    return confirmResetPassword({
      username: email,
      confirmationCode: code,
      newPassword,
    })
  },

  // Get current session
  getSession: async () => {
    return fetchAuthSession()
  },

  // Get current user (Cognito)
  getCurrentUser: async () => {
    return getCurrentUser()
  },

  // Get user attributes
  getUserAttributes: async () => {
    return fetchUserAttributes()
  },

  // Get access token string
  getAccessToken: async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession()
      return session.tokens?.accessToken?.toString() ?? null
    } catch {
      return null
    }
  },

  // Get ID token string
  getIdToken: async (): Promise<string | null> => {
    try {
      const session = await fetchAuthSession()
      return session.tokens?.idToken?.toString() ?? null
    } catch {
      return null
    }
  },
}
