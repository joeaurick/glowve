'use client'

import {
  FormEvent,
  useEffect,
  useState,
} from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  CheckCircle2,
  LoaderCircle,
  Package,
  Save,
} from 'lucide-react'

import { ProductImageUpload } from '@/components/admin/product-image-upload'
import { supabase } from '@/lib/supabase/client'

type ProductStatus = 'draft' | 'published'

type Category = {
  id: string
  name: string
}

type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  featured_image: string | null
  brand: string | null
  price: number | null
  category_id: string | null
  status: ProductStatus
}

function createSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

export default function EditProductPage() {
  const params = useParams()

  const productId =
    typeof params.id === 'string'
      ? params.id
      : ''

  const [categories, setCategories] = useState<
    Category[]
  >([])

  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [brand, setBrand] = useState('')
  const [description, setDescription] =
    useState('')
  const [featuredImage, setFeaturedImage] =
    useState('')
  const [price, setPrice] = useState('')
  const [categoryId, setCategoryId] =
    useState('')
  const [status, setStatus] =
    useState<ProductStatus>('draft')

  const [isLoading, setIsLoading] =
    useState(true)

  const [isSaving, setIsSaving] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState('')

  const [successMessage, setSuccessMessage] =
    useState('')

  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      setErrorMessage('')

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        window.location.href = '/login'
        return
      }

      const { data: adminUser } = await supabase
        .from('admin_users')
        .select('user_id')
        .eq('user_id', user.id)
        .maybeSingle()

      if (!adminUser) {
        await supabase.auth.signOut()
        window.location.href = '/login'
        return
      }

      const [
        productResult,
        categoriesResult,
      ] = await Promise.all([
        supabase
          .from('products')
          .select(`
            id,
            name,
            slug,
            description,
            featured_image,
            brand,
            price,
            category_id,
            status
          `)
          .eq('id', productId)
          .maybeSingle(),

        supabase
          .from('categories')
          .select('id, name')
          .order('name', {
            ascending: true,
          }),
      ])

      if (
        productResult.error ||
        !productResult.data
      ) {
        console.error(
          'Failed to load product:',
          productResult.error,
        )

        setErrorMessage(
          'Produk tidak ditemukan.',
        )
        setIsLoading(false)
        return
      }

      if (categoriesResult.error) {
        console.error(
          'Failed to load categories:',
          categoriesResult.error,
        )

        setErrorMessage(
          'Kategori gagal dimuat.',
        )
        setIsLoading(false)
        return
      }

      const product =
        productResult.data as Product

      setCategories(
        categoriesResult.data ?? [],
      )

      setName(product.name)
      setSlug(product.slug)
      setBrand(product.brand ?? '')
      setDescription(product.description ?? '')
      setFeaturedImage(
        product.featured_image ?? '',
      )
      setPrice(
        product.price !== null
          ? String(product.price)
          : '',
      )
      setCategoryId(
        product.category_id ?? '',
      )
      setStatus(product.status)

      setIsLoading(false)
    }

    if (productId) {
      void loadData()
    }
  }, [productId])

  function handleNameChange(value: string) {
    setName(value)
    setSlug(createSlug(value))
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setErrorMessage('')
    setSuccessMessage('')

    if (!name.trim()) {
      setErrorMessage(
        'Nama produk wajib diisi.',
      )
      return
    }

    if (!slug.trim()) {
      setErrorMessage(
        'Slug produk wajib diisi.',
      )
      return
    }

    const parsedPrice = price.trim()
      ? Number(price)
      : null

    if (
      parsedPrice !== null &&
      (Number.isNaN(parsedPrice) ||
        parsedPrice < 0)
    ) {
      setErrorMessage(
        'Harga produk tidak valid.',
      )
      return
    }

    setIsSaving(true)

    const { error } = await supabase
      .from('products')
      .update({
        name: name.trim(),
        slug: slug.trim(),
        description:
          description.trim() || null,
        featured_image:
          featuredImage.trim() || null,
        brand: brand.trim() || null,
        price: parsedPrice,
        category_id: categoryId || null,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', productId)

    if (error) {
      console.error(
        'Failed to update product:',
        error,
      )

      if (error.code === '23505') {
        setErrorMessage(
          'Slug produk sudah digunakan.',
        )
      } else {
        setErrorMessage(
          'Produk gagal diperbarui.',
        )
      }

      setIsSaving(false)
      return
    }

    setSuccessMessage(
      'Produk berhasil diperbarui.',
    )

    setIsSaving(false)

    setTimeout(() => {
      window.location.href =
        '/admin/products'
    }, 800)
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-text-secondary">
          <LoaderCircle
            size={20}
            className="animate-spin"
          />
          Memuat produk...
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <Link
          href="/admin/products"
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft size={17} />
          Kembali ke produk
        </Link>

        <div className="mt-6">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
            <Package size={22} />
          </div>

          <p className="mt-5 text-sm font-semibold uppercase tracking-[0.16em] text-secondary">
            Catalog
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl">
            Edit Produk
          </h1>

          <p className="mt-3 text-sm leading-6 text-text-secondary sm:text-base">
            Perbarui informasi produk di katalog.
          </p>
        </div>

        {errorMessage ? (
          <div
            role="alert"
            className="mt-8 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {errorMessage}
          </div>
        ) : null}

        {successMessage ? (
          <div className="mt-8 flex items-center gap-2 rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        ) : null}

        <form
          onSubmit={handleSubmit}
          className="mt-8 rounded-3xl border border-border bg-surface p-5 sm:p-8"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label
                htmlFor="name"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Nama produk *
              </label>

              <input
                id="name"
                type="text"
                value={name}
                onChange={(event) =>
                  handleNameChange(
                    event.target.value,
                  )
                }
                required
                disabled={isSaving}
                className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="slug"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Slug *
              </label>

              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(event) =>
                  setSlug(
                    createSlug(event.target.value),
                  )
                }
                required
                disabled={isSaving}
                className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label
                htmlFor="brand"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Brand
              </label>

              <input
                id="brand"
                type="text"
                value={brand}
                onChange={(event) =>
                  setBrand(event.target.value)
                }
                disabled={isSaving}
                className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div>
              <label
                htmlFor="price"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Harga
              </label>

              <input
                id="price"
                type="number"
                min="0"
                value={price}
                onChange={(event) =>
                  setPrice(event.target.value)
                }
                disabled={isSaving}
                className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="category"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Kategori
              </label>

              <select
                id="category"
                value={categoryId}
                onChange={(event) =>
                  setCategoryId(event.target.value)
                }
                disabled={isSaving}
                className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="">
                  Pilih kategori
                </option>

                {categories.map((category) => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-text-primary">
                Gambar produk
              </label>

              <ProductImageUpload
                value={featuredImage}
                onChange={setFeaturedImage}
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="description"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Deskripsi
              </label>

              <textarea
                id="description"
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                rows={6}
                disabled={isSaving}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm leading-6 text-text-primary outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="status"
                className="mb-2 block text-sm font-medium text-text-primary"
              >
                Status
              </label>

              <select
                id="status"
                value={status}
                onChange={(event) =>
                  setStatus(
                    event.target
                      .value as ProductStatus,
                  )
                }
                disabled={isSaving}
                className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text-primary outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="draft">
                  Draft
                </option>

                <option value="published">
                  Published
                </option>
              </select>
            </div>
          </div>

          <div className="mt-8 flex flex-col-reverse gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end">
            <Link
              href="/admin/products"
              className="inline-flex h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
            >
              Batal
            </Link>

            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-primary px-6 text-sm font-semibold text-text-primary transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? (
                <>
                  <LoaderCircle
                    size={18}
                    className="animate-spin"
                  />
                  Menyimpan...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Simpan perubahan
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}