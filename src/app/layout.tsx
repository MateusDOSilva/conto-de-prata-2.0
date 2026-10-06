import type { Metadata } from 'next';
import { Cormorant_Garamond, Inter } from 'next/font/google';
import { publicEnv } from '@/lib/env';
import { getStoreSettings } from '@/lib/services/store-settings.service';
import './globals.css';

const inter = Inter({ variable: '--font-inter', subsets: ['latin'], display: 'swap' });
const cormorant = Cormorant_Garamond({
  variable: '--font-cormorant',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings().catch(() => null);
  const name = settings?.store_name ?? 'Catálogo de Semijoias';
  const description = settings?.description ?? 'Catálogo online de semijoias.';
  return {
    metadataBase: new URL(publicEnv.siteUrl),
    title: { default: name, template: `%s | ${name}` },
    description,
    applicationName: name,
    icons: settings?.favicon_url ? { icon: settings.favicon_url } : undefined,
    openGraph: {
      type: 'website',
      locale: 'pt_BR',
      siteName: name,
      title: name,
      description,
      images: settings?.logo_url ? [{ url: settings.logo_url }] : undefined,
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} ${cormorant.variable}`}>{children}</body>
    </html>
  );
}
