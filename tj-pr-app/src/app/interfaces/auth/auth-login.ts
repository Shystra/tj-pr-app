export interface AuthLogin {
    userId: string;
    tokenReset: string;
    mustChangePassword: boolean;
    access_token: string;
    refresh_token: string;
    expires_in: number;
    token_type: string;
}