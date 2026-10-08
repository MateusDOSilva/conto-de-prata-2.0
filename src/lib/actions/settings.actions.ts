'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth/require-admin';
import { getStoreSettings, updateStoreSettings } from '@/lib/services/store-settings.service';
import {
  getFile,
  getFiles,
  removeImageByUrl,
  uploadImage,
  UploadError,
} from '@/lib/storage/upload';
import { StoreSettingsSchema } from '@/lib/validations/store-settings';
import { type ActionState, fieldErrorsFrom } from './action-result';

const FIELDS = [
  'store_name',
  'presentation_title',
  'description',
  'primary_color',
  'secondary_color',
  'background_color',
  'text_color',
  'whatsapp_number',
  'instagram_url',
  'facebook_url',
  'tiktok_url',
] as const;

export async function saveSettingsAction(_prev: ActionState, form: FormData): Promise<ActionState> {
  await requireAdmin();
  const raw = Object.fromEntries(FIELDS.map((f) => [f, String(form.get(f) ?? '')]));
  const parsed = StoreSettingsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, fieldErrors: fieldErrorsFrom(parsed.error) };

  const current = await getStoreSettings();
  const uploaded: {
    logo_url?: string;
    favicon_url?: string;
    presentation_images?: string[];
  } = {};
  const uploadedPresentationImages: string[] = [];
  try {
    const logo = getFile(form, 'logo');
    const favicon = getFile(form, 'favicon');
    const presentationImages = getFiles(form, 'presentation_images');
    if (presentationImages.length > 3)
      return { ok: false, message: 'Adicione no máximo 3 imagens à apresentação.' };
    if (presentationImages.reduce((total, image) => total + image.size, 0) > 5 * 1024 * 1024)
      return { ok: false, message: 'O total das imagens da apresentação não pode passar de 5 MB.' };
    if (logo) uploaded.logo_url = await uploadImage('store-assets', logo, 'logo');
    if (favicon) uploaded.favicon_url = await uploadImage('store-assets', favicon, 'favicon');
    for (const image of presentationImages)
      uploadedPresentationImages.push(await uploadImage('store-assets', image, 'presentation'));
    if (uploadedPresentationImages.length > 0)
      uploaded.presentation_images = uploadedPresentationImages;
    await updateStoreSettings({ ...parsed.data, ...uploaded });
  } catch (e) {
    await Promise.all([
      ...Object.values(uploaded)
        .filter((value): value is string => typeof value === 'string')
        .map((url) => removeImageByUrl('store-assets', url)),
      ...uploadedPresentationImages.map((url) => removeImageByUrl('store-assets', url)),
    ]);
    if (e instanceof UploadError) return { ok: false, message: e.message };
    throw e;
  }
  if (uploaded.logo_url) await removeImageByUrl('store-assets', current?.logo_url);
  if (uploaded.favicon_url) await removeImageByUrl('store-assets', current?.favicon_url);
  if (uploaded.presentation_images)
    await Promise.all(
      (current?.presentation_images ?? []).map((url) => removeImageByUrl('store-assets', url)),
    );

  revalidatePath('/', 'layout');
  return { ok: true, message: 'Configurações salvas.' };
}
