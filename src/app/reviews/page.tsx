import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  Sparkles,
  Tag,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'

type Category = {
  id: string
  name: string
  slug: string
}

type Article = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featured_image: string | null
  published_at: string | null
  created_at: string
  content: unknown
  categories: Category | null
}

function formatDate(value: string | null) {
  if (!value) {
    return null
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function getContentText(value: unknown): string {
  if (!value) {
    return ''
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => getContentText(item))
      .join(' ')
  }

  if (typeof value !== 'object') {
    return ''
  }

  const node = value as {
    text?: unknown
    content?: unknown
  }

  const currentText =
    typeof node.text === 'string'
      ? node.text
      : ''

  const childrenText = node.content
    ? getContentText(node.content)
    : ''

  return `${currentText} ${childrenText}`.trim()
}

function calculateReadingTime(content: unknown) {
  const text = getContentText(content).trim()

  if (!text) {
    return 1
  }

  const wordCount = text.split(/\s+/).length

  return Math.max(
    1,
    Math.ceil(wordCount / 200),
  )
}

async function getArticles() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('articles')
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        featured_image,
        published_at,
        created_at,
        content,
        categories (
          id,
          name,
          slug
        )
      `,
    )
    .eq('status', 'published')
    .order('published_at', {
      ascending: false,
    })

  if (error) {
    console.error(
      'Failed to load public articles:',
      error,
    )

    return []
  }

  return (data ?? []).map((article) => ({
    ...article,
    categories: Array.isArray(article.categories)
      ? article.categories[0] ?? null
      : article.categories,
  })) as Article[]
}

export default async function ReviewsPage() {
  const articles = await getArticles()

  const featuredArticle = articles[0] ?? null
  const otherArticles = articles.slice(1)

  const featuredDate = featuredArticle
    ? formatDate(
        featuredArticle.published_at ??
          featuredArticle.created_at,
      )
    : null

  const featuredReadingTime = featuredArticle
    ? calculateReadingTime(featuredArticle.content)
    : null

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-text-primary">
              <Sparkles size={14} />
              Glowvé Beauty Guide
            </div>

            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              Artikel & rekomendasi beauty
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
              Temukan panduan, tips, review, dan rekomendasi
              produk untuk membantu kamu memilih produk beauty
              yang sesuai dengan kebutuhanmu.
            </p>
          </div>
        </div>
      </section>

      {featuredArticle ? (
        <section className="border-b border-border bg-surface">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary-soft text-text-primary">
                <Sparkles size={17} />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                  Artikel unggulan
                </p>

                <p className="mt-0.5 text-sm text-text-secondary">
                  Pilihan terbaru dari Glowvé
                </p>
              </div>
            </div>

            <article className="group overflow-hidden rounded-3xl border border-border bg-background">
              <div className="grid lg:grid-cols-2">
                <Link
                  href={`/reviews/${featuredArticle.slug}`}
                  className="block"
                >
                  {featuredArticle.featured_image ? (
                    <div className="relative aspect-4/3 w-full overflow-hidden bg-primary-soft sm:aspect-video lg:h-full lg:aspect-auto">
                      <Image
                        src={featuredArticle.featured_image}
                        alt={featuredArticle.title}
                        fill
                        priority
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-4/3 w-full items-center justify-center bg-primary-soft text-text-muted sm:aspect-video lg:h-full lg:aspect-auto">
                      <FileText size={42} />
                    </div>
                  )}
                </Link>

                <div className="flex min-w-0 flex-col p-6 sm:p-8 lg:p-10">
                  <div className="flex flex-wrap items-center gap-3">
                    {featuredArticle.categories ? (
                      <Link
                        href={`/reviews/category/${featuredArticle.categories.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:bg-primary"
                      >
                        <Tag size={13} />
                        {featuredArticle.categories.name}
                      </Link>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-text-primary">
                        <FileText size={13} />
                        Beauty Guide
                      </span>
                    )}

                    {featuredDate ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                        <CalendarDays size={13} />
                        {featuredDate}
                      </span>
                    ) : null}
                  </div>

                  <h2 className="mt-6 wrap-break-words text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl lg:text-5xl">
                    <Link
                      href={`/reviews/${featuredArticle.slug}`}
                      className="transition-colors hover:text-secondary"
                    >
                      {featuredArticle.title}
                    </Link>
                  </h2>

                  {featuredArticle.excerpt ? (
                    <p className="mt-5 text-sm leading-7 text-text-secondary sm:text-base sm:leading-7">
                      {featuredArticle.excerpt}
                    </p>
                  ) : null}

                  {featuredReadingTime ? (
                    <div className="mt-6">
                      <span className="inline-flex items-center gap-2 text-sm text-text-muted">
                        <Clock3 size={16} />
                        {featuredReadingTime} menit baca
                      </span>
                    </div>
                  ) : null}

                  <div className="mt-8">
                    <Link
                      href={`/reviews/${featuredArticle.slug}`}
                      className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-text-primary transition-transform hover:-translate-y-0.5"
                    >
                      Baca artikel
                      <ArrowRight size={17} />
                    </Link>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </section>
      ) : null}

      <section>
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          {articles.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
                <FileText size={24} />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-text-primary">
                Belum ada artikel
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
                Artikel yang sudah dipublish dari dashboard
                admin akan muncul di halaman ini.
              </p>
            </div>
          ) : null}

          {articles.length > 1 ? (
            <>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
                    Artikel terbaru
                  </p>

                  <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                    Terus eksplor beauty guide
                  </h2>

                  <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
                    Temukan lebih banyak panduan, tips, dan
                    rekomendasi pilihan dari Glowvé.
                  </p>
                </div>

                <span className="text-sm text-text-muted">
                  {otherArticles.length} artikel lainnya
                </span>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {otherArticles.map((article) => {
                  const publishedDate = formatDate(
                    article.published_at ??
                      article.created_at,
                  )

                  return (
                    <article
                      key={article.id}
                      className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-surface transition-transform duration-300 hover:-translate-y-1"
                    >
                      <Link
                        href={`/reviews/${article.slug}`}
                        className="block"
                      >
                        {article.featured_image ? (
                          <div className="relative aspect-video w-full overflow-hidden bg-primary-soft">
                            <Image
                              src={article.featured_image}
                              alt={article.title}
                              fill
                              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="flex aspect-video w-full items-center justify-center bg-primary-soft text-text-muted">
                            <FileText size={32} />
                          </div>
                        )}
                      </Link>

                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        <div className="flex flex-wrap items-center gap-3">
                          {article.categories ? (
                            <Link
                              href={`/reviews/category/${article.categories.slug}`}
                              className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary"
                            >
                              <Tag size={13} />
                              {article.categories.name}
                            </Link>
                          ) : null}

                          {publishedDate ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                              <CalendarDays size={13} />
                              {publishedDate}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="mt-4 wrap-break-words text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
                          <Link
                            href={`/reviews/${article.slug}`}
                            className="transition-colors hover:text-secondary"
                          >
                            {article.title}
                          </Link>
                        </h3>

                        {article.excerpt ? (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-secondary">
                            {article.excerpt}
                          </p>
                        ) : null}

                        <div className="mt-auto pt-6">
                          <Link
                            href={`/reviews/${article.slug}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary transition-colors hover:text-secondary"
                          >
                            Baca artikel
                            <ArrowRight
                              size={17}
                              className="transition-transform group-hover:translate-x-1"
                            />
                          </Link>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </>
          ) : null}

          {articles.length === 1 ? (
            <div className="mt-10 rounded-3xl border border-border bg-surface p-6 text-center sm:mt-14 sm:p-10">
              <p className="text-sm text-text-secondary">
                Artikel terbaru lainnya akan segera hadir.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </main>
  )
}