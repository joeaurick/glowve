'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ExternalLink,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'

type FooterSettings = {
  id: string
  description: string
  copyright_text: string
}

type FooterLink = {
  id: string
  label: string
  url: string
  icon: string
  sort_order: number
  is_active: boolean
}

const initialSettings: FooterSettings = {
  id: '',
  description: '',
  copyright_text: '',
}

const initialLinkForm = {
  label: '',
  url: '',
  icon: 'link',
  is_active: true,
}

export default function FooterSettingsPage() {
  const [settings, setSettings] =
    useState<FooterSettings>(initialSettings)

  const [links, setLinks] =
    useState<FooterLink[]>([])

  const [isLoading, setIsLoading] =
    useState(true)

  const [isSaving, setIsSaving] =
    useState(false)

  const [isSavingLink, setIsSavingLink] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null)

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null)

  const [isLinkFormOpen, setIsLinkFormOpen] =
    useState(false)

  const [editingLinkId, setEditingLinkId] =
    useState<string | null>(null)

  const [linkForm, setLinkForm] =
    useState(initialLinkForm)

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setErrorMessage(null)

      const [
        settingsResponse,
        linksResponse,
      ] = await Promise.all([
        supabase
          .from('footer_settings')
          .select(`
            id,
            description,
            copyright_text
          `)
          .limit(1)
          .maybeSingle(),

        supabase
          .from('footer_links')
          .select(`
            id,
            label,
            url,
            icon,
            sort_order,
            is_active
          `)
          .order('sort_order', {
            ascending: true,
          }),
      ])

      if (settingsResponse.error) {
        console.error(
          'Failed to load footer settings:',
          settingsResponse.error,
        )

        setErrorMessage(
          'Gagal memuat pengaturan Footer.',
        )
      }

      if (linksResponse.error) {
        console.error(
          'Failed to load footer links:',
          linksResponse.error,
        )

        setErrorMessage(
          'Gagal memuat link Footer.',
        )
      }

      if (settingsResponse.data) {
        setSettings({
          id: settingsResponse.data.id,
          description:
            settingsResponse.data.description ??
            '',
          copyright_text:
            settingsResponse.data.copyright_text ??
            '',
        })
      }

      if (linksResponse.data) {
        setLinks(linksResponse.data)
      }

      setIsLoading(false)
    }

    void loadData()
  }, [])

  function updateSettings(
    field: 'description' | 'copyright_text',
    value: string,
  ) {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function updateLinkForm(
    field: keyof typeof initialLinkForm,
    value: string | boolean,
  ) {
    setLinkForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSaveSettings(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (!settings.id) {
      setErrorMessage(
        'Data pengaturan Footer tidak ditemukan.',
      )
      return
    }

    setIsSaving(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    const { error } = await supabase
      .from('footer_settings')
      .update({
        description:
          settings.description.trim() || null,
        copyright_text:
          settings.copyright_text.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', settings.id)

    if (error) {
      console.error(
        'Failed to save footer settings:',
        error,
      )

      setErrorMessage(
        'Gagal menyimpan pengaturan Footer.',
      )

      setIsSaving(false)
      return
    }

    setSuccessMessage(
      'Pengaturan Footer berhasil disimpan.',
    )

    setIsSaving(false)
  }

  function openCreateLinkForm() {
    setEditingLinkId(null)
    setLinkForm(initialLinkForm)
    setIsLinkFormOpen(true)
  }

  function openEditLinkForm(link: FooterLink) {
    setEditingLinkId(link.id)

    setLinkForm({
      label: link.label,
      url: link.url,
      icon: link.icon,
      is_active: link.is_active,
    })

    setIsLinkFormOpen(true)
  }

  function closeLinkForm() {
    setEditingLinkId(null)
    setLinkForm(initialLinkForm)
    setIsLinkFormOpen(false)
  }

  async function handleSaveLink(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    if (
      !linkForm.label.trim() ||
      !linkForm.url.trim()
    ) {
      setErrorMessage(
        'Nama dan URL link wajib diisi.',
      )
      return
    }

    setIsSavingLink(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    if (editingLinkId) {
      const { error } = await supabase
        .from('footer_links')
        .update({
          label: linkForm.label.trim(),
          url: linkForm.url.trim(),
          icon: linkForm.icon,
          is_active: linkForm.is_active,
          updated_at:
            new Date().toISOString(),
        })
        .eq('id', editingLinkId)

      if (error) {
        console.error(
          'Failed to update footer link:',
          error,
        )

        setErrorMessage(
          'Gagal memperbarui link.',
        )

        setIsSavingLink(false)
        return
      }

      setLinks((current) =>
        current.map((link) =>
          link.id === editingLinkId
            ? {
                ...link,
                label:
                  linkForm.label.trim(),
                url:
                  linkForm.url.trim(),
                icon: linkForm.icon,
                is_active:
                  linkForm.is_active,
              }
            : link,
        ),
      )

      setSuccessMessage(
        'Link berhasil diperbarui.',
      )
    } else {
      const nextSortOrder =
        links.length > 0
          ? Math.max(
              ...links.map(
                (link) => link.sort_order,
              ),
            ) + 1
          : 0

      const { data, error } = await supabase
        .from('footer_links')
        .insert({
          label: linkForm.label.trim(),
          url: linkForm.url.trim(),
          icon: linkForm.icon,
          is_active: linkForm.is_active,
          sort_order: nextSortOrder,
        })
        .select(`
          id,
          label,
          url,
          icon,
          sort_order,
          is_active
        `)
        .single()

      if (error) {
        console.error(
          'Failed to create footer link:',
          error,
        )

        setErrorMessage(
          'Gagal menambahkan link.',
        )

        setIsSavingLink(false)
        return
      }

      if (data) {
        setLinks((current) => [
          ...current,
          data,
        ])
      }

      setSuccessMessage(
        'Link baru berhasil ditambahkan.',
      )
    }

    setIsSavingLink(false)
    closeLinkForm()
  }

  async function handleDeleteLink(id: string) {
    const confirmed = window.confirm(
      'Hapus link ini dari Footer?',
    )

    if (!confirmed) {
      return
    }

    setErrorMessage(null)
    setSuccessMessage(null)

    const { error } = await supabase
      .from('footer_links')
      .delete()
      .eq('id', id)

    if (error) {
      console.error(
        'Failed to delete footer link:',
        error,
      )

      setErrorMessage(
        'Gagal menghapus link.',
      )
      return
    }

    setLinks((current) =>
      current.filter(
        (link) => link.id !== id,
      ),
    )

    setSuccessMessage(
      'Link berhasil dihapus.',
    )
  }

  if (isLoading) {
    return (
      <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="mx-auto flex min-h-[60vh] max-w-6xl items-center justify-center">
          <div className="flex items-center gap-3 text-sm text-text-secondary">
            <LoaderCircle
              size={20}
              className="animate-spin"
            />
            Memuat pengaturan Footer...
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
              Footer Settings
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              Atur Footer
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
              Kelola informasi Footer dan tambahkan
              link Instagram, TikTok, atau website
              lainnya.
            </p>
          </div>

          <button
            type="submit"
            form="footer-settings-form"
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
          id="footer-settings-form"
          onSubmit={handleSaveSettings}
          className="mt-8"
        >
          <section className="rounded-3xl border border-border bg-surface p-5 sm:p-7">
            <h2 className="text-lg font-semibold text-text-primary">
              Informasi Footer
            </h2>

            <p className="mt-1 text-sm text-text-secondary">
              Informasi utama yang tampil di bagian
              bawah website.
            </p>

            <div className="mt-6 grid gap-5">
              <TextAreaField
                label="Deskripsi"
                value={settings.description}
                onChange={(value) =>
                  updateSettings(
                    'description',
                    value,
                  )
                }
                placeholder="Tulis deskripsi Footer..."
              />

              <Field
                label="Copyright"
                value={settings.copyright_text}
                onChange={(value) =>
                  updateSettings(
                    'copyright_text',
                    value,
                  )
                }
                placeholder="© 2026 ..."
              />
            </div>
          </section>
        </form>

        <section className="mt-6 rounded-3xl border border-border bg-surface p-5 sm:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Follow & Custom Links
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                Tambahkan Instagram, TikTok, atau
                link website lainnya.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateLinkForm}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-text-primary"
            >
              <Plus size={18} />
              Tambah link
            </button>
          </div>

          {links.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-border p-6 text-center">
              <p className="text-sm font-medium text-text-primary">
                Belum ada link.
              </p>

              <p className="mt-1 text-sm text-text-secondary">
                Tambahkan link sosial media atau
                website pertama Anda.
              </p>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {links.map((link) => (
                <article
                  key={link.id}
                  className="flex flex-col gap-4 rounded-2xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-text-primary">
                        {link.label}
                      </p>

                      {!link.is_active ? (
                        <span className="rounded-full bg-surface-muted px-2 py-1 text-[10px] font-semibold text-text-muted">
                          Nonaktif
                        </span>
                      ) : null}
                    </div>

                    <a
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 flex max-w-full items-center gap-1 truncate text-sm text-text-secondary transition-colors hover:text-text-primary"
                    >
                      <span className="truncate">
                        {link.url}
                      </span>

                      <ExternalLink
                        size={14}
                        className="shrink-0"
                      />
                    </a>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openEditLinkForm(link)
                      }
                      className="flex size-10 items-center justify-center rounded-xl border border-border text-text-secondary transition-colors hover:bg-primary-soft hover:text-text-primary"
                      aria-label={`Edit ${link.label}`}
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleDeleteLink(
                          link.id,
                        )
                      }
                      className="flex size-10 items-center justify-center rounded-xl border border-border text-text-secondary transition-colors hover:bg-red-50 hover:text-red-600"
                      aria-label={`Hapus ${link.label}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {isLinkFormOpen ? (
          <div className="fixed inset-0 z-50 flex items-end bg-black/30 p-0 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6">
            <div className="w-full rounded-t-3xl bg-surface p-5 shadow-xl sm:max-w-lg sm:rounded-3xl sm:p-7">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">
                  {editingLinkId
                    ? 'Edit link'
                    : 'Tambah link'}
                </h2>

                <p className="mt-1 text-sm text-text-secondary">
                  Masukkan nama dan link tujuan.
                </p>
              </div>

              <form
                onSubmit={handleSaveLink}
                className="mt-6 space-y-5"
              >
                <Field
                  label="Nama"
                  value={linkForm.label}
                  onChange={(value) =>
                    updateLinkForm(
                      'label',
                      value,
                    )
                  }
                  placeholder="Instagram"
                />

                <Field
                  label="URL"
                  type="url"
                  value={linkForm.url}
                  onChange={(value) =>
                    updateLinkForm(
                      'url',
                      value,
                    )
                  }
                  placeholder="https://instagram.com/..."
                />

                <label className="flex items-center justify-between gap-4 rounded-2xl border border-border p-4">
                  <div>
                    <p className="text-sm font-medium text-text-primary">
                      Link aktif
                    </p>

                    <p className="mt-1 text-xs text-text-muted">
                      Tampilkan link ini di Footer.
                    </p>
                  </div>

                  <input
                    type="checkbox"
                    checked={
                      linkForm.is_active
                    }
                    onChange={(event) =>
                      updateLinkForm(
                        'is_active',
                        event.target.checked,
                      )
                    }
                    className="size-5"
                  />
                </label>

                <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={closeLinkForm}
                    className="h-11 rounded-2xl border border-border px-5 text-sm font-semibold text-text-secondary"
                  >
                    Batal
                  </button>

                  <button
                    type="submit"
                    disabled={isSavingLink}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-text-primary disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSavingLink ? (
                      <>
                        <LoaderCircle
                          size={17}
                          className="animate-spin"
                        />
                        Menyimpan...
                      </>
                    ) : (
                      <>
                        <Save size={17} />
                        Simpan link
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
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