/**
 * Public Cognito app configuration for this browser client.
 * Populate these values with the application's approved user pool and public app client.
 * Never put a client secret here.
 */
export interface CognitoAuthConfig {
  userPoolId: string;
  userPoolClientId: string;
  domain: string;
  redirectSignIn: string[];
  redirectSignOut: string[];
}

export const AUTH_CONFIG: CognitoAuthConfig = {
  userPoolId: '',
  userPoolClientId: '',
  domain: '',
  redirectSignIn: [],
  redirectSignOut: [],
};

export function isAuthConfigured(config: CognitoAuthConfig): boolean {
  return Boolean(
    config.userPoolId.trim() &&
      config.userPoolClientId.trim() &&
      config.domain.trim() &&
      config.redirectSignIn.length &&
      config.redirectSignOut.length,
  );
}
