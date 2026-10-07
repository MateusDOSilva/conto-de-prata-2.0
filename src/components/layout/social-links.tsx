import { SOCIAL_NETWORKS, type SocialNetworkKey } from '@/lib/validations/social-links';
import type { StoreSettings } from '@/lib/services/store-settings.service';
import { SocialIcon } from './social-icon';

/** Renderiza apenas as redes configuradas (campos nulos não aparecem). */
export function SocialLinks({
  settings,
  className = '',
}: {
  settings: Pick<StoreSettings, SocialNetworkKey>;
  className?: string;
}) {
  const links = (Object.keys(SOCIAL_NETWORKS) as SocialNetworkKey[]).flatMap((key) => {
    const url = settings[key];
    return url ? [{ key, url, label: SOCIAL_NETWORKS[key].label }] : [];
  });

  if (links.length === 0) return null;

  return (
    <ul className={`flex items-center gap-3 ${className}`} aria-label="Redes sociais">
      {links.map(({ key, url, label }) => (
        <li key={key}>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={label}
            className="flex size-10 items-center justify-center rounded-full border border-current/20 transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
          >
            <SocialIcon network={key} />
          </a>
        </li>
      ))}
    </ul>
  );
}
