import { User } from '../users/users.api';
import iamHttpRequest from '@/core/network/iam-http-request';

const authApi = {
  signin,
  refreshToken,
};
export default authApi;

export interface SignInRequest {
  email: string;
  password: string;
}
export interface SignInResponse extends Pick<
  User,
  'id' | 'username' | 'email' | 'firstName' | 'lastName' | 'phoneNumber'
> {
  accessToken: string;
  accessTokenExpiry: number;
  refreshToken: string;
  refreshTokenExpiry: number;
}
function signin(data: SignInRequest) {
  return iamHttpRequest.request<SignInResponse>('POST', '/auth/sign-in', {
    body: data,
  });
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
export interface RefreshTokenResponse {
  accessToken: string;
  accessTokenExpiry: number;
}

function refreshToken(data: RefreshTokenRequest) {
  return iamHttpRequest.request<RefreshTokenResponse>('POST', '/auth/refresh', {
    body: data,
  });
}
