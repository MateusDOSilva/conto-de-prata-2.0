'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

function NecklaceIllustration() {
  return (
    <div className="relative flex h-full flex-col items-center justify-center bg-[#eee6dc] px-8 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_35%,rgba(255,255,255,0.85),transparent_62%)]" />
      <svg
        aria-hidden="true"
        viewBox="0 0 360 300"
        className="relative mx-auto h-auto w-full max-w-[340px] text-[#9f835f]"
        fill="none"
      >
        <path
          d="M63 18c10 108 48 177 117 225 69-48 107-117 117-225"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M180 242v22" stroke="currentColor" strokeWidth="2" />
        <path
          d="m180 264 17 18-17 31-17-31 17-18Z"
          fill="#d1b894"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="180" cy="282" r="5" fill="#faf7f2" />
        <circle cx="74" cy="114" r="8" fill="#faf7f2" stroke="currentColor" strokeWidth="2" />
        <circle cx="286" cy="114" r="8" fill="#faf7f2" stroke="currentColor" strokeWidth="2" />
      </svg>
      <div className="relative mt-1 text-center">
        <p className="font-serif text-2xl text-[#514638]">Um detalhe, mil histórias.</p>
        <p className="mt-1 text-[10px] tracking-[0.25em] text-[#7b6c58] uppercase">
          Escolha a sua próxima peça
        </p>
      </div>
    </div>
  );
}

export function PresentationCarousel({
  images,
  storeName,
}: {
  images: string[];
  storeName: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setPrefersReducedMotion(preference.matches);
    updatePreference();
    preference.addEventListener('change', updatePreference);
    return () => preference.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    if (images.length < 2 || paused || prefersReducedMotion) return;
    const timer = window.setInterval(
      () => setActiveIndex((current) => (current + 1) % images.length),
      5000,
    );
    return () => window.clearInterval(timer);
  }, [images.length, paused, prefersReducedMotion]);

  function showImage(offset: number) {
    setActiveIndex((current) => (current + offset + images.length) % images.length);
  }

  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="absolute -top-5 -right-3 size-20 rounded-full border border-[var(--color-primary)]/30 sm:-right-5 sm:size-28" />
      <div
        role="region"
        aria-roledescription={images.length > 1 ? 'carrossel' : undefined}
        aria-label="Apresentação da loja"
        className="relative aspect-square overflow-hidden rounded-[48%_48%_1.5rem_1.5rem] bg-[#eee6dc] shadow-sm"
      >
        {images.length === 0 ? (
          <NecklaceIllustration />
        ) : (
          <>
            <Image
              key={images[activeIndex]}
              src={images[activeIndex]}
              alt={`${storeName} — imagem ${activeIndex + 1} de ${images.length}`}
              fill
              priority={activeIndex === 0}
              sizes="(min-width: 1024px) 40vw, (min-width: 640px) 70vw, 100vw"
              className="object-cover"
            />
            {images.length > 1 && (
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/65 to-transparent px-4 pt-12 pb-4 text-white">
                <button
                  type="button"
                  aria-label="Imagem anterior"
                  onClick={() => showImage(-1)}
                  className="flex size-9 items-center justify-center rounded-full bg-black/35 text-lg hover:bg-black/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  ‹
                </button>
                <div
                  role="group"
                  aria-label={`Imagem ${activeIndex + 1} de ${images.length}`}
                  className="flex items-center gap-2"
                >
                  {images.map((image, index) => (
                    <button
                      key={image}
                      type="button"
                      aria-label={`Mostrar imagem ${index + 1}`}
                      aria-current={index === activeIndex ? 'true' : undefined}
                      onClick={() => setActiveIndex(index)}
                      className={`size-2 rounded-full transition ${
                        index === activeIndex ? 'bg-white' : 'bg-white/55 hover:bg-white/80'
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  aria-label="Próxima imagem"
                  onClick={() => showImage(1)}
                  className="flex size-9 items-center justify-center rounded-full bg-black/35 text-lg hover:bg-black/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                >
                  ›
                </button>
                <button
                  type="button"
                  aria-label={
                    prefersReducedMotion
                      ? 'Avanço automático desativado pela preferência de movimento reduzido'
                      : paused
                        ? 'Retomar avanço automático'
                        : 'Pausar avanço automático'
                  }
                  disabled={prefersReducedMotion}
                  onClick={() => setPaused((current) => !current)}
                  className="flex size-9 items-center justify-center rounded-full bg-black/35 text-sm hover:bg-black/55 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {paused || prefersReducedMotion ? '▶' : 'Ⅱ'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
      <div className="absolute -bottom-4 -left-2 rounded-full border border-[#e7ddd0] bg-[var(--color-background)] px-4 py-2 text-xs tracking-wide text-current/70 shadow-sm sm:-left-5">
        Identidade · autoestima · momentos
      </div>
    </div>
  );
}
