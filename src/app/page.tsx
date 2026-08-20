import { BeautyPicks } from '@/components/public/beauty-picks'
import { Footer } from '@/components/public/footer'
import { Hero } from '@/components/public/hero'
import { LatestReviews } from '@/components/public/latest-reviews'
import { Navbar } from '@/components/public/navbar'
import { TrendingTopics } from '@/components/public/trending-topics'
import { createClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = await createClient()

  const { data: settings, error } = await supabase
    .from('site_settings')
    .select('brand_name')
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error(
      'Failed to load brand name:',
      error,
    )
  }

  const brandName =
    settings?.brand_name || 'GLOWVÉ'

  return (
    <main className="min-h-screen bg-background">
      <Navbar brandName={brandName} />

      <Hero />

      <TrendingTopics />

      <LatestReviews />

      <BeautyPicks />

      <Footer />
    </main>
  )
}