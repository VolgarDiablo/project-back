import { ITokenResponse } from '../interfaces/user.interface';

export class TokenResponseDTO implements ITokenResponse {
  constructor(partial: Partial<TokenResponseDTO>) {
    Object.assign(this, partial);
  }
  token: string;
}
