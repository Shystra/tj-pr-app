export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthToken {
  token: string;
  refreshToken: string;
  refreshTokenExpiresAt: string;
  accessTokenExpiresAt: string;
  userId: string;
  role: string;
  name: string;
  email: string;
}
