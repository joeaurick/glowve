'use client'

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/extension-bubble-menu'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import {
  Bold,
  ChevronDown,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
  Unlink,
  X,
} from 'lucide-react'

type ArticleEditorProps = {
  content: string
  onChange: (content: string) => void
}

type ToolbarButtonProps = {
  label: string
  isActive?: boolean
  onClick: () => void
  children: ReactNode
}

type HeadingLevel = 1 | 2 | 3 | 4

type LinkModalProps = {
  isOpen: boolean
  initialUrl: string
  onClose: () => void
  onSubmit: (url: string) => void
}

function parseEditorContent(value: string) {
  if (!value.trim()) {
    return undefined
  }

  try {
    return JSON.parse(value)
  } catch {
    return undefined
  }
}

function ToolbarButton({
  label,
  isActive = false,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(event) => {
        event.preventDefault()
      }}
      onClick={onClick}
      className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors sm:size-10 sm:rounded-xl ${
        isActive
          ? 'bg-primary text-text-primary'
          : 'text-text-secondary hover:bg-primary-soft hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  )
}

function LinkModal({
  isOpen,
  initialUrl,
  onClose,
  onSubmit,
}: LinkModalProps) {
  const [url, setUrl] = useState(initialUrl)

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl)
    }
  }, [initialUrl, isOpen])

  if (!isOpen) {
    return null
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    onSubmit(url.trim())
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup modal"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
      />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-border bg-surface p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
              <LinkIcon size={20} />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-text-primary">
              Tambahkan backlink
            </h3>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Masukkan URL tujuan untuk teks yang sedang
              dipilih.
            </p>
          </div>

          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-primary-soft hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-6"
        >
          <label
            htmlFor="backlink-url"
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            URL backlink
          </label>

          <input
            id="backlink-url"
            type="text"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value)
            }}
            placeholder="https://example.com"
            autoFocus
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40"
          />

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-2xl border border-border px-5 text-sm font-semibold text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
            >
              Batal
            </button>

            <button
              type="submit"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-text-primary transition-transform hover:-translate-y-0.5"
            >
              <LinkIcon size={17} />
              Simpan Link
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ArticleEditor({
  content,
  onChange,
}: ArticleEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  const [isLinkModalOpen, setIsLinkModalOpen] =
    useState(false)

  const [linkUrl, setLinkUrl] = useState('')

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4],
        },
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),

      BubbleMenu.configure({
        element: document.createElement('div'),
      }),
    ],

    content: parseEditorContent(content),

    editorProps: {
      attributes: {
        class:
          'article-editor-content min-h-105 break-words px-4 py-5 text-base leading-8 text-text-primary outline-none sm:px-6 sm:py-6',
      },
    },

    onUpdate: ({ editor: currentEditor }) => {
      onChange(
        JSON.stringify(
          currentEditor.getJSON(),
        ),
      )
    },
  })

  if (!isMounted || editor === null) {
    return (
      <div className="flex min-h-105 items-center justify-center rounded-2xl border border-border bg-background px-4 text-center text-sm text-text-muted">
        Memuat editor...
      </div>
    )
  }

  const currentEditor = editor

  function setHeading(level: HeadingLevel) {
    currentEditor
      .chain()
      .focus()
      .toggleHeading({ level })
      .run()
  }

  function changeBlockFormat(value: string) {
    if (value === 'paragraph') {
      currentEditor
        .chain()
        .focus()
        .setParagraph()
        .run()

      return
    }

    const levelMap: Record<
      string,
      HeadingLevel
    > = {
      'heading-1': 1,
      'heading-2': 2,
      'heading-3': 3,
      'heading-4': 4,
    }

    const level = levelMap[value]

    if (!level) {
      return
    }

    currentEditor
      .chain()
      .focus()
      .setHeading({ level })
      .run()
  }

  function openLinkModal() {
    const previousUrl =
      currentEditor.getAttributes('link')
        .href as string | undefined

    setLinkUrl(previousUrl ?? '')
    setIsLinkModalOpen(true)
  }

  function saveLink(url: string) {
    if (!url) {
      currentEditor
        .chain()
        .focus()
        .extendMarkRange('link')
        .unsetLink()
        .run()

      setIsLinkModalOpen(false)
      return
    }

    const normalizedUrl =
      url.startsWith('http://') ||
      url.startsWith('https://')
        ? url
        : `https://${url}`

    currentEditor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href: normalizedUrl,
      })
      .run()

    setIsLinkModalOpen(false)
  }

  function removeLink() {
    currentEditor
      .chain()
      .focus()
      .extendMarkRange('link')
      .unsetLink()
      .run()
  }

  const blockFormat = currentEditor.isActive(
    'heading',
    { level: 1 },
  )
    ? 'heading-1'
    : currentEditor.isActive(
          'heading',
          { level: 2 },
        )
      ? 'heading-2'
      : currentEditor.isActive(
            'heading',
            { level: 3 },
          )
        ? 'heading-3'
        : currentEditor.isActive(
              'heading',
              { level: 4 },
            )
          ? 'heading-4'
          : 'paragraph'

  return (
    <>
      <div className="w-full max-w-full overflow-hidden rounded-2xl border border-border bg-background">
        <div className="flex w-full flex-wrap items-center gap-1.5 border-b border-border p-2 sm:gap-1">
          <ToolbarButton
            label="Undo"
            onClick={() => {
              currentEditor
                .chain()
                .focus()
                .undo()
                .run()
            }}
          >
            <Undo2 size={17} />
          </ToolbarButton>

          <ToolbarButton
            label="Redo"
            onClick={() => {
              currentEditor
                .chain()
                .focus()
                .redo()
                .run()
            }}
          >
            <Redo2 size={17} />
          </ToolbarButton>

          <div className="hidden h-6 w-px bg-border sm:block" />

          <div className="relative min-w-0 flex-1 sm:flex-none">
            <select
              aria-label="Format teks"
              value={blockFormat}
              onChange={(event) => {
                changeBlockFormat(
                  event.target.value,
                )
              }}
              className="h-9 w-full min-w-0 appearance-none rounded-lg border border-border bg-surface py-0 pl-3 pr-8 text-sm font-medium text-text-primary outline-none transition-colors hover:bg-primary-soft focus:ring-2 focus:ring-primary/40 sm:h-10 sm:w-36 sm:rounded-xl"
            >
              <option value="paragraph">
                Paragraph
              </option>

              <option value="heading-1">
                Heading 1
              </option>

              <option value="heading-2">
                Heading 2
              </option>

              <option value="heading-3">
                Heading 3
              </option>

              <option value="heading-4">
                Heading 4
              </option>
            </select>

            <ChevronDown
              size={16}
              className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-secondary"
            />
          </div>

          <div className="hidden h-6 w-px bg-border sm:block" />

          <ToolbarButton
            label="Bold"
            isActive={currentEditor.isActive('bold')}
            onClick={() => {
              currentEditor
                .chain()
                .focus()
                .toggleBold()
                .run()
            }}
          >
            <Bold size={17} />
          </ToolbarButton>

          <ToolbarButton
            label="Italic"
            isActive={currentEditor.isActive('italic')}
            onClick={() => {
              currentEditor
                .chain()
                .focus()
                .toggleItalic()
                .run()
            }}
          >
            <Italic size={17} />
          </ToolbarButton>

          <ToolbarButton
            label="Tambah backlink"
            isActive={currentEditor.isActive('link')}
            onClick={openLinkModal}
          >
            <LinkIcon size={17} />
          </ToolbarButton>

          <ToolbarButton
            label="Hapus backlink"
            onClick={removeLink}
          >
            <Unlink size={17} />
          </ToolbarButton>

          <ToolbarButton
            label="Bullet list"
            isActive={currentEditor.isActive(
              'bulletList',
            )}
            onClick={() => {
              currentEditor
                .chain()
                .focus()
                .toggleBulletList()
                .run()
            }}
          >
            <List size={17} />
          </ToolbarButton>

          <ToolbarButton
            label="Ordered list"
            isActive={currentEditor.isActive(
              'orderedList',
            )}
            onClick={() => {
              currentEditor
                .chain()
                .focus()
                .toggleOrderedList()
                .run()
            }}
          >
            <ListOrdered size={17} />
          </ToolbarButton>

          <ToolbarButton
            label="Quote"
            isActive={currentEditor.isActive(
              'blockquote',
            )}
            onClick={() => {
              currentEditor
                .chain()
                .focus()
                .toggleBlockquote()
                .run()
            }}
          >
            <Quote size={17} />
          </ToolbarButton>
        </div>

        <div className="relative">
          <EditorContent
            editor={currentEditor}
          />
        </div>
      </div>

      <LinkModal
        isOpen={isLinkModalOpen}
        initialUrl={linkUrl}
        onClose={() => {
          setIsLinkModalOpen(false)
        }}
        onSubmit={saveLink}
      />

      <style jsx global>{`
        .article-editor-content {
          width: 100%;
          max-width: 100%;
          overflow-wrap: anywhere;
        }

        .article-editor-content h1 {
          margin-top: 2rem;
          margin-bottom: 1.25rem;
          font-size: 1.875rem;
          font-weight: 700;
          line-height: 1.2;
        }

        .article-editor-content h2 {
          margin-top: 1.75rem;
          margin-bottom: 1rem;
          font-size: 1.5rem;
          font-weight: 700;
          line-height: 1.3;
        }

        .article-editor-content h3 {
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          font-size: 1.25rem;
          font-weight: 600;
          line-height: 1.4;
        }

        .article-editor-content h4 {
          margin-top: 1.25rem;
          margin-bottom: 0.75rem;
          font-size: 1.125rem;
          font-weight: 600;
          line-height: 1.5;
        }

        .article-editor-content p {
          margin-bottom: 1rem;
        }

        .article-editor-content ul {
          margin-bottom: 1.25rem;
          list-style-type: disc;
          padding-left: 1.5rem;
        }

        .article-editor-content ol {
          margin-bottom: 1.25rem;
          list-style-type: decimal;
          padding-left: 1.5rem;
        }

        .article-editor-content li {
          margin-bottom: 0.375rem;
        }

        .article-editor-content blockquote {
          margin-top: 1.25rem;
          margin-bottom: 1.25rem;
          border-left: 4px solid var(--primary);
          padding-left: 1rem;
          font-style: italic;
        }

        .article-editor-content a {
          overflow-wrap: anywhere;
          text-decoration: underline;
          text-decoration-thickness: 2px;
          text-underline-offset: 4px;
        }

        .article-editor-bubble-menu {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          max-width: calc(100vw - 2rem);
          overflow-x: auto;
          border: 1px solid var(--border);
          border-radius: 1rem;
          background: var(--surface);
          padding: 0.375rem;
          box-shadow:
            0 20px 25px -5px rgb(0 0 0 / 0.1),
            0 8px 10px -6px rgb(0 0 0 / 0.1);
        }

        @media (min-width: 640px) {
          .article-editor-content h1 {
            font-size: 2.25rem;
          }

          .article-editor-content h2 {
            font-size: 1.875rem;
          }

          .article-editor-content h3 {
            font-size: 1.5rem;
          }

          .article-editor-content h4 {
            font-size: 1.25rem;
          }
        }
      `}</style>
    </>
  )
}