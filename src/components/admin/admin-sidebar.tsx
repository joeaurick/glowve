'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowUpRight,
  FileText,
  FolderTree,
  LayoutDashboard,
  LayoutTemplate,
  LogOut,
  Menu,
  Package,
  Settings,
  Sparkles,
  X,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Landing Page',
    href: '/admin/landing-page',
    icon: LayoutTemplate,
  },
  {
    name: 'Artikel',
    href: '/admin/articles',
    icon: FileText,
  },
  {
    name: 'Kategori',
    href: '/admin/categories',
    icon: FolderTree,
  },
  {
    name: 'Produk',
    href: '/admin/products',
    icon: Package,
  },
  {
    name: 'Pengaturan',
    href: '/admin/settings',
    icon: Settings,
  },
]

function isActivePath(
  pathname: string,
  href: string,
) {
  if (href === '/admin') {
    return pathname === '/admin'
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  )
}

type NavigationContentProps = {
  pathname: string
  brandName: string
  onNavigate?: () => void
  onLogout: () => void
}

function NavigationContent({
  pathname,
  brandName,
  onNavigate,
  onLogout,
}: NavigationContentProps) {
  return (
    <>
      <div className="px-5 pb-5 pt-6">
        <Link
          href="/admin"
          onClick={onNavigate}
          className="group flex items-center gap-3"
        >
          <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary text-text-primary transition-transform duration-300 group-hover:rotate-6">
            <Sparkles size={19} />
          </div>

          <div className="min-w-0">
            <p className="text-lg font-semibold tracking-tight text-text-primary">
              {brandName}
            </p>

            <p className="text-xs text-text-muted">
              Content Studio
            </p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4">
        <p className="px-3 pb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-text-muted">
          Workspace
        </p>

        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon

            const active = isActivePath(
              pathname,
              item.href,
            )

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`group flex h-12 items-center gap-3 rounded-2xl px-3.5 text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-primary-soft text-text-primary'
                    : 'text-text-secondary hover:bg-background hover:text-text-primary'
                }`}
              >
                <span
                  className={`flex size-8 shrink-0 items-center justify-center rounded-xl transition-colors ${
                    active
                      ? 'bg-primary text-text-primary'
                      : 'text-text-muted group-hover:bg-surface group-hover:text-text-primary'
                  }`}
                >
                  <Icon size={17} />
                </span>

                <span>{item.name}</span>

                {active ? (
                  <span className="ml-auto size-1.5 rounded-full bg-secondary" />
                ) : null}
              </Link>
            )
          })}
        </div>

        <div className="mt-8 px-3">
          <div className="rounded-3xl bg-primary-soft p-4">
            <div className="flex items-center gap-2">
              <Sparkles
                size={15}
                className="text-secondary"
              />

              <p className="text-xs font-semibold text-text-primary">
                {brandName} Beauty Guide
              </p>
            </div>

            <p className="mt-2 text-xs leading-5 text-text-secondary">
              Kelola artikel, kategori, dan produk
              untuk website {brandName}.
            </p>

            <Link
              href="/"
              onClick={onNavigate}
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-text-primary transition-colors hover:text-secondary"
            >
              Lihat website
              <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      <div className="border-t border-border p-4">
        <div className="rounded-3xl bg-background p-3">
          <div className="flex items-center gap-3 px-1 py-2">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-text-primary">
              A
            </div>

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-text-primary">
                Administrator
              </p>

              <p className="truncate text-xs text-text-muted">
                {brandName} Admin
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="mt-2 flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm font-medium text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
          >
            <LogOut size={17} />
            Keluar
          </button>
        </div>
      </div>
    </>
  )
}

export function AdminSidebar() {
  const pathname = usePathname()

  const [isMobileOpen, setIsMobileOpen] =
    useState(false)

  const [brandName, setBrandName] =
    useState('GLOWVÉ')

  useEffect(() => {
    async function loadBrandName() {
      const { data, error } = await supabase
        .from('site_settings')
        .select('brand_name')
        .limit(1)
        .maybeSingle()

      if (error) {
        console.error(
          'Failed to load brand name:',
          error,
        )

        return
      }

      if (data?.brand_name?.trim()) {
        setBrandName(data.brand_name.trim())
      }
    }

    void loadBrandName()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()

    window.location.href = '/login'
  }

  function closeMenu() {
    setIsMobileOpen(false)
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 flex-col overflow-y-auto border-r border-border bg-surface lg:flex">
        <NavigationContent
          pathname={pathname}
          brandName={brandName}
          onLogout={() => {
            void handleLogout()
          }}
        />
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-xl lg:hidden">
        <Link
          href="/admin"
          className="flex items-center gap-2.5"
        >
          <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-text-primary">
            <Sparkles size={17} />
          </div>

          <div>
            <p className="text-sm font-semibold tracking-tight text-text-primary">
              {brandName}
            </p>

            <p className="text-[10px] uppercase tracking-[0.16em] text-text-muted">
              Studio
            </p>
          </div>
        </Link>

        <button
          type="button"
          aria-label="Buka menu navigasi"
          onClick={() => setIsMobileOpen(true)}
          className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-text-primary transition-transform active:scale-95"
        >
          <Menu size={20} />
        </button>
      </header>

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          isMobileOpen
            ? 'pointer-events-auto'
            : 'pointer-events-none'
        }`}
      >
        <button
          type="button"
          aria-label="Tutup menu"
          onClick={closeMenu}
          className={`absolute inset-0 bg-text-primary/25 backdrop-blur-sm transition-opacity duration-300 ${
            isMobileOpen
              ? 'opacity-100'
              : 'opacity-0'
          }`}
        />

        <aside
  className={`absolute inset-y-0 right-0 flex w-[min(21rem,calc(100vw-2rem))] flex-col overflow-y-auto bg-surface shadow-2xl transition-transform duration-300 ease-out ${
            isMobileOpen
              ? 'translate-x-0'
              : 'translate-x-full'
          }`}
        >
          <div className="absolute right-4 top-4 z-10">
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={closeMenu}
              className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-text-primary transition-transform active:scale-95"
            >
              <X size={19} />
            </button>
          </div>

          <NavigationContent
            pathname={pathname}
            brandName={brandName}
            onNavigate={closeMenu}
            onLogout={() => {
              void handleLogout()
            }}
          />
        </aside>
      </div>
    </>
  )
}