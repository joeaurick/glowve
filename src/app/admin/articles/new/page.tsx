'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  CheckCircle2,
  FileText,
  LoaderCircle,
  Save,
  Send,
} from 'lucide-react'

import { ArticleEditor } from '@/components/editor/article-editor'
import { ArticleImageUpload } from '@/components/admin/article-image-upload'
import { supabase } from '@/lib/supabase/client'

type Category = {
  id: string
  name: string
  slug: string
}

type ArticleStatus = 'draft' | 'published'

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

export default function NewArticlePage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [isSlugEdited, setIsSlugEdited] = useState(false)

  const [categoryId, setCategoryId] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')

  const [featuredImage, setFeaturedImage] = useState('')

  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    async function loadPage() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (adminError || !adminUser) {
        await supabase.auth.signOut()
        window.location.href = '/login'
        return
      }

      const { data: categoryData, error: categoryError } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name', {
          ascending: true,
        })

      if (categoryError) {
        console.error('Failed to load categories:', categoryError)
        setErrorMessage('Kategori gagal dimuat.')
      } else {
        setCategories((categoryData ?? []) as Category[])
      }

      setIsPageLoading(false)
    }

    void loadPage()
  }, [])

  function handleTitleChange(value: string) {
    setTitle(value)

    if (!isSlugEdited) {
      setSlug(generateSlug(value))
    }
  }

  function handleSlugChange(value: string) {
    setIsSlugEdited(true)
    setSlug(generateSlug(value))
  }

  async function saveArticle(status: ArticleStatus) {
    setErrorMessage('')
    setSuccessMessage('')

    const trimmedTitle = title.trim()
    const trimmedSlug = slug.trim()
    const trimmedContent = content.trim()

    if (!trimmedTitle) {
      setErrorMessage('Judul artikel wajib diisi.')
      return
    }

    if (!trimmedSlug) {
      setErrorMessage('Slug artikel belum tersedia.')
      return
    }

    if (!trimmedContent) {
      setErrorMessage('Isi artikel wajib diisi.')
      return
    }

    let articleContent: unknown

    try {
      articleContent = JSON.parse(trimmedContent)
    } catch {
      setErrorMessage('Format isi artikel tidak valid.')
      return
    }

    if (
      typeof articleContent !== 'object' ||
      articleContent === null
    ) {
      setErrorMessage('Isi artikel tidak valid.')
      return
    }

    setIsSubmitting(true)

    const now = new Date().toISOString()

    const { error } = await supabase.from('articles').insert({
      title: trimmedTitle,
      slug: trimmedSlug,
      excerpt: excerpt.trim() || null,
      content: articleContent,
      featured_image: featuredImage || null,
      category_id: categoryId || null,
      status,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
      published_at: status === 'published' ? now : null,
    })

    setIsSubmitting(false)

    if (error) {
      console.error('Failed to create article:', error)

      if (error.code === '23505') {
        setErrorMessage(
          'Slug ini sudah digunakan. Gunakan slug yang berbeda.',
        )
        return
      }

      setErrorMessage(
        'Artikel gagal disimpan. Silakan periksa data dan coba lagi.',
      )
      return
    }

    setSuccessMessage(
      status === 'published'
        ? 'Artikel berhasil dipublish.'
        : 'Artikel berhasil disimpan sebagai draft.',
    )

    window.setTimeout(() => {
      window.location.href = '/admin/articles'
    }, 800)
  }

  function handleDraftSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()
    void saveArticle('draft')
  }

  function handlePublish() {
    void saveArticle('published')
  }

  if (isPageLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <LoaderCircle
            size={20}
            className="animate-spin"
          />
          Menyiapkan editor...
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

        <div className="mt-6">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
            <FileText size={22} />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
            Content
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Tulis artikel baru
          </h1>

          <p className="mt-3 text-sm leading-6 text-text-secondary sm:text-base">
            Buat artikel beauty guide, review, atau rekomendasi produk baru.
          </p>
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-6 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        ) : null}

        <form
          className="mt-8"
          onSubmit={handleDraftSubmit}
        >
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
            <div className="space-y-6">
              <section className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-text-primary">
                  Informasi artikel
                </h2>

                <div className="mt-6">
                  <label
                    htmlFor="title"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Judul artikel
                  </label>

                  <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(event) => {
                      handleTitleChange(event.target.value)
                    }}
                    placeholder="Contoh: Lipstik yang Cocok untuk Kulit Sawo Matang"
                    className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="slug"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Slug URL
                  </label>

                  <input
                    id="slug"
                    type="text"
                    value={slug}
                    onChange={(event) => {
                      handleSlugChange(event.target.value)
                    }}
                    placeholder="lipstik-yang-cocok-untuk-kulit-sawo-matang"
                    className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40"
                  />

                  <p className="mt-2 text-xs leading-5 text-text-muted">
                    URL artikel: /reviews/
                    {slug || 'slug-artikel'}
                  </p>
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="excerpt"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Ringkasan singkat
                  </label>

                  <textarea
                    id="excerpt"
                    value={excerpt}
                    onChange={(event) => {
                      setExcerpt(event.target.value)
                    }}
                    placeholder="Tulis ringkasan singkat artikel..."
                    rows={4}
                    className="w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 text-text-primary outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-text-primary">
                  Isi artikel
                </h2>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Gunakan editor untuk membuat heading, paragraf,
                  list, quote, dan link.
                </p>

                <div className="mt-5">
                  <ArticleEditor
                    content={content}
                    onChange={setContent}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-border bg-surface p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-text-primary">
                  SEO
                </h2>

                <div className="mt-6">
                  <label
                    htmlFor="seo-title"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    SEO title
                  </label>

                  <input
                    id="seo-title"
                    type="text"
                    value={seoTitle}
                    onChange={(event) => {
                      setSeoTitle(event.target.value)
                    }}
                    placeholder="Judul untuk hasil pencarian Google"
                    className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40"
                  />
                </div>

                <div className="mt-5">
                  <label
                    htmlFor="seo-description"
                    className="mb-2 block text-sm font-medium text-text-primary"
                  >
                    Meta description
                  </label>

                  <textarea
                    id="seo-description"
                    value={seoDescription}
                    onChange={(event) => {
                      setSeoDescription(event.target.value)
                    }}
                    placeholder="Deskripsi singkat untuk Google..."
                    rows={4}
                    className="w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 text-text-primary outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </section>
            </div>

            <aside className="space-y-6">
              <section className="rounded-3xl border border-border bg-surface p-5">
                <h2 className="text-lg font-semibold text-text-primary">
                  Gambar utama
                </h2>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Upload cover artikel. Gambar akan otomatis dikompresi,
                  diubah ke WebP, dan di-resize sebelum disimpan.
                </p>

                <div className="mt-5">
                  <ArticleImageUpload
                    value={featuredImage}
                    onChange={setFeaturedImage}
                  />
                </div>
              </section>

              <section className="rounded-3xl border border-border bg-surface p-5">
                <h2 className="text-lg font-semibold text-text-primary">
                  Publikasi
                </h2>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Simpan artikel sebagai draft atau langsung publish.
                </p>

                <div className="mt-5 space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-border bg-background px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Save size={18} />
                    )}

                    Simpan Draft
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handlePublish}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 text-sm font-semibold text-text-primary transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                    ) : (
                      <Send size={18} />
                    )}

                    Publish Artikel
                  </button>
                </div>
              </section>

              <section className="rounded-3xl border border-border bg-surface p-5">
                <label
                  htmlFor="category"
                  className="block text-lg font-semibold text-text-primary"
                >
                  Kategori
                </label>

                <select
                  id="category"
                  value={categoryId}
                  onChange={(event) => {
                    setCategoryId(event.target.value)
                  }}
                  className="mt-4 h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/40"
                >
                  <option value="">Tanpa kategori</option>

                  {categories.map((category) => (
                    <option
                      key={category.id}
                      value={category.id}
                    >
                      {category.name}
                    </option>
                  ))}
                </select>

                {categories.length === 0 ? (
                  <p className="mt-3 text-xs leading-5 text-text-muted">
                    Belum ada kategori.
                  </p>
                ) : null}
              </section>
            </aside>
          </div>
        </form>
      </div>
    </main>
  )
}