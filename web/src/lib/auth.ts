// Admins sign in with an email and a 6-digit code only. No passwords, social logins or SSO.
// Until NEXT_PUBLIC_API_URL is set, development skips the server: any email "sends" a code and any 6 digits sign you in.
const API = process.env.NEXT_PUBLIC_API_URL;
export const SESSION_COOKIE = 'yz_admin';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API}${path}`, {method: 'POST', headers: {'Content-Type': 'application/json'}, body: JSON.stringify(body)});
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message ?? 'Something went wrong. Try again.');
  }
  return res.status === 204 ? (undefined as T) : res.json();
}

export async function requestCode(email: string) {
  if (!API) return;
  await post<void>('/admin/auth/code/request', {email});
}

export async function verifyCode(email: string, code: string) {
  const {token} = API ? await post<{token: string}>('/admin/auth/code/verify', {email, code}) : {token: 'mock-admin-token'};
  // A same-site cookie so the middleware can keep signed-out visitors on the login page.
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${60 * 60 * 8}; samesite=strict${location.protocol === 'https:' ? '; secure' : ''}`;
}

export function signOut() {
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}
