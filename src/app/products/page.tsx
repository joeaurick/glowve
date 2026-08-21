import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, ImageIcon, Package } from 'lucide-react'

import { Footer } from '@/components/public/footer'
import { Navbar } from '@/components/public/navbar'
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

export default async function ProductsPage() {
  const supabase = await createClient()

  const [
    { data: settings, error: settingsError },
    { data: products, error: productsError },
  ] = await Promise.all([
    supabase
      .from('site_settings')
      .select('brand_name')
      .limit(1)
      .maybeSingle(),

    supabase
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
      }),
  ])

  if (settingsError) {
    console.error(
      'Failed to load brand name:',
      settingsError,
    )
  }

  if (productsError) {
    console.error(
      'Failed to load products:',
      productsError,
    )
  }

  const brandName =
    settings?.brand_name?.trim() || 'GLOWVÉ'

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <section className="border-b border-border bg-primary-soft/40">
        <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-text-primary">
            <Package size={22} />
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
            Beauty Catalog
          </p>

          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-text-primary sm:text-5xl">
            Semua Produk
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
            Temukan produk beauty pilihan dan rekomendasi
            dari {brandName}.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
          {!products || products.length === 0 ? (
            <div className="flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 text-center">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
                <Package size={24} />
              </div>

              <h2 className="mt-5 text-xl font-semibold text-text-primary">
                Belum ada produk
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
                Produk pilihan akan segera hadir di sini.
              </p>
            </div>
          ) : (
            <>
              <p className="mb-6 text-sm text-text-secondary">
                {products.length} produk ditemukan.
              </p>

              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-text-muted">
                          <ImageIcon size={36} />
                        </div>
                      )}
                    </div>

                    <div className="p-5 sm:p-6">
                      {product.brand ? (
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-secondary">
                          {product.brand}
                        </p>
                      ) : null}

                      <h2 className="mt-2 text-lg font-semibold text-text-primary">
                        {product.name}
                      </h2>

                      <div className="mt-4 flex items-center justify-between">
                        <p className="text-sm font-medium text-text-secondary">
                          {formatPrice(product.price)}
                        </p>

                        <span className="flex size-9 items-center justify-center rounded-full bg-primary-soft text-text-primary transition-transform group-hover:translate-x-1">
                          <ArrowUpRight size={17} />
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </main>
  )
}