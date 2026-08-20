'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
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

export function Navbar({
  brandName = 'GLOWVÉ',
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
            className="flex items-center gap-2"
            onClick={handleCloseMenu}
          >
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-text-primary">
              <Sparkles
                size={17}
                strokeWidth={2.5}
              />
            </div>

            <span className="text-xl font-semibold tracking-tight text-text-primary">
              {brandName}
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-8 lg:flex">
            <Link
              href="#discover"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Discover
            </Link>

            <Link
              href="#reviews"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Reviews
            </Link>

            <Link
              href="#beauty-picks"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              Beauty Picks
            </Link>

            <Link
              href="#about"
              className="text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
            >
              About
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
              Explore
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
              className="flex size-10 items-center justify-center rounded-full bg-surface-muted text-text-primary lg:hidden"
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
                Discover
              </Link>

              <Link
                href="#reviews"
                onClick={handleCloseMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
              >
                Reviews
              </Link>

              <Link
                href="#beauty-picks"
                onClick={handleCloseMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
              >
                Beauty Picks
              </Link>

              <Link
                href="#about"
                onClick={handleCloseMenu}
                className="rounded-xl px-4 py-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface-muted hover:text-text-primary"
              >
                About
              </Link>
            </div>
          </nav>
        ) : null}
      </Container>
    </header>
  )
}