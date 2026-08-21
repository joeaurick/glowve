'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Menu, Search, X } from 'lucide-react'
import { useState } from 'react'

const navigation = [
  {
    name: 'Beranda',
    href: '/',
  },
  {
    name: 'Artikel',
    href: '#articles',
  },
  {
    name: 'Kategori',
    href: '#categories',
  },
  {
    name: 'Tentang',
    href: '#about',
  },
]

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  function closeMenu() {
    setIsMenuOpen(false)
  }

  return (
    <header className="relative z-50 px-4 pt-4 sm:px-6 sm:pt-5 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <nav className="flex h-16 items-center justify-between rounded-3xl border border-border bg-surface/90 px-4 shadow-soft backdrop-blur-xl sm:h-[72px] sm:px-6 lg:px-7">
          {/* Logo */}

          <Link
            href="/"
            aria-label="Suara Wanita"
            className="flex shrink-0 items-center"
            onClick={closeMenu}
          >
            <Image
              src="/images/suara-wanita-logo.png"
              alt="Suara Wanita"
              width={220}
              height={80}
              priority
              className="h-auto w-32 object-contain sm:w-36 lg:w-40"
            />
          </Link>

          {/* Desktop Navigation */}

          <div className="hidden items-center gap-7 lg:flex xl:gap-9">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}

          <div className="hidden items-center gap-3 lg:flex">
            <Link
              href="/search"
              aria-label="Cari"
              className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-secondary transition-transform hover:scale-105"
            >
              <Search size={18} />
            </Link>

            <Link
              href="#discover"
              className="inline-flex h-10 items-center gap-2 rounded-full bg-text-primary px-5 text-sm font-medium text-text-inverse transition-transform hover:-translate-y-0.5"
            >
              Jelajahi

              <span aria-hidden="true">
                →
              </span>
            </Link>
          </div>

          {/* Mobile Actions */}

          <div className="flex items-center gap-2 lg:hidden">
            <Link
              href="/search"
              aria-label="Cari"
              className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-secondary"
            >
              <Search size={18} />
            </Link>

            <button
              type="button"
              aria-label={
                isMenuOpen
                  ? 'Tutup menu'
                  : 'Buka menu'
              }
              onClick={() =>
                setIsMenuOpen(!isMenuOpen)
              }
              className="flex size-10 items-center justify-center rounded-full bg-text-primary text-text-inverse transition-transform active:scale-95"
            >
              {isMenuOpen ? (
                <X size={19} />
              ) : (
                <Menu size={20} />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}

        {isMenuOpen ? (
          <div className="mt-3 overflow-hidden rounded-3xl border border-border bg-surface p-3 shadow-card backdrop-blur-xl lg:hidden">
            <div className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMenu}
                  className="flex min-h-12 items-center rounded-2xl px-4 text-sm font-medium text-text-secondary transition-colors hover:bg-primary-soft hover:text-text-primary"
                >
                  {item.name}
                </Link>
              ))}
            </div>

            <div className="mt-3 border-t border-border pt-3">
              <Link
                href="#discover"
                onClick={closeMenu}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-text-primary px-5 text-sm font-semibold text-text-inverse"
              >
                Jelajahi

                <span aria-hidden="true">
                  →
                </span>
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </header>
  )
}