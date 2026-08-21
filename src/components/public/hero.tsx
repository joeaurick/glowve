import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowDownRight,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { createClient } from '@/lib/supabase/server'

type HomepageSettings = {
  hero_badge: string
  hero_title: string
  hero_highlight: string
  hero_description: string | null
  hero_image_url: string | null
  hero_primary_button_label: string
  hero_primary_button_href: string
  hero_secondary_button_label: string | null
  hero_secondary_button_href: string | null
}

async function getHomepageSettings() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('homepage_settings')
    .select(
      `
        hero_badge,
        hero_title,
        hero_highlight,
        hero_description,
        hero_image_url,
        hero_primary_button_label,
        hero_primary_button_href,
        hero_secondary_button_label,
        hero_secondary_button_href
      `,
    )
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error(
      'Failed to load homepage settings:',
      error,
    )

    return null
  }

  return data as HomepageSettings | null
}

export async function Hero() {
  const settings = await getHomepageSettings()

  const heroBadge =
    settings?.hero_badge || 'THE BEAUTY EDIT'

  const heroTitle =
    settings?.hero_title || 'Cantik bukan soal'

  const heroHighlight =
    settings?.hero_highlight || 'ikut semua tren.'

  const heroDescription =
    settings?.hero_description ||
    'Temukan review jujur, rekomendasi produk, dan beauty picks yang membantu kamu menemukan produk yang benar-benar cocok untukmu.'

  const primaryButtonLabel =
    settings?.hero_primary_button_label ||
    'Mulai Jelajahi'

  const primaryButtonHref =
    settings?.hero_primary_button_href ||
    '#discover'

  const secondaryButtonLabel =
    settings?.hero_secondary_button_label ||
    'Lihat Review Terbaru'

  const secondaryButtonHref =
    settings?.hero_secondary_button_href ||
    '#reviews'

  const heroImageUrl =
    settings?.hero_image_url || null

  return (
    <Section
      spacing="xl"
      className="overflow-hidden"
    >
      <Container>
        <div className="relative">
          {/* Decorative background */}
          <div className="absolute -left-24 top-12 size-64 rounded-full bg-primary-soft blur-3xl sm:size-96" />

          <div className="absolute -right-20 top-0 size-56 rounded-full bg-secondary-soft blur-3xl sm:size-80" />

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            {/* Hero Content */}
            <div className="min-w-0">
              <div className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 shadow-soft">
                <Sparkles
                  size={15}
                  className="shrink-0 text-secondary"
                />

                <span className="truncate text-xs font-semibold uppercase tracking-[0.18em] text-text-primary">
                  {heroBadge}
                </span>
              </div>

              <h1 className="mt-6 max-w-3xl wrap-break-word text-5xl font-semibold tracking-[-0.04em] text-text-primary sm:text-6xl lg:text-7xl">
                {heroTitle}{' '}

                <span className="relative inline">
                  {heroHighlight}

                  <span className="absolute bottom-1 left-0 -z-10 h-3 w-full rounded-full bg-primary sm:h-4" />
                </span>
              </h1>

              <p className="mt-6 max-w-xl text-base leading-8 text-text-secondary sm:text-lg">
                {heroDescription}
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  asChild
                >
                  <Link href={primaryButtonHref}>
                    {primaryButtonLabel}
                    <ArrowRight size={18} />
                  </Link>
                </Button>

                {settings?.hero_secondary_button_label &&
                settings?.hero_secondary_button_href ? (
                  <Button
                    variant="outline"
                    size="lg"
                    asChild
                  >
                    <Link href={secondaryButtonHref}>
                      {secondaryButtonLabel}
                    </Link>
                  </Button>
                ) : null}
              </div>

              {/* Small stats */}
              <div className="mt-10 flex items-center gap-6">
                <div>
                  <p className="text-2xl font-semibold text-text-primary">
                    100+
                  </p>

                  <p className="text-sm text-text-secondary">
                    Beauty reviews
                  </p>
                </div>

                <div className="h-10 w-px bg-border" />

                <div>
                  <p className="text-2xl font-semibold text-text-primary">
                    50+
                  </p>

                  <p className="text-sm text-text-secondary">
                    Product picks
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative mx-auto w-full max-w-lg">
              {/* Yellow main shape */}
              <div className="absolute inset-x-6 bottom-0 top-10 rounded-[3rem] bg-primary sm:inset-x-10" />

              {/* Coral decorative circle */}
              <div className="absolute -right-2 top-4 size-24 rounded-full bg-secondary sm:-right-6 sm:size-32" />

              {/* Dark decorative badge */}
              <div className="absolute -left-2 bottom-12 z-10 flex size-20 -rotate-12 items-center justify-center rounded-full bg-surface-dark text-center text-xs font-semibold text-text-inverse shadow-float sm:-left-8 sm:size-24">
                <span>
                  GLOW
                  <br />
                  YOUR WAY
                </span>
              </div>

              {/* Main visual */}
              <div className="relative mx-6 aspect-4/5 overflow-hidden rounded-4xl border-8 border-surface bg-surface-muted shadow-float sm:mx-10">
                {heroImageUrl ? (
                  <Image
                    src={heroImageUrl}
                    alt="Suara Wanita beauty"
                    fill
                    priority
                    sizes="(max-width: 640px) 75vw, (max-width: 1024px) 60vw, 500px"
                    className="object-cover"
                  />
                ) : null}

                <div className="absolute inset-0 flex flex-col justify-between p-6 sm:p-8">
                  <div className="flex justify-end">
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary text-text-primary shadow-soft">
                      <Sparkles size={22} />
                    </div>
                  </div>

                  <div className="rounded-2xl bg-surface/90 p-4 backdrop-blur">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-text-muted">
                      Today&apos;s beauty pick
                    </p>

                    <div className="mt-2 flex items-center justify-between gap-4">
                      <p className="min-w-0 text-sm font-semibold text-text-primary sm:text-base">
                        {heroTitle} {heroHighlight}
                      </p>

                      <ArrowDownRight
                        size={20}
                        className="shrink-0 text-secondary"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  )
}