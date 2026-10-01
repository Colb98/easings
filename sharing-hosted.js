import QRCode from 'qrcode';
export const hosted = true;
export async function getShareLinks() {
  const url = new URL('/', window.location.href).href;
  return [{ url, qr: await QRCode.toDataURL(url, {
    width: 256, margin: 2,
    color: { dark: '#17231fff', light: '#ffffffff' },
  }) }];
}
