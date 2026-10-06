import 'server-only';
import { createClient } from '@/lib/supabase/server';
import { sniffImageType } from './image-type';

export type Bucket = 'product-images' | 'store-assets';

const RULES: Record<Bucket, { maxBytes: number; types: Record<string, string> }> = {
  'product-images': {
    maxBytes: 5 * 1024 * 1024,
    types: { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/avif': 'avif' },
  },
  'store-assets': {
    maxBytes: 2 * 1024 * 1024,
    types: {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/x-icon': 'ico',
      'image/vnd.microsoft.icon': 'ico',
    },
  },
};

export class UploadError extends Error {}

/**
 * Upload com a sessão do admin (RLS de storage.objects exige is_admin()).
 * Nome do arquivo é gerado no servidor: o nome original nunca é usado no path.
 */
export async function uploadImage(bucket: Bucket, file: File, prefix: string): Promise<string> {
  const rule = RULES[bucket];
  if (file.size === 0) throw new UploadError('Arquivo vazio');
  if (file.size > rule.maxBytes)
    throw new UploadError(`Arquivo maior que ${rule.maxBytes / 1024 / 1024} MB`);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = sniffImageType(bytes);
  const ext = detected ? rule.types[detected] : undefined;
  if (!detected || !ext) throw new UploadError('Formato de imagem não permitido');

  const path = `${prefix}/${crypto.randomUUID()}.${ext}`;
  const supabase = await createClient();
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, { contentType: detected, cacheControl: '31536000', upsert: false });
  if (error) throw new UploadError('Falha no upload da imagem');

  return supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl;
}

/** Remove arquivo antigo a partir da URL pública (ignora URLs de outros hosts/buckets). */
export async function removeImageByUrl(bucket: Bucket, url: string | null | undefined) {
  if (!url) return;
  const marker = `/storage/v1/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return;
  const supabase = await createClient();
  await supabase.storage.from(bucket).remove([url.slice(idx + marker.length)]);
}

export function getFile(form: FormData, name: string): File | null {
  const value = form.get(name);
  return value instanceof File && value.size > 0 ? value : null;
}
