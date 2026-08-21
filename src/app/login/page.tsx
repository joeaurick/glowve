'use client'

import {
  FormEvent,
  useState,
} from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  LockKeyhole,
  Mail,
} from 'lucide-react'

import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] =
    useState(false)
  const [errorMessage, setErrorMessage] =
    useState('')

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setErrorMessage('')
    setIsLoading(true)

    const { error } =
      await supabase.auth.signInWithPassword({
        email,
        password,
      })

    setIsLoading(false)

    if (error) {
      setErrorMessage(error.message)
      return
    }

    window.location.href = '/admin'
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8">
      <div className="pointer-events-none absolute -left-24 top-0 size-72 rounded-full bg-primary/30 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -right-24 size-72 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={16} />
          Kembali ke website
        </Link>

        <section className="rounded-4xl border border-border bg-surface p-5 shadow-card sm:p-8">
          {/* Logo */}
          <div className="flex justify-center">
            <div className="relative h-20 w-56 sm:w-64">
              <Image
                src="/images/suara-wanita-logo.png"
                alt="Suara Wanita"
                fill
                priority
                sizes="(max-width: 640px) 224px, 256px"
                className="object-contain"
              />
            </div>
          </div>

          <div className="mt-8">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
              Admin Dashboard
            </p>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">
              Selamat datang kembali.
            </h1>

            <p className="mt-3 text-sm leading-6 text-text-secondary">
              Masuk untuk mengelola artikel, produk,
              dan konten website.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5"
          >
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Email
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  placeholder="nama@email.com"
                  autoComplete="email"
                  required
                  disabled={isLoading}
                  className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm text-text-primary outline-none transition-shadow placeholder:text-text-muted focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted"
                />

                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(event) =>
                    setPassword(event.target.value)
                  }
                  placeholder="Masukkan password"
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                  className="h-12 w-full rounded-2xl border border-border bg-background pl-11 pr-4 text-sm text-text-primary outline-none transition-shadow placeholder:text-text-muted focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-60"
                />
              </div>
            </div>

            {errorMessage ? (
              <div
                role="alert"
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {errorMessage}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={isLoading}
              className="flex h-12 w-full items-center justify-center rounded-2xl bg-primary px-5 text-sm font-semibold text-text-primary transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading
                ? 'Memproses...'
                : 'Masuk ke Dashboard'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}