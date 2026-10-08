import { z } from 'zod';
import { SocialLinksSchema } from './social-links';
import { cleanText } from './text';

const HexColor = z
  .string()
  .trim()
  .optional()
  .transform((v) => (v ? v : null))
  .pipe(
    z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor no formato #RRGGBB')
      .nullable(),
  );

export const WhatsAppNumberSchema = z
  .string()
  .transform((v) => v.replace(/\D/g, ''))
  .pipe(z.string().regex(/^[1-9][0-9]{9,14}$/, 'Número com DDI e DDD, ex.: 5521999999999'));

export const StoreSettingsSchema = z
  .object({
    store_name: z.string().transform(cleanText).pipe(z.string().min(1, 'Informe o nome').max(80)),
    presentation_title: z
      .string()
      .transform(cleanText)
      .pipe(z.string().min(1, 'Informe o título').max(120)),
    description: z
      .string()
      .optional()
      .transform((v) => (v ? cleanText(v) : null))
      .pipe(z.string().max(500).nullable()),
    primary_color: HexColor,
    secondary_color: HexColor,
    background_color: HexColor,
    text_color: HexColor,
    whatsapp_number: WhatsAppNumberSchema,
  })
  .extend(SocialLinksSchema.shape);

export type StoreSettingsInput = z.infer<typeof StoreSettingsSchema>;
