'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Menu,
  Search,
  X,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'

type NavbarProps = {
  brandName: string
}

export function Navbar({
  brandName,
}: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] =
    useState(false)

  function handleCloseMenu() {
    setIsMenuOpen(false)
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-xl">
      <Container>
        <div className="flex h-16 items-center justify-between sm:h-20">
          {/* Logo */}
          <Link
            href="/"
            onClick={handleCloseMenu}
            className="flex min-w-0 items-center gap-3"
          >
            <div className="relative size-10 shrink-0 overflow-hidden sm:size-11">
              <Image
                src="/images/suara-wanita-logo.png"
                alt="Suara Wanita"
                fill
                priority
                sizes="(max-width: 640px) 40px, 44px"
                className="object-contain"
              />
            </div>

            <div className="min-w-0">
              <span className="block truncate text-base font-semibold tracking-tight text-text-primary sm:text-lg">
                {brandName}
              </span>

              <span className="hidden text-[9px] font-medium uppercase tracking-[0.18em] text-text-muted sm:block">
                Ruang untuk bersuara
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            <Link
              href="#discover"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Beranda
            </Link>

            <Link
              href="#reviews"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Artikel
            </Link>

            <Link
              href="#beauty-picks"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Pilihan
            </Link>

            <Link
              href="#about"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Tentang
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Cari"
              className="flex size-10 items-center justify-center rounded-full text-text-primary transition-colors hover:bg-surface-muted"
            >
              <Search size={20} />
            </button>

            <Button
              variant="dark"
              size="sm"
              className="hidden sm:inline-flex"
            >
              Jelajahi
            </Button>

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
              className="flex size-10 items-center justify-center rounded-full bg-surface-muted text-text-primary transition-colors lg:hidden"
            >
              {isMenuOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen ? (
          <nav className="border-t border-border py-4 lg:hidden">
            <div className="flex flex-col gap-1">
              <Link
                href="#discover"
                onClick={handleCloseMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
              >
                Beranda
              </Link>

              <Link
                href="#reviews"
                onClick={handleCloseMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
              >
                Artikel
              </Link>

              <Link
                href="#beauty-picks"
                onClick={handleCloseMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
              >
                Pilihan
              </Link>

              <Link
                href="#about"
                onClick={handleCloseMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
              >
                Tentang
              </Link>

              <div className="mt-3 border-t border-border pt-3">
                <Button
                  variant="dark"
                  size="lg"
                  className="w-full"
                >
                  Jelajahi
                </Button>
              </div>
            </div>
          </nav>
        ) : null}
      </Container>
    </header>
  )
}