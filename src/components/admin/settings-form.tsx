'use client';

import Image from 'next/image';
import { useActionState } from 'react';
import { saveSettingsAction } from '@/lib/actions/settings.actions';
import type { StoreSettings } from '@/lib/services/store-settings.service';
import { SOCIAL_NETWORKS, type SocialNetworkKey } from '@/lib/validations/social-links';
import { Field, FormMessage, inputClass, SubmitButton } from './ui';

const COLORS = [
  ['primary_color', 'Cor principal', '#B08D57'],
  ['secondary_color', 'Cor secundária', '#1F1F1F'],
  ['background_color', 'Fundo', '#FAF7F2'],
  ['text_color', 'Texto', '#2B2B2B'],
] as const;

export function SettingsForm({ settings }: { settings: StoreSettings }) {
  const [state, action] = useActionState(saveSettingsAction, {});
  return (
    <form action={action} className="grid max-w-2xl gap-8">
      <fieldset className="grid gap-4">
        <legend className="mb-2 text-lg font-semibold">Loja</legend>
        <Field label="Nome da loja" name="store_name" state={state}>
          <input
            id="store_name"
            name="store_name"
            required
            maxLength={80}
            defaultValue={settings.store_name}
            className={inputClass}
          />
        </Field>
        <Field label="Descrição" name="description" state={state}>
          <textarea
            id="description"
            name="description"
            rows={3}
            maxLength={500}
            defaultValue={settings.description ?? ''}
            className={inputClass}
          />
        </Field>
        <Field
          label="WhatsApp da loja"
          name="whatsapp_number"
          state={state}
          hint="Com DDI e DDD, só números. Ex.: 5521999999999"
        >
          <input
            id="whatsapp_number"
            name="whatsapp_number"
            required
            inputMode="numeric"
            defaultValue={settings.whatsapp_number}
            className={inputClass}
          />
        </Field>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-2 text-lg font-semibold">Aparência</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          {COLORS.map(([name, label, fallback]) => (
            <Field key={name} label={label} name={name} state={state}>
              <input
                id={name}
                name={name}
                type="color"
                defaultValue={settings[name] ?? fallback}
                className="mt-1 h-10 w-full cursor-pointer rounded-lg border border-neutral-300"
              />
            </Field>
          ))}
        </div>
        <Field label="Logo" name="logo" hint="PNG, JPG ou WebP, até 2 MB.">
          {settings.logo_url && (
            <Image
              src={settings.logo_url}
              alt=""
              width={64}
              height={64}
              className="my-2 size-16 rounded-full object-cover"
            />
          )}
          <input
            id="logo"
            name="logo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="mt-1 block text-sm"
          />
        </Field>
        <Field label="Favicon" name="favicon" hint="ICO ou PNG, até 2 MB.">
          <input
            id="favicon"
            name="favicon"
            type="file"
            accept="image/x-icon,image/png"
            className="mt-1 block text-sm"
          />
        </Field>
      </fieldset>

      <fieldset className="grid gap-4">
        <legend className="mb-2 text-lg font-semibold">Redes sociais</legend>
        <p className="text-xs text-neutral-500">
          Somente links https:// do domínio de cada rede. Deixe vazio para ocultar.
        </p>
        {(Object.keys(SOCIAL_NETWORKS) as SocialNetworkKey[]).map((key) => (
          <Field key={key} label={SOCIAL_NETWORKS[key].label} name={key} state={state}>
            <input
              id={key}
              name={key}
              type="url"
              inputMode="url"
              placeholder="https://"
              defaultValue={settings[key] ?? ''}
              className={inputClass}
            />
          </Field>
        ))}
      </fieldset>

      <FormMessage state={state} />
      <div>
        <SubmitButton>Salvar configurações</SubmitButton>
      </div>
    </form>
  );
}
