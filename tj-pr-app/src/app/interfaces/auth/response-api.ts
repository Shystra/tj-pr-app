/** Resposta do POST /api/v1/identity/token/issue */
export interface TokenIssueResponse {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: string; // ISO date-time
  accessTokenExpiresAt: string;  // ISO date-time
}

/** Resposta do POST /api/v1/identity/token/refresh */
export interface TokenRefreshResponse {
  token: string;
  refreshToken: string;
  refreshTokenExpiryTime: string; // ISO date-time
}

/** @deprecated Mantido para retrocompatibilidade */
export interface LoginApiResponse {
  accessToken: string;
  refreshToken: string;
  name: string;
  email: string;
  roles: string[];
  expiresIn: number;
}
