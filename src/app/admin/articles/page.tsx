'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  FileText,
  LoaderCircle,
  Pencil,
  Plus,
  Search,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'

type ArticleStatus = 'draft' | 'published'

type Article = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category_id: string | null
  status: ArticleStatus
  created_at: string
  published_at: string | null
}

type Category = {
  id: string
  name: string
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Belum dipublish'
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getStatusLabel(status: ArticleStatus) {
  if (status === 'published') {
    return 'Published'
  }

  return 'Draft'
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    async function loadPage() {
      setIsLoading(true)
      setErrorMessage('')

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
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

      const [articlesResult, categoriesResult] = await Promise.all([
        supabase
          .from('articles')
          .select(
            `
              id,
              title,
              slug,
              excerpt,
              category_id,
              status,
              created_at,
              published_at
            `,
          )
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('categories')
          .select('id, name')
          .order('name', {
            ascending: true,
          }),
      ])

      if (articlesResult.error) {
        console.error(
          'Failed to load articles:',
          articlesResult.error,
        )

        setErrorMessage('Artikel gagal dimuat.')
      } else {
        setArticles(
          (articlesResult.data ?? []) as Article[],
        )
      }

      if (categoriesResult.error) {
        console.error(
          'Failed to load categories:',
          categoriesResult.error,
        )
      } else {
        setCategories(
          (categoriesResult.data ?? []) as Category[],
        )
      }

      setIsLoading(false)
    }

    void loadPage()
  }, [])

  function getCategoryName(categoryId: string | null) {
    if (!categoryId) {
      return 'Tanpa kategori'
    }

    const category = categories.find(
      (item) => item.id === categoryId,
    )

    return category?.name ?? 'Tanpa kategori'
  }

  const normalizedSearchQuery = searchQuery
    .trim()
    .toLowerCase()

  const filteredArticles = articles.filter((article) => {
    if (!normalizedSearchQuery) {
      return true
    }

    return (
      article.title
        .toLowerCase()
        .includes(normalizedSearchQuery) ||
      article.slug
        .toLowerCase()
        .includes(normalizedSearchQuery) ||
      article.status
        .toLowerCase()
        .includes(normalizedSearchQuery)
    )
  })

  const publishedCount = articles.filter(
    (article) => article.status === 'published',
  ).length

  const draftCount = articles.filter(
    (article) => article.status === 'draft',
  ).length

  if (isLoading) {
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

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <section>
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
                <FileText size={22} />
              </div>

              <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
                Content Management
              </p>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                Artikel
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
                Kelola beauty guide, review, rekomendasi, dan
                artikel yang mengarahkan pembaca ke produk pilihan.
              </p>
            </div>

            <Link
              href="/admin/articles/new"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-text-primary transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              <Plus size={18} />
              Tulis Artikel
            </Link>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
          <div className="rounded-3xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-xs font-medium text-text-muted">
              Total artikel
            </p>

            <p className="mt-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
              {articles.length}
            </p>
          </div>

          <div className="rounded-3xl border border-border bg-surface p-4 sm:p-5">
            <p className="text-xs font-medium text-text-muted">
              Published
            </p>

            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
              <CheckCircle2
                size={20}
                className="text-green-600"
              />
              {publishedCount}
            </p>
          </div>

          <div className="col-span-2 rounded-3xl border border-border bg-surface p-4 sm:col-span-1 sm:p-5">
            <p className="text-xs font-medium text-text-muted">
              Draft
            </p>

            <p className="mt-2 flex items-center gap-2 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
              <Clock3
                size={20}
                className="text-text-secondary"
              />
              {draftCount}
            </p>
          </div>
        </section>

        <section className="mt-6 rounded-3xl border border-border bg-surface p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                Semua artikel
              </h2>

              <p className="mt-1 text-sm text-text-secondary">
                {filteredArticles.length} artikel ditemukan
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
              />

              <input
                type="search"
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(event.target.value)
                }
                placeholder="Cari artikel..."
                className="h-11 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          {errorMessage ? (
            <div
              role="alert"
              className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {errorMessage}
            </div>
          ) : null}

          {!errorMessage && filteredArticles.length === 0 ? (
            <div className="flex flex-col items-center px-4 py-14 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
                <FileText size={24} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-text-primary">
                {articles.length === 0
                  ? 'Belum ada artikel'
                  : 'Artikel tidak ditemukan'}
              </h3>

              <p className="mt-2 max-w-sm text-sm leading-6 text-text-secondary">
                {articles.length === 0
                  ? 'Mulai buat artikel pertama untuk website Glowvé.'
                  : 'Coba gunakan kata kunci pencarian yang berbeda.'}
              </p>

              {articles.length === 0 ? (
                <Link
                  href="/admin/articles/new"
                  className="mt-5 inline-flex h-11 items-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-text-primary transition-transform hover:-translate-y-0.5"
                >
                  <Plus size={17} />
                  Buat Artikel
                </Link>
              ) : null}
            </div>
          ) : null}

          {filteredArticles.length > 0 ? (
            <div className="mt-5 space-y-3">
              {filteredArticles.map((article) => (
                <article
                  key={article.id}
                  className="rounded-2xl border border-border bg-background p-4 transition-colors hover:bg-primary-soft/30 sm:p-5"
                >
                  <div className="flex flex-col gap-4">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            article.status === 'published'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-primary-soft text-text-primary'
                          }`}
                        >
                          {getStatusLabel(article.status)}
                        </span>

                        <span className="text-xs text-text-muted">
                          {getCategoryName(article.category_id)}
                        </span>
                      </div>

                      <h3 className="mt-3 wrap-break-word text-base font-semibold text-text-primary sm:text-lg">
                        {article.title}
                      </h3>

                      <p className="mt-1 break-all text-xs text-text-muted">
                        /reviews/{article.slug}
                      </p>

                      {article.excerpt ? (
                        <p className="mt-3 line-clamp-2 text-sm leading-6 text-text-secondary">
                          {article.excerpt}
                        </p>
                      ) : null}

                      <p className="mt-3 text-xs text-text-muted">
                        Dibuat{' '}
                        {formatDate(article.created_at)}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 text-sm font-semibold text-text-primary transition-colors hover:bg-primary-soft"
                      >
                        <Pencil size={16} />
                        Edit
                      </Link>

                      {article.status === 'published' ? (
                        <Link
                          href={`/reviews/${article.slug}`}
                          target="_blank"
                          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-text-primary transition-transform hover:-translate-y-0.5"
                        >
                          Lihat
                          <ArrowUpRight size={16} />
                        </Link>
                      ) : (
                        <div className="flex h-11 items-center justify-center rounded-xl bg-surface px-4 text-xs font-medium text-text-muted">
                          Draft belum publik
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </main>
  )
}