'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Edit3,
  FolderPlus,
  LoaderCircle,
  Plus,
  Save,
  Tag,
  Trash2,
  X,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'

type Category = {
  id: string
  name: string
  slug: string
}

function generateSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null)

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [isSlugEdited, setIsSlugEdited] = useState(false)

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    async function loadPage() {
      setIsPageLoading(true)
      setErrorMessage('')

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        window.location.href = '/login'
        return
      }

      const { data: adminUser, error: adminError } =
        await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle()

      if (adminError || !adminUser) {
        await supabase.auth.signOut()
        window.location.href = '/login'
        return
      }

      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name', {
          ascending: true,
        })

      if (error) {
        console.error(
          'Failed to load categories:',
          error,
        )

        setErrorMessage('Kategori gagal dimuat.')
      } else {
        setCategories(
          (data ?? []) as Category[],
        )
      }

      setIsPageLoading(false)
    }

    void loadPage()
  }, [])

  function resetForm() {
    setName('')
    setSlug('')
    setIsSlugEdited(false)
    setEditingCategory(null)
  }

  function openCreateForm() {
    setErrorMessage('')
    setSuccessMessage('')
    resetForm()
    setIsFormOpen(true)
  }

  function closeForm() {
    if (isSubmitting) {
      return
    }

    setIsFormOpen(false)
    resetForm()
  }

  function openEditForm(category: Category) {
    setErrorMessage('')
    setSuccessMessage('')
    setEditingCategory(category)
    setName(category.name)
    setSlug(category.slug)
    setIsSlugEdited(true)
    setIsFormOpen(true)
  }

  function handleNameChange(value: string) {
    setName(value)

    if (!isSlugEdited) {
      setSlug(generateSlug(value))
    }
  }

  function handleSlugChange(value: string) {
    setIsSlugEdited(true)
    setSlug(generateSlug(value))
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setErrorMessage('')
    setSuccessMessage('')

    const trimmedName = name.trim()
    const trimmedSlug = slug.trim()

    if (!trimmedName) {
      setErrorMessage('Nama kategori wajib diisi.')
      return
    }

    if (!trimmedSlug) {
      setErrorMessage('Slug kategori wajib diisi.')
      return
    }

    setIsSubmitting(true)

    if (editingCategory) {
      const { error } = await supabase
        .from('categories')
        .update({
          name: trimmedName,
          slug: trimmedSlug,
        })
        .eq('id', editingCategory.id)

      setIsSubmitting(false)

      if (error) {
        console.error(
          'Failed to update category:',
          error,
        )

        if (error.code === '23505') {
          setErrorMessage(
            'Slug kategori ini sudah digunakan.',
          )
          return
        }

        setErrorMessage(
          'Kategori gagal diperbarui. Silakan coba lagi.',
        )

        return
      }

      setCategories((currentCategories) =>
        currentCategories
          .map((category) =>
            category.id === editingCategory.id
              ? {
                  ...category,
                  name: trimmedName,
                  slug: trimmedSlug,
                }
              : category,
          )
          .sort((a, b) =>
            a.name.localeCompare(
              b.name,
              'id',
            ),
          ),
      )

      setSuccessMessage(
        'Kategori berhasil diperbarui.',
      )

      setIsFormOpen(false)
      resetForm()

      return
    }

    const { data, error } = await supabase
      .from('categories')
      .insert({
        name: trimmedName,
        slug: trimmedSlug,
      })
      .select('id, name, slug')
      .single()

    setIsSubmitting(false)

    if (error) {
      console.error(
        'Failed to create category:',
        error,
      )

      if (error.code === '23505') {
        setErrorMessage(
          'Slug kategori ini sudah digunakan.',
        )
        return
      }

      setErrorMessage(
        'Kategori gagal ditambahkan. Silakan coba lagi.',
      )

      return
    }

    setCategories((currentCategories) =>
      [...currentCategories, data as Category].sort(
        (a, b) =>
          a.name.localeCompare(
            b.name,
            'id',
          ),
      ),
    )

    setSuccessMessage(
      'Kategori berhasil ditambahkan.',
    )

    setIsFormOpen(false)
    resetForm()
  }

  async function handleDelete(category: Category) {
    const confirmed = window.confirm(
      `Hapus kategori "${category.name}"?`,
    )

    if (!confirmed) {
      return
    }

    setErrorMessage('')
    setSuccessMessage('')
    setIsSubmitting(true)

    const { count, error: countError } = await supabase
      .from('articles')
      .select('id', {
        count: 'exact',
        head: true,
      })
      .eq('category_id', category.id)

    if (countError) {
      console.error(
        'Failed to check category usage:',
        countError,
      )

      setIsSubmitting(false)
      setErrorMessage(
        'Gagal memeriksa artikel yang menggunakan kategori ini.',
      )
      return
    }

    if ((count ?? 0) > 0) {
      setIsSubmitting(false)

      setErrorMessage(
        `Kategori "${category.name}" masih digunakan oleh ${count} artikel dan tidak dapat dihapus.`,
      )

      return
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', category.id)

    setIsSubmitting(false)

    if (error) {
      console.error(
        'Failed to delete category:',
        error,
      )

      setErrorMessage(
        'Kategori gagal dihapus. Silakan coba lagi.',
      )

      return
    }

    setCategories((currentCategories) =>
      currentCategories.filter(
        (currentCategory) =>
          currentCategory.id !== category.id,
      ),
    )

    setSuccessMessage(
      'Kategori berhasil dihapus.',
    )
  }

  if (isPageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <LoaderCircle
            size={20}
            className="animate-spin"
          />
          Memuat kategori...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link
          href="/admin/articles"
          className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={17} />
          Kembali ke artikel
        </Link>

        <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
              <Tag size={22} />
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              Content
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              Kategori artikel
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
              Kelola kategori untuk mengorganisir artikel
              dan membantu pengunjung menemukan topik yang
              mereka cari.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-text-primary transition-transform hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Tambah kategori
          </button>
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle
              size={18}
              className="mt-0.5 shrink-0"
            />

            <span>{errorMessage}</span>
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        ) : null}

        {isFormOpen ? (
          <section className="mt-8 rounded-3xl border border-border bg-surface p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
                  {editingCategory ? (
                    <Edit3 size={20} />
                  ) : (
                    <FolderPlus size={20} />
                  )}
                </div>

                <h2 className="mt-4 text-xl font-semibold text-text-primary">
                  {editingCategory
                    ? 'Edit kategori'
                    : 'Tambah kategori baru'}
                </h2>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  {editingCategory
                    ? 'Perbarui informasi kategori artikel.'
                    : 'Buat kategori baru untuk mengelompokkan artikel.'}
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                disabled={isSubmitting}
                aria-label="Tutup form"
                className="flex size-10 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-primary-soft hover:text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={19} />
              </button>
            </div>

            <form
              className="mt-6 grid gap-5 sm:grid-cols-2"
              onSubmit={handleSubmit}
            >
              <div>
                <label
                  htmlFor="category-name"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Nama kategori
                </label>

                <input
                  id="category-name"
                  type="text"
                  value={name}
                  onChange={(event) =>
                    handleNameChange(event.target.value)
                  }
                  placeholder="Contoh: Skincare"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>

              <div>
                <label
                  htmlFor="category-slug"
                  className="mb-2 block text-sm font-medium text-text-primary"
                >
                  Slug kategori
                </label>

                <input
                  id="category-slug"
                  type="text"
                  value={slug}
                  onChange={(event) =>
                    handleSlugChange(event.target.value)
                  }
                  placeholder="skincare"
                  disabled={isSubmitting}
                  className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                />

                <p className="mt-2 text-xs text-text-muted">
                  URL: /reviews/category/
                  {slug || 'nama-kategori'}
                </p>
              </div>

              <div className="flex flex-col-reverse gap-3 pt-1 sm:col-span-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  disabled={isSubmitting}
                  className="flex h-12 items-center justify-center rounded-2xl border border-border bg-background px-5 text-sm font-semibold text-text-primary transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-text-primary transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? (
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
                      {editingCategory
                        ? 'Simpan perubahan'
                        : 'Tambah kategori'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </section>
        ) : null}

        <section className="mt-8 overflow-hidden rounded-3xl border border-border bg-surface">
          <div className="flex flex-col gap-2 border-b border-border px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Semua kategori
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                {categories.length} kategori tersedia.
              </p>
            </div>
          </div>

          {categories.length === 0 ? (
            <div className="flex min-h-72 flex-col items-center justify-center px-6 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
                <Tag size={24} />
              </div>

              <h3 className="mt-5 text-xl font-semibold text-text-primary">
                Belum ada kategori
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                Buat kategori pertama untuk mulai
                mengelompokkan artikel kamu.
              </p>

              <button
                type="button"
                onClick={openCreateForm}
                className="mt-6 inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-text-primary"
              >
                <Plus size={17} />
                Tambah kategori
              </button>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {categories.map((category) => (
                <div
                  key={category.id}
                  className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
                      <Tag size={19} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-text-primary">
                        {category.name}
                      </h3>

                      <p className="mt-1 truncate text-sm text-text-muted">
                        /reviews/category/{category.slug}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        openEditForm(category)
                      }
                      disabled={isSubmitting}
                      className="flex h-10 items-center gap-2 rounded-xl border border-border px-3 text-sm font-semibold text-text-primary transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <Edit3 size={16} />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void handleDelete(category)
                      }
                      disabled={isSubmitting}
                      className="flex size-10 items-center justify-center rounded-xl border border-red-200 text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label={`Hapus ${category.name}`}
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}