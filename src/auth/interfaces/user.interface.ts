export interface ICreateUser {
  name: string;
  email: string;
  phone?: string;
  password: string;
  referralCode?: string;
}

export interface IJwtPayload {
  id: number;
  sub?: number;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface ITokenResponse {
  token: string;
}
