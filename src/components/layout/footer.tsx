import Link from 'next/link';
import type { StoreSettings } from '@/lib/services/store-settings.service';
import { formatBrazilPhone } from '@/lib/format/phone';
import { SocialLinks } from './social-links';
import { WhatsAppButton } from './whatsapp-button';

function displayWhatsApp(number: string) {
  return number.startsWith('55') ? formatBrazilPhone(number.slice(2)) : `+${number}`;
}

export function Footer({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="mt-20 border-t border-black/5 bg-[var(--color-secondary)] text-white/90">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-3">
        <div>
          <p className="font-serif text-xl text-white">{settings.store_name}</p>
          {settings.description && (
            <p className="mt-2 text-sm text-white/70">{settings.description}</p>
          )}
        </div>
        <nav aria-label="Rodapé" className="flex flex-col gap-2 text-sm">
          <Link href="/produtos" className="hover:underline">
            Todos os produtos
          </Link>
          <Link href="/carrinho" className="hover:underline">
            Carrinho
          </Link>
        </nav>
        <div className="flex flex-col items-start gap-4">
          <WhatsAppButton whatsappNumber={settings.whatsapp_number} />
          <p className="text-sm text-white/70">
            WhatsApp: {displayWhatsApp(settings.whatsapp_number)}
          </p>
          <SocialLinks settings={settings} />
        </div>
      </div>
      <p className="border-t border-white/10 py-4 text-center text-xs text-white/50">
        © {new Date().getFullYear()} {settings.store_name}. Pedidos finalizados pelo WhatsApp.
      </p>
    </footer>
  );
}
