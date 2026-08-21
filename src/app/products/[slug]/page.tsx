import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowUpRight,
  Package,
  Tag,
} from 'lucide-react'
import { notFound } from 'next/navigation'

import { Footer } from '@/components/public/footer'
import { Navbar } from '@/components/public/navbar'
import { createClient } from '@/lib/supabase/server'

type ProductPageProps = {
  params: Promise<{
    slug: string
  }>
}

type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  featured_image: string | null
  brand: string | null
  price: number | null
  purchase_url: string | null
  category: {
    id: string
    name: string
    slug: string
  } | null
}

function formatPrice(value: number | null) {
  if (value === null) {
    return null
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

async function getProduct(
  slug: string,
): Promise<Product | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      description,
      featured_image,
      brand,
      price,
      purchase_url,
      categories (
        id,
        name,
        slug
      )
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .maybeSingle()

  if (error) {
    console.error(
      'Failed to load product:',
      error,
    )

    return null
  }

  if (!data) {
    return null
  }

  const category = Array.isArray(data.categories)
    ? data.categories[0] ?? null
    : data.categories

  return {
    id: data.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
    featured_image: data.featured_image,
    brand: data.brand,
    price: data.price,
    purchase_url: data.purchase_url,
    category,
  }
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params

  const product = await getProduct(slug)

  if (!product) {
    return {
      title: 'Produk tidak ditemukan',
    }
  }

  const description =
    product.description ||
    `Lihat informasi lengkap ${product.name}.`

  return {
    title: product.name,
    description,

    openGraph: {
      type: 'website',
      title: product.name,
      description,
      images: product.featured_image
        ? [
            {
              url: product.featured_image,
              alt: product.name,
            },
          ]
        : undefined,
    },

    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: product.featured_image
        ? [product.featured_image]
        : undefined,
    },
  }
}

export default async function ProductDetailPage({
  params,
}: ProductPageProps) {
  const { slug } = await params

  const supabase = await createClient()

  const { data: settings, error: settingsError } =
    await supabase
      .from('site_settings')
      .select('brand_name')
      .limit(1)
      .maybeSingle()

  if (settingsError) {
    console.error(
      'Failed to load brand name:',
      settingsError,
    )
  }

  const brandName =
    settings?.brand_name?.trim() || 'GLOWVÉ'

  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  const formattedPrice = formatPrice(
    product.price,
  )

  return (
    <main className="min-h-screen bg-background">
      <Navbar brandName={brandName} />

      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
          >
            <ArrowLeft size={17} />
            Kembali ke beranda
          </Link>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="overflow-hidden rounded-3xl border border-border bg-surface">
            <div className="relative aspect-square w-full bg-primary-soft">
              {product.featured_image ? (
                <Image
                  src={product.featured_image}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center text-text-muted">
                  <Package size={56} />
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-center">
            {product.category ? (
              <div className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-secondary">
                <Tag size={16} />
                {product.category.name}
              </div>
            ) : null}

            <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
              {product.name}
            </h1>

            {product.brand ? (
              <p className="mt-4 text-base text-text-secondary">
                Brand:{' '}
                <span className="font-semibold text-text-primary">
                  {product.brand}
                </span>
              </p>
            ) : null}

            {formattedPrice ? (
              <p className="mt-6 text-2xl font-semibold text-text-primary">
                {formattedPrice}
              </p>
            ) : null}

            {product.description ? (
              <div className="mt-8 border-t border-border pt-8">
                <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-text-muted">
                  Tentang Produk
                </h2>

                <p className="mt-4 whitespace-pre-line text-base leading-8 text-text-secondary">
                  {product.description}
                </p>
              </div>
            ) : null}

            {product.purchase_url ? (
              <a
                href={product.purchase_url}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="mt-8 inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-text-primary transition-transform hover:-translate-y-0.5 sm:w-fit"
              >
                Lihat Produk
                <ArrowUpRight size={18} />
              </a>
            ) : null}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}