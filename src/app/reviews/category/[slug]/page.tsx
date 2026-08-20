import type { Metadata } from 'next'

import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  FileText,
  Tag,
} from 'lucide-react'

import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

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
}

type SiteSettings = {
  brand_name: string | null
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

async function getSiteSettings() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('site_settings')
    .select('brand_name')
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error(
      'Failed to load site settings:',
      error,
    )

    return null
  }

  return data as SiteSettings | null
}

async function getCategory(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select(`
      id,
      name,
      slug
    `)
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    console.error(
      'Failed to load category:',
      error,
    )

    return null
  }

  return data as Category | null
}

async function getCategoryArticles(
  categoryId: string,
) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      featured_image,
      published_at,
      created_at
    `)
    .eq('category_id', categoryId)
    .eq('status', 'published')
    .order('published_at', {
      ascending: false,
    })

  if (error) {
    console.error(
      'Failed to load category articles:',
      error,
    )

    return []
  }

  return (data ?? []) as Article[]
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params

  const [category, siteSettings] =
    await Promise.all([
      getCategory(slug),
      getSiteSettings(),
    ])

  const brandName =
    siteSettings?.brand_name?.trim() || 'GLOWVÉ'

  if (!category) {
    return {
      title: `Kategori tidak ditemukan | ${brandName}`,
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const title =
    `${category.name} | Beauty Guide | ${brandName}`

  const description =
    `Jelajahi artikel, panduan, tips, dan rekomendasi seputar ${category.name} di ${brandName}.`

  return {
    title,
    description,

    alternates: {
      canonical: `/reviews/category/${category.slug}`,
    },

    openGraph: {
      title,
      description,
      type: 'website',
      url: `/reviews/category/${category.slug}`,
      siteName: brandName,
      locale: 'id_ID',
    },

    twitter: {
      card: 'summary',
      title,
      description,
    },
  }
}

export default async function CategoryPage({
  params,
}: PageProps) {
  const { slug } = await params

  const [category, siteSettings] =
    await Promise.all([
      getCategory(slug),
      getSiteSettings(),
    ])

  if (!category) {
    notFound()
  }

  const articles = await getCategoryArticles(
    category.id,
  )

  const brandName =
    siteSettings?.brand_name?.trim() || 'GLOWVÉ'

  return (
    <main className="min-h-screen overflow-hidden bg-background">
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 pb-10 pt-6 sm:px-6 sm:pb-14 sm:pt-8 lg:px-8">
          <Link
            href="/reviews"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={17} />
            Semua artikel
          </Link>

          <div className="mt-10 max-w-3xl sm:mt-14">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-text-primary">
              <Tag size={14} />
              Kategori artikel
            </div>

            <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              {brandName} Beauty Guide
            </p>

            <h1 className="mt-3 wrap-break-word text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl lg:text-6xl">
              {category.name}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-text-secondary sm:text-lg sm:leading-8">
              Temukan artikel, panduan, tips, dan rekomendasi
              pilihan seputar {category.name.toLowerCase()} untuk
              membantu kamu menemukan produk dan rutinitas yang sesuai.
            </p>

            <div className="mt-7 inline-flex items-center rounded-2xl border border-border bg-surface px-4 py-3 text-sm text-text-secondary">
              <FileText
                size={17}
                className="mr-2 text-secondary"
              />

              <span className="font-semibold text-text-primary">
                {articles.length}
              </span>

              <span className="ml-1">
                artikel ditemukan
              </span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
          {articles.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 py-10 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
                <FileText size={25} />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-text-primary">
                Belum ada artikel
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
                Artikel dalam kategori {category.name} yang sudah
                dipublish akan muncul di halaman ini.
              </p>

              <Link
                href="/reviews"
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-text-primary transition-colors hover:text-secondary"
              >
                Lihat semua artikel
                <ArrowRight size={17} />
              </Link>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
                    Pilihan terbaru
                  </p>

                  <h2 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                    Artikel {category.name}
                  </h2>
                </div>

                <Link
                  href="/reviews"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary transition-colors hover:text-secondary"
                >
                  Semua artikel
                  <ArrowRight size={17} />
                </Link>
              </div>

              <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {articles.map((article) => {
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
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary">
                            <Tag size={13} />
                            {category.name}
                          </span>

                          {publishedDate ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-text-muted">
                              <CalendarDays size={13} />
                              {publishedDate}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="mt-4 wrap-break-word text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">
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
          )}
        </div>
      </section>
    </main>
  )
}