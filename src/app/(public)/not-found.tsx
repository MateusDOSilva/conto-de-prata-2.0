import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-serif text-3xl">Página não encontrada</h1>
      <p className="mt-3 text-current/70">
        O produto ou página que você procura não está disponível.
      </p>
      <Link href="/produtos" className="mt-8 inline-block underline">
        Ver catálogo
      </Link>
    </div>
  );
}
