export class AuthResponseDto {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    email_verified: boolean;
  };
}
