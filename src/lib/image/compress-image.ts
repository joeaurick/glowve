import imageCompression from 'browser-image-compression'

type CompressImageOptions = {
  maxWidthOrHeight?: number
  maxSizeMB?: number
  quality?: number
}

const DEFAULT_OPTIONS: Required<CompressImageOptions> = {
  maxWidthOrHeight: 1600,
  maxSizeMB: 1,
  quality: 0.82,
}

export async function compressImage(
  file: File,
  options: CompressImageOptions = {},
): Promise<File> {
  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ]

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      'Format gambar tidak didukung. Gunakan JPG, PNG, atau WebP.',
    )
  }

  if (file.size > 5 * 1024 * 1024) {
    throw new Error(
      'Ukuran gambar maksimal 5 MB.',
    )
  }

  const config = {
    maxWidthOrHeight:
      options.maxWidthOrHeight ??
      DEFAULT_OPTIONS.maxWidthOrHeight,

    maxSizeMB:
      options.maxSizeMB ??
      DEFAULT_OPTIONS.maxSizeMB,

    initialQuality:
      options.quality ??
      DEFAULT_OPTIONS.quality,

    useWebWorker: true,

    fileType: 'image/webp' as const,
  }

  try {
    const compressedBlob = await imageCompression(
      file,
      config,
    )

    const originalName = file.name
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '-')
      .toLowerCase()

    const fileName = `${originalName || 'article-image'}.webp`

    return new File(
      [compressedBlob],
      fileName,
      {
        type: 'image/webp',
        lastModified: Date.now(),
      },
    )
  } catch (error) {
    console.error(
      'Failed to compress image:',
      error,
    )

    throw new Error(
      'Gambar gagal dikompresi. Silakan coba gambar lain.',
    )
  }
}