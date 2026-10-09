export const photoLimit = 5 * 1024 * 1024;
export const photoTypes = ['image/jpeg', 'image/png', 'image/webp'] as const;
export function ownPhotoPath(userId: string, path: string) {
  return /^[0-9a-f-]{36}\/[0-9a-f-]{36}\.(jpg|png|webp)$/.test(path) && path.split('/')[0] === userId;
}
export function photoSignature(bytes: Uint8Array, type: string) {
  if (type === 'image/jpeg') return bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  if (type === 'image/png') return [137,80,78,71,13,10,26,10].every((byte, i) => bytes[i] === byte);
  if (type === 'image/webp') return String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP';
  return false;
}
