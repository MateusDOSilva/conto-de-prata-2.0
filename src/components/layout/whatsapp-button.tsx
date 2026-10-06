import { buildWhatsAppUrl } from '@/lib/whatsapp/build-order-message';
import { WhatsAppIcon } from './social-icon';

export function WhatsAppButton({
  whatsappNumber,
  message = 'Olá! Vim pelo catálogo e gostaria de mais informações.',
  floating = false,
}: {
  whatsappNumber: string;
  message?: string;
  floating?: boolean;
}) {
  const href = buildWhatsAppUrl(whatsappNumber, message);
  if (floating) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Falar no WhatsApp"
        className="fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
      >
        <WhatsAppIcon className="size-7" />
      </a>
    );
  }
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-sm font-medium text-white transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
    >
      <WhatsAppIcon /> Falar no WhatsApp
    </a>
  );
}
