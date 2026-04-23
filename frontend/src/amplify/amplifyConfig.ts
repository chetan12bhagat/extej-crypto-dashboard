import { Amplify } from 'aws-amplify'

const region = import.meta.env.VITE_AWS_REGION || 'ap-south-1'
const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID || 'ap-south-1_PLACEHOLDER'
const userPoolClientId = import.meta.env.VITE_COGNITO_CLIENT_ID || 'PLACEHOLDER'
const cognitoDomain = import.meta.env.VITE_COGNITO_DOMAIN || 'extej.auth.ap-south-1.amazoncognito.com'
const redirectSignIn = import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`
const redirectSignOut = import.meta.env.VITE_SIGN_OUT_URI || `${window.location.origin}/login`

export function configureAmplify() {
  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId,
        userPoolClientId,
        loginWith: {
          oauth: {
            domain: cognitoDomain,
            scopes: ['email', 'profile', 'openid', 'aws.cognito.signin.user.admin'],
            redirectSignIn: [redirectSignIn],
            redirectSignOut: [redirectSignOut],
            responseType: 'code',
          },
        },
      },
    },
  } as Parameters<typeof Amplify.configure>[0])
}

export { region, userPoolId, userPoolClientId }
