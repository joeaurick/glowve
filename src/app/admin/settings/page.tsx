'use client'

import { useEffect, useState } from 'react'
import {
  Globe,
  LoaderCircle,
  Save,
  Search,
  Store,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'

type SiteSettings = {
  id: string
  brand_name: string
  site_title: string
  site_description: string
  google_site_verification: string
}

const initialForm: SiteSettings = {
  id: '',
  brand_name: '',
  site_title: '',
  site_description: '',
  google_site_verification: '',
}

export default function SettingsPage() {
  const [form, setForm] =
    useState<SiteSettings>(initialForm)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null)

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true)
      setErrorMessage(null)

      const { data, error } = await supabase
        .from('site_settings')
        .select(`
          id,
          brand_name,
          site_title,
          site_description,
          google_site_verification
        `)
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error(
          'Failed to load site settings:',
          error,
        )

        setErrorMessage(
          'Gagal memuat pengaturan website.',
        )

        setIsLoading(false)
        return
      }

      if (data) {
        setForm({
          id: data.id,
          brand_name: data.brand_name ?? '',
          site_title: data.site_title ?? '',
          site_description:
            data.site_description ?? '',
          google_site_verification:
            data.google_site_verification ?? '',
        })
      }

      setIsLoading(false)
    }

    void loadSettings()
  }, [])

  function updateField(
    field: keyof SiteSettings,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!form.id) {
      setErrorMessage(
        'Data pengaturan website tidak ditemukan.',
      )
      return
    }

    if (!form.brand_name.trim()) {
      setErrorMessage(
        'Nama brand tidak boleh kosong.',
      )
      return
    }

    if (!form.site_title.trim()) {
      setErrorMessage(
        'Judul website tidak boleh kosong.',
      )
      return
    }

    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const { error } = await supabase
      .from('site_settings')
      .update({
        brand_name: form.brand_name.trim(),
        site_title: form.site_title.trim(),
        site_description:
          form.site_description.trim() || null,
        google_site_verification:
          form.google_site_verification.trim() ||
          null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', form.id)

    if (error) {
      console.error(
        'Failed to update site settings:',
        error,
      )

      setErrorMessage(
        'Gagal menyimpan pengaturan website.',
      )

      setIsSaving(false)
      return
    }

    setSuccessMessage(
      'Pengaturan website berhasil disimpan.',
    )

    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex min-h-[60vh] w-full max-w-4xl items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <LoaderCircle
              size={20}
              className="animate-spin"
            />

            Memuat pengaturan...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-4xl">
        <div className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Website Settings
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              Pengaturan Website
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
              Atur identitas brand dan metadata
              website dari satu tempat.
            </p>
          </div>

          <button
            type="submit"
            form="site-settings-form"
            disabled={isSaving}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-text-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSaving ? (
              <>
                <LoaderCircle
                  size={18}
                  className="animate-spin"
                />

                Menyimpan...
              </>
            ) : (
              <>
                <Save size={18} />

                Simpan perubahan
              </>
            )}
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-6 rounded-2xl border border-border bg-primary-soft px-4 py-3 text-sm font-medium text-text-primary">
            {successMessage}
          </div>
        ) : null}

        <form
          id="site-settings-form"
          onSubmit={handleSubmit}
          className="mt-8 space-y-6"
        >
          <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
                <Store size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Identitas Brand
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Nama utama yang digunakan pada
                  website Glowvé.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Field
                label="Nama Brand"
                value={form.brand_name}
                onChange={(value) =>
                  updateField(
                    'brand_name',
                    value,
                  )
                }
                placeholder="GLOWVÉ"
              />
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
                <Globe size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Metadata Website
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Informasi yang digunakan untuk
                  judul dan deskripsi website.
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <Field
                label="Judul Website"
                value={form.site_title}
                onChange={(value) =>
                  updateField(
                    'site_title',
                    value,
                  )
                }
                placeholder="GLOWVÉ"
              />

              <TextAreaField
                label="Meta Description"
                value={form.site_description}
                onChange={(value) =>
                  updateField(
                    'site_description',
                    value,
                  )
                }
                placeholder="Deskripsi singkat website..."
              />
            </div>
          </section>

          <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
            <div className="flex items-center gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
                <Search size={20} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Google Search Console
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Masukkan kode verifikasi dari Google
                  Search Console.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <Field
                label="Google Site Verification"
                value={form.google_site_verification}
                onChange={(value) =>
                  updateField(
                    'google_site_verification',
                    value,
                  )
                }
                placeholder="Contoh: abc123xyz"
              />

              <p className="mt-3 text-xs leading-5 text-text-muted">
                Masukkan hanya isi dari atribut
                <code className="mx-1 rounded bg-background px-1.5 py-0.5">
                  content
                </code>
                , bukan seluruh tag meta.
              </p>
            </div>
          </section>
        </form>
      </div>
    </main>
  )
}

type FieldProps = {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

function Field({
  label,
  value,
  placeholder,
  onChange,
}: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text-primary">
        {label}
      </span>

      <input
        type="text"
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-secondary"
      />
    </label>
  )
}

type TextAreaFieldProps = {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

function TextAreaField({
  label,
  value,
  placeholder,
  onChange,
}: TextAreaFieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text-primary">
        {label}
      </span>

      <textarea
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        rows={4}
        className="mt-2 w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-secondary"
      />
    </label>
  )
}