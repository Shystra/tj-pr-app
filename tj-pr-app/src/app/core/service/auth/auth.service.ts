import { LoginCredentials, AuthToken } from './../../models/auth.model';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { map, Observable, tap, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TokenIssueResponse, TokenRefreshResponse } from '../../../interfaces/auth/response-api';
import { JwtTokenPayload } from '../../../interfaces/auth/jwt-token-payload.interface';
import { TokenMethodsUtils } from '../../../util/token-methods';

const tenantHeader = new HttpHeaders({ tenant: 'root' });

@Injectable({ providedIn: 'root' })
export class AuthService {
  // private identityBaseUrl = `${environment.apiUrl}/api/v1/identity`;
  private identityBaseUrl = `${environment.apiUrlTeste}/identity`;
  private authStorageKey = 'auth_token';
  private authToken: AuthToken | null = null;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
  ) {
    this.authToken = this.loadStoredToken();
  }

  isAuthenticated(): boolean {
    const hasSession = this.authToken !== null && !!TokenMethodsUtils.getToken();

    if (!hasSession) {
      return false;
    }

    if (TokenMethodsUtils.isTokenExpired()) {
      this.clearSession();
      return false;
    }

    return true;
  }

  currentUser(): AuthToken | null {
    return this.authToken;
  }

  currentRole(): string {
    return this.authToken?.role ?? '';
  }

  getAccessToken(): string | null {
    return TokenMethodsUtils.getToken();
  }

  login(credentials: LoginCredentials): Observable<boolean> {
    TokenMethodsUtils.setRememberMe(credentials.rememberMe ?? false);

    return this.httpClient.post<TokenIssueResponse>(
      `${this.identityBaseUrl}/token/issue`,
      { email: credentials.email, password: credentials.password },
      { headers: tenantHeader },
    ).pipe(
      map((tokenIssueResponse) => this.buildAuthTokenFromIssueResponse(tokenIssueResponse, credentials.email)),
      tap((authToken) => {
        this.persistSession(authToken);
      }),
      map(() => true),
    );
  }

  refreshToken(): Observable<string> {
    const currentAccessToken = TokenMethodsUtils.getToken();
    const currentRefreshToken = TokenMethodsUtils.getRefreshToken();

    if (!currentAccessToken || !currentRefreshToken) {
      this.logout();
      return throwError(() => new Error('Missing tokens for refresh.'));
    }

    return this.httpClient.post<TokenRefreshResponse>(
      `${this.identityBaseUrl}/token/refresh`,
      { token: currentAccessToken, refreshToken: currentRefreshToken },
      { headers: tenantHeader },
    ).pipe(
      tap((tokenRefreshResponse) => {
        const updatedAuthToken = this.buildAuthTokenFromRefreshResponse(tokenRefreshResponse);
        this.persistSession(updatedAuthToken);
      }),
      map((tokenRefreshResponse) => tokenRefreshResponse.token),
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/auth/login']);
  }

  private clearSession(): void {
    localStorage.removeItem(this.authStorageKey);
    sessionStorage.removeItem(this.authStorageKey);
    TokenMethodsUtils.signOut();
    this.authToken = null;
  }

  private loadStoredToken(): AuthToken | null {
    try {
      const rememberedSession = localStorage.getItem(this.authStorageKey);
      const sessionSession = sessionStorage.getItem(this.authStorageKey);
      const storedAuthToken = TokenMethodsUtils.isRememberMe() ? rememberedSession : sessionSession;

      if (!storedAuthToken) {
        if (rememberedSession ?? sessionSession) {
          TokenMethodsUtils.setRememberMe(!!rememberedSession);
          return this.loadStoredToken();
        }

        return null;
      }

      const parsedAuthToken = JSON.parse(storedAuthToken) as AuthToken;

      TokenMethodsUtils.setRememberMe(!!rememberedSession);
      TokenMethodsUtils.saveToken(parsedAuthToken.token);
      TokenMethodsUtils.saveRefreshToken(parsedAuthToken.refreshToken);
      TokenMethodsUtils.saveExpiresAt(parsedAuthToken.accessTokenExpiresAt);

      return parsedAuthToken;
    } catch {
      localStorage.removeItem(this.authStorageKey);
      sessionStorage.removeItem(this.authStorageKey);
      return null;
    }
  }

  private persistSession(authToken: AuthToken): void {
    const serializedAuthToken = JSON.stringify(authToken);

    TokenMethodsUtils.saveToken(authToken.token);
    TokenMethodsUtils.saveRefreshToken(authToken.refreshToken);
    TokenMethodsUtils.saveExpiresAt(authToken.accessTokenExpiresAt);

    if (TokenMethodsUtils.isRememberMe()) {
      localStorage.setItem(this.authStorageKey, serializedAuthToken);
      sessionStorage.removeItem(this.authStorageKey);
    } else {
      sessionStorage.setItem(this.authStorageKey, serializedAuthToken);
      localStorage.removeItem(this.authStorageKey);
    }

    this.authToken = authToken;
  }

  private buildAuthTokenFromIssueResponse(
    tokenIssueResponse: TokenIssueResponse,
    fallbackEmail: string,
  ): AuthToken {
    const tokenPayload = this.decodeJwt(tokenIssueResponse.accessToken);

    return {
      token: tokenIssueResponse.accessToken,
      refreshToken: tokenIssueResponse.refreshToken,
      refreshTokenExpiresAt: tokenIssueResponse.refreshTokenExpiresAt,
      accessTokenExpiresAt: tokenIssueResponse.accessTokenExpiresAt,
      userId: tokenPayload?.sub ?? '',
      role: tokenPayload?.role ?? '',
      name: tokenPayload?.name ?? tokenPayload?.email ?? fallbackEmail,
      email: tokenPayload?.email ?? fallbackEmail,
    };
  }

  private buildAuthTokenFromRefreshResponse(tokenRefreshResponse: TokenRefreshResponse): AuthToken {
    const currentAuthToken = this.authToken;
    const tokenPayload = this.decodeJwt(tokenRefreshResponse.token);

    return {
      token: tokenRefreshResponse.token,
      refreshToken: tokenRefreshResponse.refreshToken,
      refreshTokenExpiresAt: tokenRefreshResponse.refreshTokenExpiryTime,
      accessTokenExpiresAt: this.getAccessTokenExpiresAt(tokenPayload),
      userId: tokenPayload?.sub ?? currentAuthToken?.userId ?? '',
      role: tokenPayload?.role ?? currentAuthToken?.role ?? '',
      name: tokenPayload?.name ?? currentAuthToken?.name ?? currentAuthToken?.email ?? '',
      email: tokenPayload?.email ?? currentAuthToken?.email ?? '',
    };
  }

  private decodeJwt(token: string): JwtTokenPayload | null {
    try {
      const payloadBase64 = token.split('.')[1];

      if (!payloadBase64) {
        return null;
      }

      return JSON.parse(atob(payloadBase64)) as JwtTokenPayload;
    } catch {
      return null;
    }
  }

  private getAccessTokenExpiresAt(tokenPayload: JwtTokenPayload | null): string {
    if (!tokenPayload?.exp) {
      return this.authToken?.accessTokenExpiresAt ?? '';
    }

    return new Date(tokenPayload.exp * 1000).toISOString();
  }
}
