// Remove caracteres de controle (exceto quebra de linha) e espaços nas pontas.
const CONTROL_CHARS = /[\u0000-\u0009\u000B-\u001F\u007F]/g;

export function cleanText(value: string): string {
  return value.replace(CONTROL_CHARS, '').trim();
}
