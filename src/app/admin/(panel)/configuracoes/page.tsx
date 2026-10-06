import { notFound } from 'next/navigation';
import { SettingsForm } from '@/components/admin/settings-form';
import { getStoreSettings } from '@/lib/services/store-settings.service';

export const metadata = { title: 'Configurações' };

export default async function SettingsPage() {
  const settings = await getStoreSettings();
  if (!settings) notFound();
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Configurações da loja</h1>
      <SettingsForm settings={settings} />
    </div>
  );
}
