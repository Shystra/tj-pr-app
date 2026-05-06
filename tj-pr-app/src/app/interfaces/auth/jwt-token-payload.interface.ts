export interface JwtTokenPayload {
  sub?: string;
  role?: string;
  email?: string;
  name?: string;
  exp?: number;
}
