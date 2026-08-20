import Link from 'next/link'
import {
  ArrowRight,
  Check,
  ShoppingBag,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'

const beautyPicks = [
  {
    category: 'LIPSTICK PICK',
    title: 'Warna Nude yang Cocok untuk Everyday Look',
    description:
      'Pilihan warna yang mudah dipadukan untuk tampilan natural sehari-hari.',
    price: 'Mulai dari Rp50.000',
    badge: 'Popular pick',
    href: '#',
    visualClass: 'bg-primary-soft',
    number: '01',
  },
  {
    category: 'SKINCARE PICK',
    title: 'Basic Skincare untuk Rutinitas Pagi',
    description:
      'Pilihan produk dasar untuk membantu membangun rutinitas yang sederhana.',
    price: 'Mulai dari Rp75.000',
    badge: 'Daily essential',
    href: '#',
    visualClass: 'bg-secondary-soft',
    number: '02',
  },
  {
    category: 'MAKEUP PICK',
    title: 'Cushion dengan Finish Natural',
    description:
      'Rekomendasi untuk kamu yang mencari tampilan ringan dan tidak berlebihan.',
    price: 'Mulai dari Rp100.000',
    badge: 'Glowvé choice',
    href: '#',
    visualClass: 'bg-accent-soft',
    number: '03',
  },
]

export function BeautyPicks() {
  return (
    <Section
      id="beauty-picks"
      spacing="lg"
      className="overflow-hidden"
    >
      <Container>
        <div className="rounded-4xl bg-surface-dark px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
          {/* Header */}
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2">
                <Sparkles
                  size={17}
                  className="text-primary"
                />

                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-white/60">
                  Curated for you
                </p>
              </div>

              <h2 className="mt-4 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                Produk yang layak
                <span className="ml-2 text-primary">
                  dilihat.
                </span>
              </h2>

              <p className="mt-5 max-w-xl text-base leading-7 text-white/60 sm:text-lg">
                Pilihan produk yang relevan dengan artikel dan beauty guide
                yang sedang kamu baca.
              </p>
            </div>

            <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm lg:max-w-xs">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary text-text-primary">
                  <Check size={17} strokeWidth={3} />
                </div>

                <p className="text-sm leading-6 text-white/70">
                  Kami memilih rekomendasi berdasarkan kategori dan kebutuhan,
                  bukan sekadar menampilkan semua produk.
                </p>
              </div>
            </div>
          </div>

          {/* Product cards */}
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {beautyPicks.map((product) => (
              <article
                key={product.number}
                className="group overflow-hidden rounded-3xl bg-surface p-3 transition-transform duration-300 hover:-translate-y-1"
              >
                {/* Visual */}
                <div
                  className={`relative aspect-square overflow-hidden rounded-2xl ${product.visualClass}`}
                >
                  <div className="absolute left-4 top-4 rounded-full bg-surface px-3 py-2 text-xs font-semibold text-text-primary shadow-soft">
                    {product.badge}
                  </div>

                  <div className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-surface-dark text-sm font-semibold text-text-inverse">
                    {product.number}
                  </div>

                  {/* Product placeholder */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative flex h-40 w-28 items-center justify-center rounded-t-4xl rounded-b-xl bg-surface shadow-card">
                      <div className="absolute -top-3 h-6 w-16 rounded-full bg-surface-dark" />

                      <span className="text-center text-xs font-bold tracking-[0.2em] text-text-muted">
                        GLOW
                      </span>
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4">
                    <span className="text-xs font-semibold tracking-[0.12em] text-text-primary/60">
                      {product.category}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="px-3 pb-3 pt-5">
                  <h3 className="text-xl font-semibold tracking-tight text-text-primary">
                    {product.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-text-secondary">
                    {product.description}
                  </p>

                  <p className="mt-4 text-sm font-semibold text-text-primary">
                    {product.price}
                  </p>

                  <Button
                    variant="affiliate"
                    fullWidth
                    className="mt-5"
                    asChild
                  >
                    <Link href={product.href}>
                      <ShoppingBag size={17} />
                      Lihat Produk
                      <ArrowRight size={17} />
                    </Link>
                  </Button>
                </div>
              </article>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-8 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-lg text-sm leading-6 text-white/50">
              Nantinya setiap tombol produk ini akan mengarah ke link affiliate
              Shopee yang Anda masukkan dari dashboard admin.
            </p>

            <Button variant="outline" asChild>
              <Link href="/beauty-picks">
                Lihat Semua Pilihan
                <ArrowRight size={17} />
              </Link>
            </Button>
          </div>
        </div>
      </Container>
    </Section>
  )
}