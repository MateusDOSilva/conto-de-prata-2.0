import { z } from 'zod';

/** Normaliza telefone BR para só dígitos com DDD, sem DDI: 2199999999 ou 21999999999. */
export function normalizeBrazilPhone(input: string): string | null {
  let digits = input.replace(/\D/g, '');
  if ((digits.length === 12 || digits.length === 13) && digits.startsWith('55')) {
    digits = digits.slice(2);
  }
  if (digits.length !== 10 && digits.length !== 11) return null;
  const ddd = Number(digits.slice(0, 2));
  if (ddd < 11 || ddd > 99 || digits[1] === '0') return null;
  // celular (11 dígitos) começa com 9 após o DDD; fixo (10) começa com 2-5
  if (digits.length === 11 && digits[2] !== '9') return null;
  if (digits.length === 10 && !/[2-5]/.test(digits[2])) return null;
  return digits;
}

export const BrazilPhoneSchema = z
  .string()
  .trim()
  .transform((value, ctx) => {
    const normalized = normalizeBrazilPhone(value);
    if (!normalized) {
      ctx.addIssue({ code: 'custom', message: 'Informe um telefone válido com DDD' });
      return z.NEVER;
    }
    return normalized;
  });
