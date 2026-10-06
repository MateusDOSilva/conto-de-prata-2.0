import { describe, expect, it } from 'vitest';
import { normalizeBrazilPhone } from './phone';

describe('normalizeBrazilPhone', () => {
  it.each([
    ['(21) 99999-9999', '21999999999'],
    ['+55 21 99999-9999', '21999999999'],
    ['21 3333-4444', '2133334444'],
  ])('%s → %s', (input, out) => expect(normalizeBrazilPhone(input)).toBe(out));

  it.each(['123', '(21) 89999-9999', '(01) 99999-9999', '219999999999999'])('%s é inválido', (i) =>
    expect(normalizeBrazilPhone(i)).toBeNull(),
  );
});
