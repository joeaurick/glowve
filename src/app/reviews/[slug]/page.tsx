import type { Metadata } from 'next'

import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  Tag,
} from 'lucide-react'

import { ArticleContent } from '@/components/public/article-content'
import { createClient } from '@/lib/supabase/server'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

type ArticleNode = {
  type?: string
  text?: string
  attrs?: {
    level?: number
    href?: string
    target?: string
    rel?: string
  }
  content?: ArticleNode[]
}

type ArticleContentData = {
  type?: string
  content?: ArticleNode[]
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
  content: ArticleContentData
  featured_image: string | null
  status: string
  seo_title: string | null
  seo_description: string | null
  published_at: string | null
  created_at: string
  categories: Category | null
}

type SiteSettings = {
  brand_name: string | null
}

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  'https://suarawanita.vercel.app'

function getAbsoluteUrl(
  path: string | null,
) {
  if (!path) {
    return null
  }

  if (
    path.startsWith('http://') ||
    path.startsWith('https://')
  ) {
    return path
  }

  return new URL(path, siteUrl).toString()
}

function formatDate(value: string | null) {
  if (!value) {
    return null
  }

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value))
}

function getContentText(
  node: ArticleNode,
): string {
  const currentText = node.text ?? ''

  const childrenText =
    node.content
      ?.map((child) => getContentText(child))
      .join(' ') ?? ''

  return `${currentText} ${childrenText}`.trim()
}

function calculateReadingTime(
  content: ArticleContentData,
) {
  const text = content.content
    ?.map((node) => getContentText(node))
    .join(' ')
    .trim()

  const wordCount = text
    ? text.split(/\s+/).length
    : 0

  return Math.max(
    1,
    Math.ceil(wordCount / 200),
  )
}

