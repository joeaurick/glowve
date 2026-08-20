'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  AlertCircle,
  CheckCircle2,
  ImageIcon,
  LoaderCircle,
  Package,
  Plus,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'

type ProductStatus = 'draft' | 'published'

type Product = {
  id: string
  name: string
  slug: string
  featured_image: string | null
  brand: string | null
  price: number | null
  status: ProductStatus
  created_at: string
}

function formatPrice(value: number | null) {
  if (value === null) {
    return 'Harga belum tersedia'
  }

  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value)
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    async function loadProducts() {
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

      const { data: adminUser, error: adminError } =
        await supabase
          .from('admin_users')
          .select('user_id')
          .eq('user_id', user.id)
          .maybeSingle()

      if (adminError || !adminUser) {
        await supabase.auth.signOut()
        window.location.href = '/login'
        return
      }

      const { data, error } = await supabase
        .from('products')
        .select(
          `
            id,
            name,
            slug,
            featured_image,
            brand,
            price,
            status,
            created_at
          `,
        )
        .order('created_at', {
          ascending: false,
        })

      if (error) {
        console.error(
          'Failed to load products:',
          error,
        )

        setErrorMessage('Produk gagal dimuat.')
        setIsLoading(false)
        return
      }

      setProducts((data ?? []) as Product[])
      setIsLoading(false)
    }

    void loadProducts()
  }, [])

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <LoaderCircle
            size={20}
            className="animate-spin"
          />
          Memuat produk...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
              <Package size={22} />
            </div>

            <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              Catalog
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              Produk
            </h1>

            <p className="mt-3 max-w-xl text-sm leading-6 text-text-secondary sm:text-base">
              Kelola produk beauty yang akan ditampilkan
              di website Glowvé.
            </p>
          </div>

          <Link
            href="/admin/products/new"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-text-primary transition-transform hover:-translate-y-0.5"
          >
            <Plus size={18} />
            Tambah produk
          </Link>
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="mt-8 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            <AlertCircle size={18} />
            {errorMessage}
          </div>
        ) : null}

        {products.length === 0 && !errorMessage ? (
          <div className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-surface px-6 text-center">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
              <Package size={24} />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-text-primary">
              Belum ada produk
            </h2>

            <p className="mt-2 max-w-md text-sm leading-6 text-text-secondary">
              Tambahkan produk pertama untuk mulai membangun
              katalog beauty Glowvé.
            </p>

            <Link
              href="/admin/products/new"
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-text-primary"
            >
              <Plus size={17} />
              Tambah produk pertama
            </Link>
          </div>
        ) : null}

        {products.length > 0 ? (
          <div className="mt-8 overflow-hidden rounded-3xl border border-border bg-surface">
            <div className="hidden grid-cols-[72px_minmax(0,1fr)_minmax(120px,0.7fr)_150px_120px] gap-4 border-b border-border px-6 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-text-muted lg:grid">
              <span>Gambar</span>
              <span>Produk</span>
              <span>Brand</span>
              <span>Harga</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-border">
              {products.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}`}
                  className="group block transition-colors hover:bg-primary-soft/40"
                >
                  <div className="flex gap-4 p-4 sm:p-5 lg:grid lg:grid-cols-[72px_minmax(0,1fr)_minmax(120px,0.7fr)_150px_120px] lg:items-center lg:gap-4 lg:px-6">
                    <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-primary-soft text-text-muted lg:size-18">
                      {product.featured_image ? (
                        <img
                          src={product.featured_image}
                          alt={product.name}
                          className="size-full object-cover"
                        />
                      ) : (
                        <ImageIcon size={22} />
                      )}
                    </div>

                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold text-text-primary sm:text-base">
                        {product.name}
                      </h2>

                      <p className="mt-1 truncate text-xs text-text-muted">
                        /products/{product.slug}
                      </p>

                      <div className="mt-3 flex flex-wrap gap-2 lg:hidden">
                        <span className="text-xs text-text-secondary">
                          {product.brand || 'Tanpa brand'}
                        </span>

                        <span className="text-xs text-text-muted">
                          •
                        </span>

                        <span className="text-xs text-text-secondary">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </div>

                    <div className="hidden min-w-0 text-sm text-text-secondary lg:block">
                      {product.brand || '-'}
                    </div>

                    <div className="hidden text-sm font-medium text-text-primary lg:block">
                      {formatPrice(product.price)}
                    </div>

                    <div className="flex items-start lg:items-center">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          product.status === 'published'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-primary-soft text-text-primary'
                        }`}
                      >
                        {product.status === 'published'
                          ? 'Published'
                          : 'Draft'}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ) : null}

        {!errorMessage && products.length > 0 ? (
          <div className="mt-5 flex items-center gap-2 text-sm text-text-muted">
            <CheckCircle2 size={16} />
            {products.length} produk ditemukan.
          </div>
        ) : null}
      </div>
    </main>
  )
}