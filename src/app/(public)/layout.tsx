import type { CSSProperties, ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';
import { WhatsAppButton } from '@/components/layout/whatsapp-button';
import { CartProvider } from '@/hooks/use-cart';
import { getStoreSettings } from '@/lib/services/store-settings.service';

export default async function PublicLayout({ children }: { children: ReactNode }) {
  const settings = await getStoreSettings();
  if (!settings) notFound();

  // Cores vêm do banco (validadas como #RRGGBB por CHECK + Zod) → CSS custom properties.
  const theme = {
    '--color-primary': settings.primary_color ?? '#B08D57',
    '--color-secondary': settings.secondary_color ?? '#1F1F1F',
    '--color-background': settings.background_color ?? '#FAF7F2',
    '--color-text': settings.text_color ?? '#2B2B2B',
  } as CSSProperties;

  return (
    <CartProvider>
      <div
        style={theme}
        className="flex min-h-screen flex-col bg-[var(--color-background)] text-[var(--color-text)]"
      >
        <a
          href="#conteudo"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2"
        >
          Pular para o conteúdo
        </a>
        <Header settings={settings} />
        <main id="conteudo" className="flex-1">
          {children}
        </main>
        <Footer settings={settings} />
        <WhatsAppButton whatsappNumber={settings.whatsapp_number} floating />
      </div>
    </CartProvider>
  );
}
