import {API_BASE_URL, ApiError, auth, request} from './client';

// Admins sign in with an email and a 6-digit code only. No passwords, social logins or SSO.
// Until the backend is live (the base URL is still the placeholder), dev builds skip it:
// any email "sends" a code and any 6 digits sign you in.
const MOCK_AUTH = __DEV__ && API_BASE_URL.includes('example.com');

export type AdminUser = {id: string; name: string; email: string; role: 'admin'};

export const adminAuth = {
  requestCode: (email: string) => (MOCK_AUTH ? Promise.resolve() : request<void>('/admin/auth/code/request', {method: 'POST', body: {email}})),
  verifyCode: async (email: string, code: string) => {
    const result = MOCK_AUTH
      ? {token: 'mock-admin-token', user: {id: 'mock-admin', name: email.split('@')[0], email, role: 'admin' as const}}
      : await request<{token: string; user: AdminUser}>('/admin/auth/code/verify', {method: 'POST', body: {email, code}});
    auth.setToken(result.token);
    return result.user;
  },
  signOut: () => auth.clear(),
};

export function describe(error: unknown) {
  return error instanceof ApiError ? error.message : 'Can\'t reach yizelearn right now. Check your connection and try again.';
}
