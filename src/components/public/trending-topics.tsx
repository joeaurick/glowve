import Link from 'next/link'
import {
  ArrowUpRight,
  Droplets,
  Flower2,
  Palette,
  Sparkles,
  type LucideIcon,
} from 'lucide-react'

import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { createClient } from '@/lib/supabase/server'

type Category = {
  id: string
  name: string
  slug: string
}

type TopicStyle = {
  icon: LucideIcon
  description: string
  className: string
}

const topicStyles: Record<string, TopicStyle> = {
  skincare: {
    icon: Droplets,
    description:
      'Cari tahu apa yang benar-benar dibutuhkan kulitmu.',
    className: 'bg-primary',
  },
  makeup: {
    icon: Palette,
    description:
      'Warna, tekstur, dan produk yang cocok untukmu.',
    className: 'bg-secondary',
  },
  fragrance: {
    icon: Flower2,
    description:
      'Temukan aroma yang terasa seperti dirimu.',
    className: 'bg-accent',
  },
}

const fallbackStyles: TopicStyle[] = [
  {
    icon: Sparkles,
    description:
      'Jelajahi pilihan dan rekomendasi beauty terbaik.',
    className: 'bg-primary',
  },
  {
    icon: Palette,
    description:
      'Temukan inspirasi dan produk sesuai kebutuhanmu.',
    className: 'bg-secondary',
  },
  {
    icon: Flower2,
    description:
      'Eksplor berbagai pilihan yang menarik untukmu.',
    className: 'bg-accent',
  },
]

function getTopicStyle(
  category: Category,
  index: number,
) {
  const normalizedSlug = category.slug
    .trim()
    .toLowerCase()

  return (
    topicStyles[normalizedSlug] ??
    fallbackStyles[index % fallbackStyles.length]
  )
}

async function getTrendingTopics() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name', {
      ascending: true,
    })
    .limit(6)

  if (error) {
    console.error(
      'Failed to load trending topics:',
      error,
    )

    return []
  }

  return (data ?? []) as Category[]
}

export async function TrendingTopics() {
  const topics = await getTrendingTopics()

  if (topics.length === 0) {
    return null
  }

  return (
    <Section
      id="discover"
      spacing="lg"
      className="relative overflow-hidden"
    >
      <Container>
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2">
              <Sparkles
                size={17}
                className="text-secondary"
              />

              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary">
                Explore by mood
              </p>
            </div>

            <h2 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-text-primary sm:text-5xl">
              Lagi ingin eksplor
              <span className="relative ml-2 inline-block">
                apa?
                <span className="absolute bottom-1 left-0 -z-10 h-3 w-full rounded-full bg-primary sm:h-4" />
              </span>
            </h2>

            <p className="mt-5 max-w-xl text-base leading-7 text-text-secondary sm:text-lg">
              Mulai perjalanan beauty-mu dari kategori
              yang paling menarik perhatianmu hari ini.
            </p>
          </div>

          <p className="max-w-xs text-sm leading-6 text-text-muted lg:text-right">
            Review, rekomendasi, dan pilihan produk yang
            dikurasi dengan lebih sederhana dan mudah
            dipahami.
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {topics.map((topic, index) => {
            const style = getTopicStyle(
              topic,
              index,
            )

            const Icon = style.icon

            return (
              <Link
                key={topic.id}
                href={`/reviews/category/${topic.slug}`}
                className="group relative min-h-64 overflow-hidden rounded-3xl p-6 transition-transform duration-300 hover:-translate-y-1 sm:p-8"
              >
                <div
                  className={`absolute inset-0 ${style.className} opacity-90`}
                />

                <div className="absolute -right-10 -top-10 size-40 rounded-full bg-white/20 transition-transform duration-500 group-hover:scale-125" />

                <div className="relative flex h-full flex-col justify-between">
                  <div className="flex items-start justify-between">
                    <div className="flex size-12 items-center justify-center rounded-full bg-surface/80 text-text-primary backdrop-blur-sm">
                      <Icon size={23} />
                    </div>

                    <div className="flex size-10 items-center justify-center rounded-full bg-surface-dark text-text-inverse transition-transform duration-300 group-hover:rotate-45">
                      <ArrowUpRight size={19} />
                    </div>
                  </div>

                  <div className="mt-16">
                    <h3 className="text-3xl font-semibold tracking-tight text-text-primary">
                      {topic.name}
                    </h3>

                    <p className="mt-3 max-w-xs text-sm leading-6 text-text-primary/70">
                      {style.description}
                    </p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}