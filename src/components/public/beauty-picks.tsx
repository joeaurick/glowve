import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, ImageIcon } from 'lucide-react'

import { createClient } from '@/lib/supabase/server'

type Product = {
  id: string
  name: string
  slug: string
  featured_image: string | null
  brand: string | null
  price: number | null
}

function formatPrice(price: number | null) {
  if (price === null) {
    return 'Harga belum tersedia'
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(price)
}

export async function BeautyPicks() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from('products')
    .select(`
      id,
      name,
      slug,
      featured_image,
      brand,
      price
    `)
    .eq('status', 'published')
    .order('created_at', {
      ascending: false,
    })
    .limit(4)

  if (error) {
    console.error(
      'Failed to load beauty picks:',
      error,
    )
  }

  if (!products || products.length === 0) {
    return null
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              Beauty Picks
            </p>

            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              Produk pilihan untuk kamu coba.
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
              Pilihan produk beauty yang sedang kami
              rekomendasikan.
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 text-sm font-semibold text-text-primary transition-colors hover:text-secondary"
          >
            Lihat semua produk
            <ArrowUpRight size={17} />
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group overflow-hidden rounded-3xl border border-border bg-surface transition-transform duration-300 hover:-translate-y-1 hover:shadow-card"
            >
              <div className="relative aspect-square overflow-hidden bg-primary-soft">
                {product.featured_image ? (
                  <Image
                    src={product.featured_image}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center text-text-muted">
                    <ImageIcon size={32} />
                  </div>
                )}
              </div>

              <div className="p-5">
                {product.brand ? (
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                    {product.brand}
                  </p>
                ) : null}

                <h3 className="mt-2 line-clamp-2 text-base font-semibold text-text-primary">
                  {product.name}
                </h3>

                <p className="mt-3 text-sm font-medium text-text-secondary">
                  {formatPrice(product.price)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}