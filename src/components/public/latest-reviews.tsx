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

import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { createClient } from '@/lib/supabase/server'

type ArticleNode = {
  text?: string
  content?: ArticleNode[]
}

type ArticleContentData = {
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
  content: ArticleContentData | null
  featured_image: string | null
  published_at: string | null
  created_at: string
  categories: Category | Category[] | null
}

function getContentText(node: ArticleNode): string {
  const currentText = node.text ?? ''

  const childrenText =
    node.content
      ?.map((child) => getContentText(child))
      .join(' ') ?? ''

  return `${currentText} ${childrenText}`.trim()
}

function calculateReadingTime(
  content: ArticleContentData | null,
) {
  if (!content?.content) {
    return 1
  }

  const text = content.content
    .map((node) => getContentText(node))
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

function getCategory(
  categories: Category | Category[] | null,
) {
  if (Array.isArray(categories)) {
    return categories[0] ?? null
  }

  return categories
}

async function getLatestArticles() {
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
    .order('published_at', {
      ascending: false,
    })
    .limit(3)

  if (error) {
    console.error(
      'Failed to load latest articles:',
      error,
    )

    return []
  }

  return (data ?? []) as Article[]
}

export async function LatestReviews() {
  const articles = await getLatestArticles()

  if (articles.length === 0) {
    return (
      <Section
        id="reviews"
        spacing="lg"
        className="relative overflow-hidden"
      >
        <Container>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <Sparkles
                  size={17}
                  className="text-secondary"
                />

                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">
                  Fresh from Suara Wanita
                </p>
              </div>

              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-text-primary sm:text-5xl">
                Review yang sedang
                <span className="relative ml-2 inline-block">
                  kami bahas.
                  <span className="absolute bottom-1 left-0 -z-10 h-3 w-full rounded-full bg-primary sm:h-4" />
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">
                Artikel terbaru dari Suara Wanita akan muncul
                di sini.
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full sm:w-auto"
              asChild
            >
              <Link href="/reviews">
                Semua Artikel
                <ArrowRight size={17} />
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex min-h-72 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
              <FileText size={25} />
            </div>

            <h3 className="mt-5 text-xl font-semibold text-text-primary">
              Belum ada artikel terbaru
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
              Publish artikel dari dashboard admin,
              lalu artikel tersebut akan otomatis
              muncul di halaman utama.
            </p>
          </div>
        </Container>
      </Section>
    )
  }

  return (
    <Section
      id="reviews"
      spacing="lg"
      className="relative overflow-hidden"
    >
      <Container>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <Sparkles
                size={17}
                className="text-secondary"
              />

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Fresh from Suara Wanita
              </p>
            </div>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-text-primary sm:text-5xl">
              Review yang sedang
              <span className="relative ml-2 inline-block">
                kami bahas.
                <span className="absolute bottom-1 left-0 -z-10 h-3 w-full rounded-full bg-primary sm:h-4" />
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">
              Artikel terbaru, panduan beauty, dan
              rekomendasi pilihan yang dikurasi untuk
              membantumu menemukan produk yang tepat.
            </p>
          </div>

          <Button
            variant="outline"
            className="w-full shrink-0 sm:w-auto"
            asChild
          >
            <Link href="/reviews">
              Semua Artikel
              <ArrowRight size={17} />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-3">
          {articles.map((article, index) => {
            const category = getCategory(
              article.categories,
            )

            const readingTime =
              calculateReadingTime(article.content)

            const publishedDate = formatDate(
              article.published_at ??
                article.created_at,
            )

            const isFeatured = index === 0

            return (
              <article
                key={article.id}
                className={`group flex min-w-0 flex-col overflow-hidden rounded-3xl border border-border bg-surface transition-all duration-300 hover:-translate-y-1 hover:shadow-card ${
                  isFeatured
                    ? 'lg:col-span-2'
                    : ''
                }`}
              >
                <Link
                  href={`/reviews/${article.slug}`}
                  className={`relative block w-full overflow-hidden bg-primary-soft ${
                    isFeatured
                      ? 'aspect-video sm:aspect-2/1'
                      : 'aspect-8/5'
                  }`}
                >
                  {article.featured_image ? (
                    <Image
                      src={article.featured_image}
                      alt={article.title}
                      fill
                      sizes={
                        isFeatured
                          ? '(max-width: 1024px) 100vw, 66vw'
                          : '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw'
                      }
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-text-muted">
                      <div className="flex size-16 items-center justify-center rounded-3xl border border-border bg-surface/70 backdrop-blur-sm sm:size-20">
                        <FileText size={30} />
                      </div>
                    </div>
                  )}

                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-black/40 to-transparent" />

                  <div className="absolute left-4 top-4 sm:left-5 sm:top-5">
                    <span className="rounded-full bg-surface/90 px-3 py-2 text-xs font-semibold text-text-primary backdrop-blur-md">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </div>

                  {category ? (
                    <div className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-2 text-xs font-semibold text-text-primary backdrop-blur-md">
                        <Tag size={13} />
                        {category.name}
                      </span>
                    </div>
                  ) : null}
                </Link>

                <div className="flex flex-1 flex-col p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-muted">
                    {publishedDate ? (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={14} />
                        {publishedDate}
                      </span>
                    ) : null}

                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={14} />
                      {readingTime} menit baca
                    </span>
                  </div>

                  <h3
                    className={`mt-4 font-semibold tracking-tight text-text-primary ${
                      isFeatured
                        ? 'text-2xl sm:text-3xl'
                        : 'text-xl sm:text-2xl'
                    }`}
                  >
                    <Link
                      href={`/reviews/${article.slug}`}
                      className="transition-colors hover:text-secondary"
                    >
                      {article.title}
                    </Link>
                  </h3>

                  {article.excerpt ? (
                    <p className="mt-3 line-clamp-3 text-sm leading-7 text-text-secondary">
                      {article.excerpt}
                    </p>
                  ) : null}

                  <Link
                    href={`/reviews/${article.slug}`}
                    className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-text-primary transition-colors hover:text-secondary"
                  >
                    Baca selengkapnya

                    <ArrowRight
                      size={16}
                      className="transition-transform duration-200 group-hover:translate-x-1"
                    />
                  </Link>
                </div>
              </article>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}