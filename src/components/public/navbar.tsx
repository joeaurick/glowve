'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  ArrowRight,
  Menu,
  Search,
  Sparkles,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

type NavbarProps = {
  brandName?: string
}

const navigation = [
  {
    label: 'Beranda',
    href: '/',
  },
  {
    label: 'Artikel',
    href: '#discover',
  },
  {
    label: 'Kategori',
    href: '#categories',
  },
  {
    label: 'Tentang',
    href: '#about',
  },
]

export function Navbar({
  brandName = 'SUARA WANITA',
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false)

  function handleCloseMenu() {
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-5">
      <Container>
        <div className="relative rounded-[1.75rem] border border-border bg-surface/90 shadow-card backdrop-blur-xl">
          <div className="flex h-16 items-center justify-between px-4 sm:h-20 sm:px-6">
            {/* Brand */}
            <Link
              href="/"
              onClick={handleCloseMenu}
              className="group flex items-center gap-3"
            >
              <div className="relative flex size-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-text-inverse shadow-soft transition-all duration-300 group-hover:-rotate-6 group-hover:scale-110 sm:size-11">
                <Sparkles
                  size={20}
                  strokeWidth={2.5}
                />

                <div className="absolute -right-1 -top-1 size-3 rounded-full bg-secondary" />
              </div>

              <div className="min-w-0">
                <p className="text-base font-bold tracking-[-0.04em] text-text-primary sm:text-lg">
                  {brandName}
                </p>

                <p className="hidden text-[9px] font-bold uppercase tracking-[0.18em] text-secondary sm:block">
                  Ruang untuk bersuara
                </p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden items-center gap-1 lg:flex">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-4 py-2.5 text-sm font-semibold text-text-secondary transition-all duration-200 hover:bg-primary-soft hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Cari artikel"
                className="flex size-10 items-center justify-center rounded-2xl bg-primary-soft text-primary transition-all hover:-translate-y-0.5 hover:scale-105 sm:size-11"
              >
                <Search size={19} />
              </button>

              <Button
                variant="dark"
                size="sm"
                className="hidden gap-2 rounded-2xl px-5 shadow-soft sm:inline-flex"
                asChild
              >
                <Link href="#discover">
                  Jelajahi

                  <ArrowRight size={16} />
                </Link>
              </Button>

              {/* Mobile menu */}
              <button
                type="button"
                aria-label={
                  isMenuOpen
                    ? 'Tutup menu'
                    : 'Buka menu'
                }
                onClick={() =>
                  setIsMenuOpen((current) => !current)
                }
                className="flex size-10 items-center justify-center rounded-2xl bg-secondary text-text-inverse transition-all active:scale-95 lg:hidden"
              >
                {isMenuOpen ? (
                  <X size={21} />
                ) : (
                  <Menu size={21} />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`overflow-hidden transition-all duration-300 lg:hidden ${
              isMenuOpen
                ? 'max-h-128 opacity-100'
                : 'max-h-0 opacity-0'
            }`}
          >
            <div className="border-t border-border px-4 pb-4 pt-3">
              <nav className="grid gap-2">
                {navigation.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleCloseMenu}
                    className={`group flex items-center justify-between rounded-2xl px-4 py-4 text-sm font-semibold transition-all ${
                      index % 2 === 0
                        ? 'bg-primary-soft text-text-primary'
                        : 'bg-secondary-soft text-text-primary'
                    }`}
                  >
                    <span>{item.label}</span>

                    <span className="flex size-8 items-center justify-center rounded-full bg-surface text-primary transition-transform group-hover:translate-x-1">
                      <ArrowRight size={16} />
                    </span>
                  </Link>
                ))}

                <Link
                  href="#discover"
                  onClick={handleCloseMenu}
                  className="mt-2 flex items-center justify-between rounded-2xl bg-primary px-5 py-4 text-sm font-bold text-text-inverse shadow-soft"
                >
                  Mulai Jelajahi

                  <span className="flex size-8 items-center justify-center rounded-full bg-surface/20">
                    <ArrowRight size={17} />
                  </span>
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </Container>
    </header>
  )
}