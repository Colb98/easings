// Local server provides this computer's LAN addresses and QR codes.
export const hosted = false;
export async function getShareLinks() {
  const response = await fetch('/api/share');
  if (!response.ok) throw new Error('Unable to load LAN addresses');
  return (await response.json()).links;
}
