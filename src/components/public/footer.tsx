import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import { siInstagram } from 'simple-icons/icons'

import { Container } from '@/components/ui/container'
import { createClient } from '@/lib/supabase/server'

export async function Footer() {
  const supabase = await createClient()

  const {
    data: siteSettings,
    error: siteSettingsError,
  } = await supabase
    .from('site_settings')
    .select('brand_name')
    .limit(1)
    .maybeSingle()

  const {
    data: footerSettings,
    error: footerSettingsError,
  } = await supabase
    .from('footer_settings')
    .select(`
      description,
      copyright_text
    `)
    .limit(1)
    .maybeSingle()

  if (siteSettingsError) {
    console.error(
      'Failed to load site settings:',
      siteSettingsError,
    )
  }

  if (footerSettingsError) {
    console.error(
      'Failed to load footer settings:',
      footerSettingsError,
    )
  }

  const brandName =
    siteSettings?.brand_name || 'Suara Wanita'

  const description =
    footerSettings?.description ||
    'Beauty reviews, honest recommendations, dan produk pilihan untuk membantu kamu menemukan yang paling cocok.'

  const copyright =
    footerSettings?.copyright_text ||
    `© ${new Date().getFullYear()} ${brandName}. All rights reserved.`

  return (
    <footer
      id="about"
      className="border-t border-border bg-surface-dark text-text-inverse"
    >
      <Container>
        <div className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-text-primary">
                <Sparkles size={17} />
              </div>

              <span className="text-xl font-semibold">
                {brandName}
              </span>
            </div>

            <p className="mt-5 max-w-md text-sm leading-7 text-white/60">
              {description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-sm font-semibold">
                Explore
              </p>

              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href="#discover"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  Discover
                </Link>

                <Link
                  href="#reviews"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  Reviews
                </Link>

                <Link
                  href="#beauty-picks"
                  className="text-sm text-white/60 transition-colors hover:text-white"
                >
                  Beauty Picks
                </Link>
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold">
                Follow
              </p>

              <a
                href="#"
                aria-label={`Follow ${brandName} on Instagram`}
                className="mt-4 flex items-center gap-2 text-sm text-white/60 transition-colors hover:text-white"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="17"
                  height="17"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d={siInstagram.path} />
                </svg>

                Instagram
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 py-6">
          <p className="text-xs text-white/40">
            {copyright}
          </p>
        </div>
      </Container>
    </footer>
  )
}