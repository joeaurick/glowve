import type { MetadataRoute } from 'next'

function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!siteUrl) {
    return 'https://suarawanita.vercel.app'
  }

  return siteUrl.replace(/\/$/, '')
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/login/',
      ],
    },

    sitemap: `${siteUrl}/sitemap.xml`,
  }
}