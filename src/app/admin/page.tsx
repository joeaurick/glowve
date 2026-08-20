'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  FileText,
  LoaderCircle,
  Package,
  Plus,
  Sparkles,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'

type DashboardStats = {
  totalArticles: number
  publishedArticles: number
  draftArticles: number
  totalProducts: number
}

export default function AdminPage() {
  const [isLoading, setIsLoading] = useState(true)

  const [stats, setStats] = useState<DashboardStats>({
    totalArticles: 0,
    publishedArticles: 0,
    draftArticles: 0,
    totalProducts: 0,
  })

  useEffect(() => {
    async function loadDashboard() {
      const [
        articlesResult,
        publishedResult,
        draftResult,
        productsResult,
      ] = await Promise.all([
        supabase
          .from('articles')
          .select('*', {
            count: 'exact',
            head: true,
          }),

        supabase
          .from('articles')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .eq('status', 'published'),

        supabase
          .from('articles')
          .select('*', {
            count: 'exact',
            head: true,
          })
          .eq('status', 'draft'),

        supabase
          .from('products')
          .select('*', {
            count: 'exact',
            head: true,
          }),
      ])

      setStats({
        totalArticles: articlesResult.count ?? 0,
        publishedArticles: publishedResult.count ?? 0,
        draftArticles: draftResult.count ?? 0,
        totalProducts: productsResult.count ?? 0,
      })

      setIsLoading(false)
    }

    void loadDashboard()
  }, [])

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-text-primary">
            <LoaderCircle
              size={22}
              className="animate-spin"
            />
          </div>

          <p className="text-sm text-text-secondary">
            Memuat dashboard...
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        {/* Page heading */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles
                size={17}
                className="text-secondary"
              />

              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
                Dashboard
              </p>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              Selamat datang kembali.
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
              Kelola artikel, produk, kategori, dan konten
              website Glowvé dari satu tempat.
            </p>
          </div>

          <Link
            href="/admin/articles/new"
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-text-primary transition-transform hover:-translate-y-0.5 sm:w-auto"
          >
            <Plus size={18} />
            Artikel Baru
          </Link>
        </div>

        {/* Stats */}
        <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DashboardStat
            label="Total Artikel"
            value={stats.totalArticles.toString()}
            description="Semua artikel"
          />

          <DashboardStat
            label="Artikel Published"
            value={stats.publishedArticles.toString()}
            description="Sudah tampil publik"
          />

          <DashboardStat
            label="Draft"
            value={stats.draftArticles.toString()}
            description="Masih dikerjakan"
          />

          <DashboardStat
            label="Produk"
            value={stats.totalProducts.toString()}
            description="Produk tersimpan"
          />
        </section>

        {/* Quick actions */}
        <section className="mt-10">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
                Quick actions
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-text-primary">
                Mulai dari sini
              </h2>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <Link
              href="/admin/articles/new"
              className="group rounded-3xl border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:shadow-card sm:p-6"
            >
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
                <FileText size={20} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-text-primary">
                Tulis artikel baru
              </h3>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Buat review, beauty guide, atau artikel
                rekomendasi baru untuk website Glowvé.
              </p>

              <span className="mt-5 inline-flex text-sm font-semibold text-secondary">
                Mulai menulis →
              </span>
            </Link>

            <Link
              href="/admin/products"
              className="group rounded-3xl border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:shadow-card sm:p-6"
            >
              <div className="flex size-11 items-center justify-center rounded-2xl bg-secondary-soft text-text-primary">
                <Package size={20} />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-text-primary">
                Tambahkan produk
              </h3>

              <p className="mt-2 text-sm leading-6 text-text-secondary">
                Simpan produk, informasi, gambar, dan link
                affiliate untuk digunakan di website.
              </p>

              <span className="mt-5 inline-flex text-sm font-semibold text-secondary">
                Kelola produk →
              </span>
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}

type DashboardStatProps = {
  label: string
  value: string
  description: string
}

function DashboardStat({
  label,
  value,
  description,
}: DashboardStatProps) {
  return (
    <article className="rounded-3xl border border-border bg-surface p-5">
      <p className="text-sm font-medium text-text-secondary">
        {label}
      </p>

      <p className="mt-3 text-4xl font-semibold tracking-tight text-text-primary">
        {value}
      </p>

      <p className="mt-2 text-sm text-text-muted">
        {description}
      </p>
    </article>
  )
}