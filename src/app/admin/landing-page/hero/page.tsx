'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ImageIcon,
  LoaderCircle,
  Save,
  Trash2,
  Upload,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'

const STORAGE_BUCKET = 'article-images'

type HomepageSettings = {
  id: string
  hero_badge: string
  hero_title: string
  hero_highlight: string
  hero_description: string
  hero_image_url: string
  hero_primary_button_label: string
  hero_primary_button_href: string
  hero_secondary_button_label: string
  hero_secondary_button_href: string
}

const initialForm: HomepageSettings = {
  id: '',
  hero_badge: '',
  hero_title: '',
  hero_highlight: '',
  hero_description: '',
  hero_image_url: '',
  hero_primary_button_label: '',
  hero_primary_button_href: '',
  hero_secondary_button_label: '',
  hero_secondary_button_href: '',
}

export default function HeroSettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [form, setForm] =
    useState<HomepageSettings>(initialForm)

  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingImage, setIsUploadingImage] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null)

  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true)
      setErrorMessage(null)

      const { data, error } = await supabase
        .from('homepage_settings')
        .select(`
          id,
          hero_badge,
          hero_title,
          hero_highlight,
          hero_description,
          hero_image_url,
          hero_primary_button_label,
          hero_primary_button_href,
          hero_secondary_button_label,
          hero_secondary_button_href
        `)
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error(
          'Failed to load homepage settings:',
          error,
        )

        setErrorMessage(
          'Gagal memuat pengaturan Hero.',
        )

        setIsLoading(false)
        return
      }

      if (data) {
        setForm({
          id: data.id,
          hero_badge: data.hero_badge ?? '',
          hero_title: data.hero_title ?? '',
          hero_highlight:
            data.hero_highlight ?? '',
          hero_description:
            data.hero_description ?? '',
          hero_image_url:
            data.hero_image_url ?? '',
          hero_primary_button_label:
            data.hero_primary_button_label ?? '',
          hero_primary_button_href:
            data.hero_primary_button_href ?? '',
          hero_secondary_button_label:
            data.hero_secondary_button_label ?? '',
          hero_secondary_button_href:
            data.hero_secondary_button_href ?? '',
        })
      }

      setIsLoading(false)
    }

    void loadSettings()
  }, [])

  function updateField(
    field: keyof HomepageSettings,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleImageChange(
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0]

    if (!file) {
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)

    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
    ]

    if (!allowedTypes.includes(file.type)) {
      setErrorMessage(
        'Format gambar harus JPG, PNG, atau WEBP.',
      )

      event.target.value = ''
      return
    }

    const maxFileSize = 5 * 1024 * 1024

    if (file.size > maxFileSize) {
      setErrorMessage(
        'Ukuran gambar maksimal 5 MB.',
      )

      event.target.value = ''
      return
    }

    setIsUploadingImage(true)

    const fileExtension =
      file.name.split('.').pop()?.toLowerCase() ||
      'jpg'

    const fileName =
      `hero-${Date.now()}-${crypto.randomUUID()}.${fileExtension}`

    const filePath =
      `homepage/hero/${fileName}`

    const { error: uploadError } =
      await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        })

    if (uploadError) {
      console.error(
        'Failed to upload hero image:',
        uploadError,
      )

      setErrorMessage(
        'Gagal mengupload foto. Silakan coba lagi.',
      )

      setIsUploadingImage(false)
      event.target.value = ''
      return
    }

    const {
      data: { publicUrl },
    } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath)

    setForm((current) => ({
      ...current,
      hero_image_url: publicUrl,
    }))

    setSuccessMessage(
      'Foto berhasil diupload. Jangan lupa simpan perubahan.',
    )

    setIsUploadingImage(false)
    event.target.value = ''
  }

  function handleRemoveImage() {
    setForm((current) => ({
      ...current,
      hero_image_url: '',
    }))

    setSuccessMessage(
      'Foto dihapus dari pengaturan. Klik Simpan perubahan untuk menerapkan.',
    )
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!form.id) {
      setErrorMessage(
        'Data pengaturan Hero tidak ditemukan.',
      )

      return
    }

    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const { error } = await supabase
      .from('homepage_settings')
      .update({
        hero_badge: form.hero_badge.trim(),
        hero_title: form.hero_title.trim(),
        hero_highlight:
          form.hero_highlight.trim(),
        hero_description:
          form.hero_description.trim() || null,
        hero_image_url:
          form.hero_image_url.trim() || null,
        hero_primary_button_label:
          form.hero_primary_button_label.trim(),
        hero_primary_button_href:
          form.hero_primary_button_href.trim(),
        hero_secondary_button_label:
          form.hero_secondary_button_label.trim() ||
          null,
        hero_secondary_button_href:
          form.hero_secondary_button_href.trim() ||
          null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', form.id)

    if (error) {
      console.error(
        'Failed to update homepage settings:',
        error,
      )

      setErrorMessage(
        'Gagal menyimpan perubahan. Silakan coba lagi.',
      )

      setIsSaving(false)
      return
    }

    setSuccessMessage(
      'Perubahan Hero berhasil disimpan.',
    )

    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex min-h-[60vh] w-full max-w-6xl items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <LoaderCircle
              size={20}
              className="animate-spin"
            />

            Memuat pengaturan Hero...
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <Link
              href="/admin/landing-page"
              className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              <ArrowLeft size={17} />
              Kembali ke Landing Page
            </Link>

            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
              Section 01
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              Hero Section
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
              Atur teks, foto, dan tombol yang tampil
              pertama kali saat pengunjung membuka
              Suara Wanita.
            </p>
          </div>

          <button
            type="submit"
            form="hero-settings-form"
            disabled={isSaving || isUploadingImage}
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
          id="hero-settings-form"
          onSubmit={handleSubmit}
          className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.8fr)]"
        >
          <div className="space-y-6">
            <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Konten Hero
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Teks utama yang tampil di sisi kiri
                  Hero.
                </p>
              </div>

              <div className="mt-6 space-y-5">
                <Field
                  label="Badge / Label kecil"
                  value={form.hero_badge}
                  onChange={(value) =>
                    updateField(
                      'hero_badge',
                      value,
                    )
                  }
                  placeholder="THE BEAUTY EDIT"
                />

                <Field
                  label="Judul utama"
                  value={form.hero_title}
                  onChange={(value) =>
                    updateField(
                      'hero_title',
                      value,
                    )
                  }
                  placeholder="Your beauty,"
                />

                <Field
                  label="Highlight judul"
                  value={form.hero_highlight}
                  onChange={(value) =>
                    updateField(
                      'hero_highlight',
                      value,
                    )
                  }
                  placeholder="your rules."
                />

                <TextAreaField
                  label="Deskripsi"
                  value={form.hero_description}
                  onChange={(value) =>
                    updateField(
                      'hero_description',
                      value,
                    )
                  }
                  placeholder="Tulis deskripsi Hero..."
                />
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
                  <ImageIcon size={20} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-text-primary">
                    Foto Hero
                  </h2>

                  <p className="text-sm text-text-secondary">
                    Upload foto langsung dari perangkat
                    atau galeri HP.
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  void handleImageChange(event)
                }}
                className="hidden"
              />

              {form.hero_image_url ? (
                <div className="mt-6">
                  <div className="relative overflow-hidden rounded-3xl border border-border bg-surface-muted">
                    <img
                      src={form.hero_image_url}
                      alt="Foto Hero"
                      className="aspect-4/5 w-full object-cover"
                    />

                    {isUploadingImage ? (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <div className="flex items-center gap-2 rounded-xl bg-surface px-4 py-3 text-sm font-medium text-text-primary">
                          <LoaderCircle
                            size={18}
                            className="animate-spin"
                          />
                          Mengupload foto...
                        </div>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={() =>
                        fileInputRef.current?.click()
                      }
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Upload size={17} />
                      Ganti foto
                    </button>

                    <button
                      type="button"
                      disabled={isUploadingImage}
                      onClick={handleRemoveImage}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-border px-4 text-sm font-semibold text-text-secondary transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <Trash2 size={17} />
                      Hapus
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isUploadingImage}
                  onClick={() =>
                    fileInputRef.current?.click()
                  }
                  className="mt-6 flex min-h-56 w-full flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-border bg-background px-5 py-8 text-center transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUploadingImage ? (
                    <>
                      <LoaderCircle
                        size={26}
                        className="animate-spin text-secondary"
                      />

                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          Mengupload foto...
                        </p>

                        <p className="mt-1 text-xs text-text-muted">
                          Mohon tunggu sebentar.
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
                        <Upload size={24} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-text-primary">
                          Pilih foto Hero
                        </p>

                        <p className="mt-1 text-xs leading-5 text-text-muted">
                          JPG, PNG, atau WEBP. Maksimal
                          5 MB.
                        </p>
                      </div>
                    </>
                  )}
                </button>
              )}
            </section>

            <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Tombol utama
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Tombol utama yang paling menonjol
                  pada Hero.
                </p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Teks tombol"
                  value={
                    form.hero_primary_button_label
                  }
                  onChange={(value) =>
                    updateField(
                      'hero_primary_button_label',
                      value,
                    )
                  }
                  placeholder="Explore beauty"
                />

                <Field
                  label="Link tombol"
                  value={
                    form.hero_primary_button_href
                  }
                  onChange={(value) =>
                    updateField(
                      'hero_primary_button_href',
                      value,
                    )
                  }
                  placeholder="/reviews atau #discover"
                />
              </div>
            </section>

            <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
              <div>
                <h2 className="text-lg font-semibold text-text-primary">
                  Tombol kedua
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Opsional. Kosongkan jika tombol kedua
                  tidak ingin ditampilkan.
                </p>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <Field
                  label="Teks tombol"
                  value={
                    form.hero_secondary_button_label
                  }
                  onChange={(value) =>
                    updateField(
                      'hero_secondary_button_label',
                      value,
                    )
                  }
                  placeholder="Lihat review"
                />

                <Field
                  label="Link tombol"
                  value={
                    form.hero_secondary_button_href
                  }
                  onChange={(value) =>
                    updateField(
                      'hero_secondary_button_href',
                      value,
                    )
                  }
                  placeholder="/reviews"
                />
              </div>
            </section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-border bg-surface">
              <div className="border-b border-border px-5 py-4 sm:px-6">
                <p className="text-sm font-semibold text-text-primary">
                  Preview konten
                </p>

                <p className="mt-1 text-xs text-text-muted">
                  Gambaran isi Hero saat ini.
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <div className="relative overflow-hidden rounded-3xl bg-primary-soft p-5 sm:p-6">
                  <div className="absolute -right-10 -top-10 size-32 rounded-full bg-secondary/20" />

                  <div className="relative">
                    <span className="inline-flex rounded-full border border-border bg-surface px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-text-primary">
                      {form.hero_badge || 'Badge'}
                    </span>

                    <h3 className="mt-5 text-3xl font-semibold tracking-tight text-text-primary">
                      {form.hero_title || 'Judul Hero'}{' '}

                      <span className="relative inline-block">
                        {form.hero_highlight ||
                          'Highlight'}

                        <span className="absolute bottom-0 left-0 z-0 h-2 w-full rounded-full bg-primary" />
                      </span>
                    </h3>

                    <p className="mt-4 text-sm leading-6 text-text-secondary">
                      {form.hero_description ||
                        'Deskripsi Hero akan tampil di sini.'}
                    </p>

                    <div className="mt-6 flex flex-col gap-2">
                      <div className="rounded-xl bg-primary px-4 py-3 text-center text-sm font-semibold text-text-primary">
                        {form.hero_primary_button_label ||
                          'Tombol utama'}
                      </div>

                      {form.hero_secondary_button_label ? (
                        <div className="rounded-xl border border-border bg-surface px-4 py-3 text-center text-sm font-semibold text-text-primary">
                          {
                            form.hero_secondary_button_label
                          }
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>

                {form.hero_image_url ? (
                  <div className="mt-5">
                    <p className="mb-2 text-xs font-medium text-text-muted">
                      Foto saat ini
                    </p>

                    <div className="overflow-hidden rounded-2xl border border-border bg-surface-muted">
                      <img
                        src={form.hero_image_url}
                        alt="Preview Hero"
                        className="aspect-4/5 w-full object-cover"
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </aside>
        </form>
      </div>
    </main>
  )
}

type FieldProps = {
  label: string
  value: string
  placeholder?: string
  type?: 'text' | 'url'
  onChange: (value: string) => void
}

function Field({
  label,
  value,
  placeholder,
  type = 'text',
  onChange,
}: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-text-primary">
        {label}
      </span>

      <input
        type={type}
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
        rows={5}
        className="mt-2 w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-secondary"
      />
    </label>
  )
}