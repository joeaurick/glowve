import Link from 'next/link'
import {
  ArrowRight,
  ImageIcon,
  LayoutTemplate,
  Sparkles,
  Link as LinkIcon,
} from 'lucide-react'

export default function LandingPageSettingsPage() {
  return (
    <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-5 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles
                size={16}
                className="text-secondary"
              />

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-secondary">
                Website customization
              </p>
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
              Landing Page
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-text-secondary sm:text-base">
              Atur konten yang tampil di halaman utama
              website Suara Wanita tanpa perlu mengubah kode.
            </p>
          </div>
        </div>

        <section className="mt-8">
          <div className="grid gap-4 md:grid-cols-2">
            <Link
              href="/admin/landing-page/hero"
              className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:shadow-card sm:p-8"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-text-primary">
                <ImageIcon size={21} />
              </div>

              <div className="mt-12">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
                  Section 01
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
                  Hero Section
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">
                  Ganti foto utama, label, judul,
                  deskripsi, dan tombol yang tampil
                  pertama kali saat pengunjung membuka
                  Suara Wanita.
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-text-primary">
                Atur Hero

                <ArrowRight
                  size={17}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </div>

              <div className="absolute -right-10 -top-10 size-32 rounded-full bg-primary-soft transition-transform duration-500 group-hover:scale-125" />
            </Link>

            <Link
  href="/admin/landing-page/footer"
  className="group relative overflow-hidden rounded-3xl border border-border bg-surface p-6 transition-all hover:-translate-y-1 hover:shadow-card sm:p-8"
>
  <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
    <LinkIcon size={21} />
  </div>

  <div className="mt-12">
    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">
      Section 02
    </p>

    <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
      Footer
    </h2>

    <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">
      Atur nama brand, deskripsi, copyright, serta
      link Instagram, TikTok, dan website lainnya.
    </p>
  </div>

  <div className="mt-6 flex items-center gap-2 text-sm font-semibold text-text-primary">
    Atur Footer

    <ArrowRight
      size={17}
      className="transition-transform duration-200 group-hover:translate-x-1"
    />
  </div>

  <div className="absolute -right-10 -top-10 size-32 rounded-full bg-secondary-soft transition-transform duration-500 group-hover:scale-125" />
</Link>

            <div className="relative overflow-hidden rounded-3xl border border-dashed border-border bg-background p-6 sm:p-8">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-text-muted">
                <LayoutTemplate size={21} />
              </div>

              <div className="mt-12">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                  Coming next
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-text-primary">
                  Section lainnya
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-text-secondary">
                  Trending Topics, Latest Reviews,
                  dan Beauty Picks akan kita hubungkan
                  setelah Hero selesai.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}