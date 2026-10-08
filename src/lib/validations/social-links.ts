import { z } from 'zod';

export const SOCIAL_NETWORKS = {
  instagram_url: { label: 'Instagram', hosts: ['instagram.com'] },
  facebook_url: { label: 'Facebook', hosts: ['facebook.com', 'fb.com'] },
  tiktok_url: { label: 'TikTok', hosts: ['tiktok.com'] },
} as const;

export type SocialNetworkKey = keyof typeof SOCIAL_NETWORKS;

/** Aceita só https:// no domínio da rede (ou subdomínio). Vazio → null. */
export function socialUrlSchema(hosts: readonly string[], label: string) {
  return z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((value, ctx) => {
      if (!value) return null;
      let url: URL;
      try {
        url = new URL(value);
      } catch {
        ctx.addIssue({ code: 'custom', message: `URL do ${label} inválida` });
        return z.NEVER;
      }
      const host = url.hostname.toLowerCase();
      const hostOk = hosts.some((h) => host === h || host.endsWith(`.${h}`));
      if (url.protocol !== 'https:' || !hostOk || url.username || url.password) {
        ctx.addIssue({
          code: 'custom',
          message: `Use um link https:// do ${label} (${hosts[0]})`,
        });
        return z.NEVER;
      }
      return url.toString();
    });
}

export const SocialLinksSchema = z.object(
  Object.fromEntries(
    Object.entries(SOCIAL_NETWORKS).map(([key, { hosts, label }]) => [
      key,
      socialUrlSchema(hosts, label),
    ]),
  ) as { [K in SocialNetworkKey]: ReturnType<typeof socialUrlSchema> },
);
