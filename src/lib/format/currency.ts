const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** Formata valores vindos do Postgres (NUMERIC chega como number ou string). */
export function formatBRL(value: number | string): string {
  return brl.format(typeof value === 'string' ? Number(value) : value).replace(/\u00a0/g, ' ');
}
