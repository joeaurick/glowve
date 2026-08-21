import { BeautyPicks } from '@/components/public/beauty-picks'
import { Footer } from '@/components/public/footer'
import { Hero } from '@/components/public/hero'
import { LatestReviews } from '@/components/public/latest-reviews'
import { Navbar } from '@/components/public/navbar'
import { TrendingTopics } from '@/components/public/trending-topics'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <Hero />

      <TrendingTopics />

      <LatestReviews />

      <BeautyPicks />

      <Footer />
    </main>
  )
}