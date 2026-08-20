import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'

import './globals.css'

import { createClient } from '@/lib/supabase/server'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!siteUrl) {
    return undefined
  }

  try {
    return new URL(siteUrl)
  } catch {
    console.error(
      'NEXT_PUBLIC_SITE_URL is invalid:',
      siteUrl,
    )

    return undefined
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient()

  const { data: settings, error } = await supabase
    .from('site_settings')
    .select(`
      brand_name,
      site_title,
      site_description,
      google_site_verification
    `)
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error(
      'Failed to load site settings for metadata:',
      error,
    )
  }

  const brandName =
    settings?.brand_name?.trim() || 'GLOWVÉ'

  const siteTitle =
    settings?.site_title?.trim() || brandName

  const siteDescription =
    settings?.site_description?.trim() ||
    `${brandName} menghadirkan beauty reviews, honest recommendations, dan produk pilihan untuk membantu kamu menemukan yang paling cocok.`

  const googleSiteVerification =
    settings?.google_site_verification?.trim() ||
    undefined

  const metadataBase = getSiteUrl()

  return {
    metadataBase,

    title: {
      default: siteTitle,
      template: `%s | ${brandName}`,
    },

    description: siteDescription,

    applicationName: brandName,

    alternates: {
      canonical: '/',
    },

    verification: {
      google: googleSiteVerification,
    },

    openGraph: {
      type: 'website',
      siteName: brandName,
      title: siteTitle,
      description: siteDescription,
      locale: 'id_ID',
      url: '/',
    },

    twitter: {
      card: 'summary_large_image',
      title: siteTitle,
      description: siteDescription,
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  }
}

export default function RootLayout({
  children,
}: LayoutProps<'/'>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  )
}