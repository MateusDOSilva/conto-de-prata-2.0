import { describe, expect, it } from 'vitest';
import { SocialLinksSchema } from './social-links';

const parse = (v: Record<string, string>) => SocialLinksSchema.safeParse(v);

describe('SocialLinksSchema', () => {
  it('aceita links https das redes e converte vazio em null', () => {
    const r = parse({
      instagram_url: 'https://www.instagram.com/minhaloja',
      facebook_url: '',
      tiktok_url: 'https://www.tiktok.com/@minhaloja',
    });
    expect(r.success).toBe(true);
    expect(r.data?.facebook_url).toBeNull();
    expect(r.data?.tiktok_url).toBe('https://www.tiktok.com/@minhaloja');
  });

  it('não aceita mais campos para YouTube e LinkedIn', () => {
    const r = parse({
      youtube_url: 'https://youtu.be/abc',
      linkedin_url: 'https://linkedin.com/company/minhaloja',
    });
    expect(r.success).toBe(true);
    expect(r.data).toEqual({
      instagram_url: null,
      facebook_url: null,
      tiktok_url: null,
    });
  });

  it.each([
    'javascript:alert(1)',
    'data:text/html,<script>alert(1)</script>',
    'http://instagram.com/loja',
    'https://instagram.com.evil.com/loja',
    'https://evil.com/instagram.com',
    'https://user:pass@instagram.com/loja',
  ])('rejeita %s', (url) => expect(parse({ instagram_url: url }).success).toBe(false));
});
