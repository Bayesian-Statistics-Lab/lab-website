export function safeReturnPath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || /[\\\r\n]/.test(value)) return '/';
  try {
    const url = new URL(value, 'https://lab.invalid');
    if (url.origin !== 'https://lab.invalid' || /^\/(admin\/login|auth|register)(\/|$)/.test(url.pathname)) return '/';
    return url.pathname + url.search + url.hash;
  } catch { return '/'; }
}
