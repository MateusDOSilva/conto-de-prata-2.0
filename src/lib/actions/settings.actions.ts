'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-admin';
import { getStoreSettings, updateStoreSettings } from '@/lib/services/store-settings.service';
import { getFile, removeImageByUrl, uploadImage, UploadError } from '@/lib/storage/upload';
import { StoreSettingsSchema } from '@/lib/validations/store-settings';
import { type ActionState, fieldErrorsFrom } from './action-result';

const FIELDS = [
  'store_name',
  'description',
  'primary_color',
  'secondary_color',
  'background_color',
  'text_color',
  'whatsapp_number',
  'instagram_url',
  'facebook_url',
  'tiktok_url',
  'youtube_url',
  'linkedin_url',
] as const;

export async function saveSettingsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = Object.fromEntries(FIELDS.map((f) => [f, String(form.get(f) ?? '')]));
  const parsed = StoreSettingsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  const current = await getStoreSettings();
  const uploaded: { logo_url?: string; favicon_url?: string } = {};
  try {
    const logo = getFile(form, 'logo');
    const favicon = getFile(form, 'favicon');
    if (logo) uploaded.logo_url = await uploadImage('store-assets', logo, 'logo');
    if (favicon) uploaded.favicon_url = await uploadImage('store-assets', favicon, 'favicon');
    await updateStoreSettings({ ...parsed.data, ...uploaded });
  } catch (e) {
    await Promise.all(Object.values(uploaded).map((u) => removeImageByUrl('store-assets', u)));
    if (e instanceof UploadError) return { ok: false, message: e.message };
    throw e;
  }
  if (uploaded.logo_url) await removeImageByUrl('store-assets', current?.logo_url);
  if (uploaded.favicon_url) await removeImageByUrl('store-assets', current?.favicon_url);

  revalidatePath('/', 'layout');
  return { ok: true, message: 'Configurações salvas.' };
}
