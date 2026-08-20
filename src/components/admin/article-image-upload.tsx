'use client'

import { ChangeEvent, useRef, useState } from 'react'
import Image from 'next/image'
import {
  ImagePlus,
  LoaderCircle,
  Trash2,
  Upload,
} from 'lucide-react'

import { compressImage } from '@/lib/image/compress-image'
import { supabase } from '@/lib/supabase/client'

type ArticleImageUploadProps = {
  value: string
  onChange: (url: string) => void
}

const BUCKET_NAME = 'article-images'

function getFilePathFromUrl(url: string) {
  const marker = `/storage/v1/object/public/${BUCKET_NAME}/`
  const index = url.indexOf(marker)

  if (index === -1) {
    return null
  }

  return decodeURIComponent(
    url.slice(index + marker.length),
  )
}

export function ArticleImageUpload({
  value,
  onChange,
}: ArticleImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const [isUploading, setIsUploading] =
    useState(false)

  const [isDeleting, setIsDeleting] =
    useState(false)

  const [errorMessage, setErrorMessage] =
    useState('')

  async function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const selectedFile =
      event.target.files?.[0]

    if (!selectedFile) {
      return
    }

    setErrorMessage('')
    setIsUploading(true)

    try {
      const compressedFile =
        await compressImage(selectedFile)

      const fileExtension = 'webp'

      const fileName =
        `${crypto.randomUUID()}.${fileExtension}`

      const filePath =
        `articles/${fileName}`

      const { error: uploadError } =
        await supabase.storage
          .from(BUCKET_NAME)
          .upload(filePath, compressedFile, {
            cacheControl: '31536000',
            contentType: 'image/webp',
            upsert: false,
          })

      if (uploadError) {
        throw uploadError
      }

      const { data } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath)

      if (!data.publicUrl) {
        throw new Error(
          'URL gambar gagal dibuat.',
        )
      }

      if (value) {
        const previousFilePath =
          getFilePathFromUrl(value)

        if (previousFilePath) {
          const { error: removeError } =
            await supabase.storage
              .from(BUCKET_NAME)
              .remove([previousFilePath])

          if (removeError) {
            console.error(
              'Failed to remove old image:',
              removeError,
            )
          }
        }
      }

      onChange(data.publicUrl)
    } catch (error) {
      console.error(
        'Failed to upload article image:',
        error,
      )

      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Gambar gagal diupload.',
      )
    } finally {
      setIsUploading(false)

      if (inputRef.current) {
        inputRef.current.value = ''
      }
    }
  }

  async function handleDelete() {
    if (!value) {
      return
    }

    const filePath =
      getFilePathFromUrl(value)

    if (!filePath) {
      onChange('')
      return
    }

    setErrorMessage('')
    setIsDeleting(true)

    try {
      const { error } =
        await supabase.storage
          .from(BUCKET_NAME)
          .remove([filePath])

      if (error) {
        throw error
      }

      onChange('')
    } catch (error) {
      console.error(
        'Failed to delete article image:',
        error,
      )

      setErrorMessage(
        'Gambar gagal dihapus. Silakan coba lagi.',
      )
    } finally {
      setIsDeleting(false)
    }
  }

  function openFilePicker() {
    inputRef.current?.click()
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {value ? (
        <div className="overflow-hidden rounded-2xl border border-border bg-background">
          <div className="relative aspect-video w-full bg-primary-soft">
            <Image
              src={value}
              alt="Gambar artikel"
              fill
              sizes="(max-width: 1024px) 100vw, 300px"
              className="object-cover"
            />
          </div>

          <div className="flex gap-3 p-3">
            <button
              type="button"
              onClick={openFilePicker}
              disabled={
                isUploading || isDeleting
              }
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-surface px-3 text-sm font-medium text-text-primary transition-colors hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isUploading ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Upload size={16} />
              )}

              Ganti
            </button>

            <button
              type="button"
              onClick={() => {
                void handleDelete()
              }}
              disabled={
                isUploading || isDeleting
              }
              aria-label="Hapus gambar"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-red-200 bg-red-50 text-red-600 transition-colors hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? (
                <LoaderCircle
                  size={16}
                  className="animate-spin"
                />
              ) : (
                <Trash2 size={16} />
              )}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={openFilePicker}
          disabled={isUploading}
          className="flex min-h-52 w-full flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background px-6 text-center transition-colors hover:border-primary hover:bg-primary-soft disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isUploading ? (
            <>
              <LoaderCircle
                size={28}
                className="animate-spin text-secondary"
              />

              <span className="mt-3 text-sm font-medium text-text-primary">
                Memproses gambar...
              </span>

              <span className="mt-1 text-xs text-text-muted">
                Gambar sedang dikompresi dan
                dikonversi ke WebP
              </span>
            </>
          ) : (
            <>
              <div className="flex size-12 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
                <ImagePlus size={22} />
              </div>

              <span className="mt-4 text-sm font-semibold text-text-primary">
                Upload gambar artikel
              </span>

              <span className="mt-2 max-w-60 text-xs leading-5 text-text-muted">
                JPG, PNG, atau WebP. Maksimal 5 MB.
                Gambar akan otomatis dikompresi.
              </span>
            </>
          )}
        </button>
      )}

      {errorMessage ? (
        <p
          role="alert"
          className="mt-3 text-xs leading-5 text-red-600"
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  )
}