import type { MetadataRoute } from 'next'

import { createClient } from '@/lib/supabase/server'

function getSiteUrl() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!siteUrl) {
    return 'http://localhost:3000'
  }

  return siteUrl.replace(/\/$/, '')
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const siteUrl = getSiteUrl()

  const { data: articles, error: articlesError } =
    await supabase
      .from('articles')
      .select(`
        slug,
        updated_at
      `)
      .eq('status', 'published')
      .not('slug', 'is', null)

  if (articlesError) {
    console.error(
      'Failed to load articles for sitemap:',
      articlesError,
    )
  }

  const { data: categories, error: categoriesError } =
    await supabase
      .from('categories')
      .select(`
        slug,
        updated_at
      `)
      .not('slug', 'is', null)

  if (categoriesError) {
    console.error(
      'Failed to load categories for sitemap:',
      categoriesError,
    )
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${siteUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ]

  const articlePages: MetadataRoute.Sitemap =
    (articles ?? []).map((article) => ({
      url: `${siteUrl}/reviews/${article.slug}`,
      lastModified: article.updated_at
        ? new Date(article.updated_at)
        : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  const categoryPages: MetadataRoute.Sitemap =
    (categories ?? []).map((category) => ({
      url: `${siteUrl}/reviews/category/${category.slug}`,
      lastModified: category.updated_at
        ? new Date(category.updated_at)
        : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }))

  return [
    ...staticPages,
    ...articlePages,
    ...categoryPages,
  ]
}