async function getArticle(slug: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('articles')
    .select(
      `
        id,
        title,
        slug,
        excerpt,
        content,
        featured_image,
        status,
        seo_title,
        seo_description,
        published_at,
        created_at,
        categories (
          id,
          name,
          slug
        )
      `,
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    console.error(
      'Failed to load public article:',
      error,
    )

    return null
  }

  return data as Article | null
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

async function getRelatedArticles(
  articleId: string,
  categoryId: string | null,
) {
  const supabase = await createClient()

  let query = supabase
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
        categories (
          id,
          name,
          slug
        )
      `,
    )
    .eq('status', 'published')
    .neq('id', articleId)
    .order('published_at', {
      ascending: false,
    })
    .limit(3)

  if (categoryId) {
    query = query.eq(
      'category_id',
      categoryId,
    )
  }

  const { data, error } = await query

  if (error) {
    console.error(
      'Failed to load related articles:',
      error,
    )

    return []
  }

  return data ?? []
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params

  const [article, settings] =
    await Promise.all([
      getArticle(slug),
      getSiteSettings(),
    ])

  if (!article) {
    return {
      title: 'Artikel tidak ditemukan',
      robots: {
        index: false,
        follow: false,
      },
    }
  }

  const brandName =
    settings?.brand_name?.trim() || 'Website'

  const seoTitle =
    article.seo_title?.trim() ||
    article.title

  const title = `${seoTitle} | ${brandName}`

  const description =
    article.seo_description?.trim() ||
    article.excerpt?.trim() ||
    `Baca ${article.title} di ${brandName}.`

  const canonicalUrl =
    new URL(
      `/reviews/${article.slug}`,
      siteUrl,
    ).toString()

  const imageUrl = getAbsoluteUrl(
    article.featured_image,
  )

  return {
    title,
    description,

    alternates: {
      canonical: canonicalUrl,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },

    openGraph: {
      type: 'article',
      url: canonicalUrl,
      title,
      description,
      siteName: brandName,

      publishedTime:
        article.published_at ??
        article.created_at,

      images: imageUrl
        ? [
            {
              url: imageUrl,
              alt: article.title,
            },
          ]
        : undefined,
    },

    twitter: {
      card: imageUrl
        ? 'summary_large_image'
        : 'summary',

      title,
      description,

      images: imageUrl
        ? [imageUrl]
        : undefined,
    },
  }
}

export default async function ReviewDetailPage({
  params,
}: PageProps) {
  const { slug } = await params

  const [article, settings] =
    await Promise.all([
      getArticle(slug),
      getSiteSettings(),
    ])

  if (!article) {
    notFound()
  }

  const relatedArticles =
    await getRelatedArticles(
      article.id,
      article.categories?.id ?? null,
    )

  const brandName =
    settings?.brand_name?.trim() || 'Website'

  const publishedDate = formatDate(
    article.published_at ?? article.created_at,
  )

  const readingTime = calculateReadingTime(
    article.content,
  )

  const canonicalUrl =
    new URL(
      `/reviews/${article.slug}`,
      siteUrl,
    ).toString()

  const articleImageUrl = getAbsoluteUrl(
    article.featured_image,
  )

  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description:
      article.seo_description?.trim() ||
      article.excerpt?.trim() ||
      undefined,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    url: canonicalUrl,
    datePublished:
      article.published_at ??
      article.created_at,
    dateModified:
      article.published_at ??
      article.created_at,
    image: articleImageUrl
      ? [articleImageUrl]
      : undefined,
    author: {
      '@type': 'Organization',
      name: brandName,
    },
    publisher: {
      '@type': 'Organization',
      name: brandName,
    },
    articleSection:
      article.categories?.name ?? undefined,
  }

  const breadcrumbStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Artikel',
        item: new URL(
          '/reviews',
          siteUrl,
        ).toString(),
      },
      ...(article.categories
        ? [
            {
              '@type': 'ListItem',
              position: 3,
              name: article.categories.name,
              item: new URL(
                `/reviews/category/${article.categories.slug}`,
                siteUrl,
              ).toString(),
            },
            {
              '@type': 'ListItem',
              position: 4,
              name: article.title,
              item: canonicalUrl,
            },
          ]
        : [
            {
              '@type': 'ListItem',
              position: 3,
              name: article.title,
              item: canonicalUrl,
            },
          ]),
    ],
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            articleStructuredData,
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbStructuredData,
          ),
        }}
      />

      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8 lg:px-8">
          <Link
            href="/reviews"
            className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={17} />
            Kembali ke artikel
          </Link>

          <div className="mt-5 grid items-center gap-8 sm:mt-7 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] lg:gap-12">
            <div className="min-w-0">
              {article.categories ? (
                <Link
                  href={`/reviews/category/${article.categories.slug}`}
                  className="inline-flex max-w-full items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-text-primary transition-colors hover:bg-primary"
                >
                  <Tag
                    size={14}
                    className="shrink-0"
                  />

                  <span className="truncate">
                    {article.categories.name}
                  </span>
                </Link>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1.5 text-xs font-semibold text-text-primary">
                  <FileText size={14} />
                  {brandName}
                </span>
              )}

              <p className="mt-5 text-xs font-semibold uppercase tracking-[0.16em] text-secondary sm:mt-6 sm:text-sm">
                {brandName}
              </p>

              <h1 className="mt-3 wrap-break-words text-3xl font-semibold tracking-tight text-text-primary sm:text-5xl sm:leading-tight lg:text-6xl">
                {article.title}
              </h1>

              {article.excerpt ? (
                <p className="mt-4 max-w-2xl text-base leading-7 text-text-secondary sm:mt-5 sm:text-lg sm:leading-8">
                  {article.excerpt}
                </p>
              ) : null}

              <div className="mt-6 flex flex-col gap-3 text-sm text-text-muted sm:mt-7 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
                {publishedDate ? (
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays
                      size={16}
                      className="shrink-0"
                    />
                    <span>{publishedDate}</span>
                  </div>
                ) : null}

                <div className="inline-flex items-center gap-2">
                  <Clock3
                    size={16}
                    className="shrink-0"
                  />
                  <span>
                    {readingTime} menit baca
                  </span>
                </div>
              </div>
            </div>

            {article.featured_image ? (
              <div className="relative aspect-4/5 w-full overflow-hidden rounded-3xl border border-border bg-primary-soft sm:aspect-16/10 lg:aspect-4/5">
                <Image
                  src={article.featured_image}
                  alt={article.title}
                  fill
                  priority
                  sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(100vw - 48px), 540px"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex aspect-4/5 w-full items-center justify-center rounded-3xl border border-border bg-primary-soft text-text-muted sm:aspect-16/10 lg:aspect-4/5">
                <FileText size={40} />
              </div>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16">
          <div className="mb-9 flex items-center gap-3 sm:mb-14 sm:gap-4">
            <div className="h-px flex-1 bg-border" />

            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.18em] text-secondary sm:text-xs">
              Artikel
            </span>

            <div className="h-px flex-1 bg-border" />
          </div>

          <article className="min-w-0">
            <ArticleContent
              content={article.content}
            />
          </article>

          <div className="mt-10 rounded-3xl border border-border bg-primary-soft p-5 sm:mt-16 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
              {brandName}
            </p>

            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl">
              Semoga artikel ini membantu
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
              Temukan lebih banyak panduan, tips,
              review, dan rekomendasi untuk membantu
              kamu menemukan pilihan yang sesuai dengan
              kebutuhanmu.
            </p>

            <Link
              href="/reviews"
              className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-text-primary transition-transform hover:-translate-y-0.5 sm:w-auto"
            >
              Jelajahi artikel lainnya
              <ArrowRight size={17} />
            </Link>
          </div>
        </div>
      </section>

      {relatedArticles.length > 0 ? (
        <section className="border-t border-border bg-surface">
          <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary sm:text-sm">
                  Lanjut membaca
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary sm:text-4xl">
                  Artikel lainnya untuk kamu
                </h2>

                <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
                  Jelajahi artikel dan rekomendasi
                  pilihan lainnya dari {brandName}.
                </p>
              </div>

              <Link
                href="/reviews"
                className="inline-flex min-h-11 shrink-0 items-center gap-2 text-sm font-semibold text-text-primary transition-colors hover:text-secondary"
              >
                Lihat semua
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="mt-7 grid gap-5 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
              {relatedArticles.map(
                (relatedArticle) => {
                  const category =
                    Array.isArray(
                      relatedArticle.categories,
                    )
                      ? relatedArticle.categories[0]
                      : relatedArticle.categories

                  const relatedDate =
                    formatDate(
                      relatedArticle.published_at ??
                        relatedArticle.created_at,
                    )

                  return (
                    <article
                      key={relatedArticle.id}
                      className="group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-background transition-transform duration-300 hover:-translate-y-1"
                    >
                      <Link
                        href={`/reviews/${relatedArticle.slug}`}
                        className="block"
                      >
                        {relatedArticle.featured_image ? (
                          <div className="relative aspect-video w-full overflow-hidden bg-primary-soft">
                            <Image
                              src={
                                relatedArticle.featured_image
                              }
                              alt={
                                relatedArticle.title
                              }
                              fill
                              sizes="(max-width: 639px) calc(100vw - 32px), (max-width: 1023px) calc(50vw - 36px), 380px"
                              className="object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                        ) : (
                          <div className="flex aspect-video w-full items-center justify-center bg-primary-soft text-text-muted">
                            <FileText size={30} />
                          </div>
                        )}
                      </Link>

                      <div className="flex flex-1 flex-col p-5 sm:p-6">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                          {category ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-secondary">
                              <Tag size={13} />
                              {category.name}
                            </span>
                          ) : null}

                          {relatedDate ? (
                            <span className="text-xs text-text-muted">
                              {relatedDate}
                            </span>
                          ) : null}
                        </div>

                        <h3 className="mt-4 wrap-break-words text-xl font-semibold tracking-tight text-text-primary">
                          <Link
                            href={`/reviews/${relatedArticle.slug}`}
                            className="transition-colors hover:text-secondary"
                          >
                            {
                              relatedArticle.title
                            }
                          </Link>
                        </h3>

                        {relatedArticle.excerpt ? (
                          <p className="mt-3 line-clamp-3 text-sm leading-6 text-text-secondary">
                            {
                              relatedArticle.excerpt
                            }
                          </p>
                        ) : null}

                        <Link
                          href={`/reviews/${relatedArticle.slug}`}
                          className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-text-primary transition-colors hover:text-secondary"
                        >
                          Baca artikel
                          <ArrowRight
                            size={16}
                            className="transition-transform group-hover:translate-x-1"
                          />
                        </Link>
                      </div>
                    </article>
                  )
                },
              )}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  )
}