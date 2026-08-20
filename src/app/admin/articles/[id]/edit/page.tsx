'use client'

import { FormEvent, useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import {
  AlertCircle,
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

type Article = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: unknown
  category_id: string | null
  featured_image: string | null
  status: ArticleStatus
  seo_title: string | null
  seo_description: string | null
  published_at: string | null
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

export default function EditArticlePage() {
  const params = useParams()
  const router = useRouter()

  const articleId = Array.isArray(params.id)
    ? params.id[0]
    : params.id

  const [categories, setCategories] = useState<Category[]>([])
  const [isPageLoading, setIsPageLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [isSlugEdited, setIsSlugEdited] = useState(true)

  const [categoryId, setCategoryId] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [featuredImage, setFeaturedImage] = useState('')

  const [seoTitle, setSeoTitle] = useState('')
  const [seoDescription, setSeoDescription] = useState('')

  const [currentStatus, setCurrentStatus] =
    useState<ArticleStatus>('draft')

  const [publishedAt, setPublishedAt] = useState<string | null>(
    null,
  )

  const [errorMessage, setErrorMessage] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    if (!articleId) {
      return
    }

    async function loadPage() {
      setIsPageLoading(true)
      setErrorMessage('')

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        router.replace('/login')
        return
      }

      const { data: adminUser, error: adminError } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (adminError || !adminUser) {
        await supabase.auth.signOut()
        router.replace('/login')
        return
      }

      const [articleResult, categoriesResult] = await Promise.all([
        supabase
          .from('articles')
          .select(
            `
              id,
              title,
              slug,
              excerpt,
              content,
              category_id,
              featured_image,
              status,
              seo_title,
              seo_description,
              published_at
            `,
          )
          .eq('id', articleId)
          .maybeSingle(),

        supabase
          .from('categories')
          .select('id, name, slug')
          .order('name', {
            ascending: true,
          }),
      ])

      if (categoriesResult.error) {
        console.error(
          'Failed to load categories:',
          categoriesResult.error,
        )

        setErrorMessage('Kategori gagal dimuat.')
      } else {
        setCategories(
          (categoriesResult.data ?? []) as Category[],
        )
      }

      if (articleResult.error) {
        console.error(
          'Failed to load article:',
          articleResult.error,
        )

        setErrorMessage('Artikel gagal dimuat.')
        setIsPageLoading(false)
        return
      }

      if (!articleResult.data) {
        setErrorMessage('Artikel tidak ditemukan.')
        setIsPageLoading(false)
        return
      }

      const article = articleResult.data as Article

      setTitle(article.title)
      setSlug(article.slug)
      setExcerpt(article.excerpt ?? '')
      setCategoryId(article.category_id ?? '')
      setFeaturedImage(article.featured_image ?? '')
      setSeoTitle(article.seo_title ?? '')
      setSeoDescription(article.seo_description ?? '')
      setCurrentStatus(article.status)
      setPublishedAt(article.published_at)

      if (article.content) {
        setContent(JSON.stringify(article.content))
      } else {
        setContent('')
      }

      setIsPageLoading(false)
    }

    void loadPage()
  }, [articleId, router])

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

    if (!articleId) {
      setErrorMessage('ID artikel tidak valid.')
      return
    }

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

    const nextPublishedAt =
      status === 'published'
        ? publishedAt ?? new Date().toISOString()
        : null

    const { error } = await supabase
      .from('articles')
      .update({
        title: trimmedTitle,
        slug: trimmedSlug,
        excerpt: excerpt.trim() || null,
        content: articleContent,
        featured_image: featuredImage || null,
        category_id: categoryId || null,
        status,
        seo_title: seoTitle.trim() || null,
        seo_description: seoDescription.trim() || null,
        published_at: nextPublishedAt,
      })
      .eq('id', articleId)

    setIsSubmitting(false)

    if (error) {
      console.error('Failed to update article:', error)

      if (error.code === '23505') {
        setErrorMessage(
          'Slug ini sudah digunakan oleh artikel lain.',
        )
        return
      }

      setErrorMessage(
        'Artikel gagal diperbarui. Silakan coba lagi.',
      )

      return
    }

    setCurrentStatus(status)
    setPublishedAt(nextPublishedAt)

    setSuccessMessage(
      status === 'published'
        ? 'Artikel berhasil dipublish.'
        : 'Artikel berhasil disimpan sebagai draft.',
    )

    window.setTimeout(() => {
      router.push('/admin/articles')
      router.refresh()
    }, 700)
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
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <LoaderCircle
            size={20}
            className="animate-spin"
          />
          Memuat artikel...
        </div>
      </main>
    )
  }

  if (errorMessage && !title) {
    return (
      <main className="min-h-screen bg-background px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto w-full max-w-3xl">
          <Link
            href="/admin/articles"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={17} />
            Kembali ke artikel
          </Link>

          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50 p-6">
            <div className="flex items-start gap-3">
              <AlertCircle
                size={22}
                className="mt-0.5 shrink-0 text-red-600"
              />

              <div>
                <h1 className="font-semibold text-red-800">
                  Tidak dapat membuka artikel
                </h1>

                <p className="mt-2 text-sm leading-6 text-red-700">
                  {errorMessage}
                </p>
              </div>
            </div>
          </div>
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

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              Edit artikel
            </h1>

            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                currentStatus === 'published'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-primary-soft text-text-primary'
              }`}
            >
              {currentStatus === 'published'
                ? 'Published'
                : 'Draft'}
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-text-secondary sm:text-base">
            Perbarui isi, gambar, SEO, kategori, dan status publikasi
            artikel.
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
            <div className="min-w-0 space-y-6">
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
                    onChange={(event) =>
                      handleTitleChange(event.target.value)
                    }
                    placeholder="Judul artikel"
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
                    onChange={(event) =>
                      handleSlugChange(event.target.value)
                    }
                    placeholder="slug-artikel"
                    className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40"
                  />

                  <p className="mt-2 wrap-break-word text-xs leading-5 text-text-muted">
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
                    onChange={(event) =>
                      setExcerpt(event.target.value)
                    }
                    placeholder="Tulis ringkasan singkat artikel..."
                    rows={4}
                    className="w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 text-text-primary outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </section>

              <section className="min-w-0 rounded-3xl border border-border bg-surface p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-text-primary">
                  Isi artikel
                </h2>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Gunakan heading, paragraf, list, quote, dan link
                  untuk menyusun artikel.
                </p>

                <div className="mt-5 min-w-0">
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
                    onChange={(event) =>
                      setSeoTitle(event.target.value)
                    }
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
                    onChange={(event) =>
                      setSeoDescription(event.target.value)
                    }
                    placeholder="Deskripsi singkat untuk Google..."
                    rows={4}
                    className="w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 text-text-primary outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40"
                  />
                </div>
              </section>
            </div>

            <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              <section className="rounded-3xl border border-border bg-surface p-5">
                <h2 className="text-lg font-semibold text-text-primary">
                  Gambar utama
                </h2>

                <p className="mt-2 text-sm leading-6 text-text-secondary">
                  Upload atau ganti cover artikel.
                </p>

                <div className="mt-4">
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
                  Simpan perubahan sebagai draft atau publish artikel.
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

                    {currentStatus === 'published'
                      ? 'Update Artikel'
                      : 'Publish Artikel'}
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
                  onChange={(event) =>
                    setCategoryId(event.target.value)
                  }
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