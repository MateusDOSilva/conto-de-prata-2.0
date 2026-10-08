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
        <Field label="Título da apresentação" name="presentation_title" state={state}>
          <input
            id="presentation_title"
            name="presentation_title"
            required
            maxLength={120}
            defaultValue={settings.presentation_title}
            className={inputClass}
          />
        </Field>
        <Field
          label="Texto da apresentação"
          name="description"
          state={state}
          hint="Exibido abaixo do título na página inicial."
        >
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
          label="Imagens da apresentação"
          name="presentation_images"
          hint="Escolha até 3 fotos. JPG, PNG ou WebP, até 2 MB cada e 5 MB no total."
        >
          {settings.presentation_images.length > 0 && (
            <div className="my-2 flex flex-wrap gap-2">
              {settings.presentation_images.map((url) => (
                <Image
                  key={url}
                  src={url}
                  alt=""
                  width={96}
                  height={96}
                  className="size-24 rounded-lg object-cover"
                />
              ))}
            </div>
          )}
          <div className="mt-2">
            <input
              id="presentation_images"
              name="presentation_images"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="peer sr-only"
            />
            <label
              htmlFor="presentation_images"
              className="inline-flex cursor-pointer items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-neutral-900 hover:bg-neutral-700"
            >
              {settings.presentation_images.length > 0 ? 'Trocar fotos' : 'Adicionar fotos'}
            </label>
          </div>
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
          <div className="mt-2">
            <input
              id="logo"
              name="logo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="peer sr-only"
            />
            <label
              htmlFor="logo"
              className="inline-flex cursor-pointer items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-neutral-900 hover:bg-neutral-700"
            >
              {settings.logo_url ? 'Trocar logo' : 'Adicionar logo'}
            </label>
          </div>
        </Field>
        <Field label="Favicon" name="favicon" hint="ICO ou PNG, até 2 MB.">
          {settings.favicon_url && (
            <p className="mt-2 text-xs text-neutral-500">Favicon atual configurado.</p>
          )}
          <div className="mt-2">
            <input
              id="favicon"
              name="favicon"
              type="file"
              accept="image/x-icon,image/png"
              className="peer sr-only"
            />
            <label
              htmlFor="favicon"
              className="inline-flex cursor-pointer items-center rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-neutral-900 hover:bg-neutral-700"
            >
              {settings.favicon_url ? 'Trocar favicon' : 'Adicionar favicon'}
            </label>
          </div>
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
