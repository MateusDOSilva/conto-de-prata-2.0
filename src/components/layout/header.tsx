import Image from 'next/image';
import Link from 'next/link';
import type { StoreSettings } from '@/lib/services/store-settings.service';
import { CartLink } from '@/components/cart/cart-link';

export function Header({ settings }: { settings: StoreSettings }) {
  return (
    <header className="sticky top-0 z-30 border-b border-black/5 bg-[var(--color-background)]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex items-center gap-3 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"
        >
          {settings.logo_url && (
            <Image
              src={settings.logo_url}
              alt=""
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
          )}
          <span className="font-serif text-xl tracking-wide">{settings.store_name}</span>
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-5 text-sm">
          <Link href="/produtos" className="hidden hover:text-[var(--color-primary)] sm:inline">
            Produtos
          </Link>
          <CartLink />
        </nav>
      </div>
    </header>
  );
}
