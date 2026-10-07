import { describe, expect, it } from 'vitest';
import { sniffImageType } from './image-type';

const bytes = (...b: number[]) => new Uint8Array([...b, ...new Array(16).fill(0)]);
const ascii = (s: string) => [...s].map((c) => c.charCodeAt(0));

describe('sniffImageType', () => {
  it('detecta JPEG, PNG, WebP, AVIF e ICO', () => {
    expect(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0))).toBe('image/jpeg');
    expect(sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a))).toBe('image/png');
    expect(sniffImageType(bytes(...ascii('RIFF'), 0, 0, 0, 0, ...ascii('WEBP')))).toBe(
      'image/webp',
    );
    expect(sniffImageType(bytes(0, 0, 0, 0x1c, ...ascii('ftypavif')))).toBe('image/avif');
    expect(sniffImageType(bytes(0, 0, 1, 0))).toBe('image/x-icon');
  });

  it('rejeita SVG, HTML e executáveis mesmo com extensão de imagem', () => {
    expect(
      sniffImageType(new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg">')),
    ).toBeNull();
    expect(sniffImageType(new TextEncoder().encode('<html><script>alert(1)</script>'))).toBeNull();
    expect(sniffImageType(bytes(0x4d, 0x5a))).toBeNull();
    expect(sniffImageType(new Uint8Array())).toBeNull();
  });
});
