import { STRING_POINT } from '../constants/string-consts';

const tokenKey = '@auth-token';
const refreshTokenKey = '@auth-refreshtoken';
const userNameKey = '@username';
const expiresKey = '@expires-in';
const rememberMeKey = 'auth_remember_me';

export class TokenMethodsUtils {
  static setRememberMe(value: boolean): void {
    localStorage.setItem(rememberMeKey, String(value));
  }

  static isRememberMe(): boolean {
    return localStorage.getItem(rememberMeKey) === 'true';
  }

  static saveToken(token: string): void {
    this.getStorage().setItem(tokenKey, token);
  }

  static saveRefreshToken(refreshToken: string): void {
    this.getStorage().setItem(refreshTokenKey, refreshToken);
  }

  static saveUsername(userName: string): void {
    this.getStorage().setItem(userNameKey, userName);
  }

  static saveExpiresAt(expiresAt: string | number): void {
    const expiresAtMilliseconds = typeof expiresAt === 'number'
      ? expiresAt
      : new Date(expiresAt).getTime();

    this.getStorage().setItem(expiresKey, expiresAtMilliseconds.toString());
  }

  static saveExpiresIn(expiresIn: number): void {
    const expirationTime = Date.now() + expiresIn * 1000;
    this.getStorage().setItem(expiresKey, expirationTime.toString());
  }

  static getToken(): string | null {
    return this.getStorage().getItem(tokenKey);
  }

  static getRefreshToken(): string | null {
    return this.getStorage().getItem(refreshTokenKey);
  }

  static getUsername(): string | null {
    return this.getStorage().getItem(userNameKey);
  }

  static getExpirationTime(): number | null {
    const storedExpirationTime = this.getStorage().getItem(expiresKey);
    return storedExpirationTime ? parseInt(storedExpirationTime, 10) : null;
  }

  static isTokenExpired(): boolean {
    const expirationTime = this.getExpirationTime();

    if (!expirationTime) {
      return true;
    }

    return Date.now() >= expirationTime;
  }

  static decodeToken(): Record<string, unknown> | null {
    const token = this.getToken();

    if (!token) {
      return null;
    }

    try {
      const payloadBase64 = token.split(STRING_POINT)[1];
      return JSON.parse(atob(payloadBase64));
    } catch {
      return null;
    }
  }

  static hasRole(role: string): boolean {
    const tokenPayload = this.decodeToken();
    const tokenRole = (tokenPayload?.['role'] as string) ?? '';
    return tokenRole.toLowerCase() === role.toLowerCase();
  }

  static signOut(): void {
    [tokenKey, refreshTokenKey, userNameKey, expiresKey].forEach((storageKey) => {
      localStorage.removeItem(storageKey);
      sessionStorage.removeItem(storageKey);
    });
  }

  private static getStorage(): Storage {
    return this.isRememberMe() ? localStorage : sessionStorage;
  }
}
