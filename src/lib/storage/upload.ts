import 'server-only';
import { createClient } from '@/lib/supabase/server';

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

/** Assinaturas binárias: não confiamos no Content-Type enviado pelo navegador. */
function sniff(bytes: Uint8Array): string | null {
  const at = (i: number, ...sig: number[]) => sig.every((b, j) => bytes[i + j] === b);
  if (at(0, 0xff, 0xd8, 0xff)) return 'image/jpeg';
  if (at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return 'image/png';
  if (at(0, 0x52, 0x49, 0x46, 0x46) && at(8, 0x57, 0x45, 0x42, 0x50)) return 'image/webp';
  if (at(4, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66)) return 'image/avif';
  if (at(0, 0x00, 0x00, 0x01, 0x00)) return 'image/x-icon';
  return null;
}

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
  const detected = sniff(bytes);
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
