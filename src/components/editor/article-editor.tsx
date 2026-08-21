'use client'

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import {
  Bold,
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

type BubblePosition = {
  top: number
  left: number
}

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
  const [url, setUrl] = useState('')

  useEffect(() => {
    if (isOpen) {
      setUrl(initialUrl)
    }
  }, [initialUrl, isOpen])

  if (!isOpen) {
    return null
  }

  function handleSave() {
    onSubmit(url.trim())
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup modal"
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      />

      <div className="relative z-101 w-full max-w-md rounded-3xl border border-border bg-surface p-5 shadow-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex size-11 items-center justify-center rounded-2xl bg-primary-soft text-text-primary">
              <LinkIcon size={20} />
            </div>

            <h3 className="mt-4 text-lg font-semibold text-text-primary">
              Tambahkan backlink
            </h3>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Masukkan URL tujuan untuk teks yang sedang dipilih.
            </p>
          </div>

          <button
            type="button"
            aria-label="Tutup modal"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-text-secondary transition-colors hover:bg-primary-soft hover:text-text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6">
          <label
            htmlFor="backlink-url"
            className="mb-2 block text-sm font-medium text-text-primary"
          >
            URL backlink
          </label>

          <input
            id="backlink-url"
            type="url"
            value={url}
            onChange={(event) => {
              setUrl(event.target.value)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault()
                handleSave()
              }
            }}
            placeholder="https://example.com"
            autoFocus
            className="h-12 w-full rounded-2xl border border-border bg-background px-4 text-sm text-text-primary outline-none placeholder:text-text-muted focus:ring-2 focus:ring-primary/40"
          />

          <p className="mt-2 text-xs leading-5 text-text-muted">
            Masukkan URL lengkap, misalnya https://example.com.
          </p>

          <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="h-11 rounded-2xl border border-border px-5 text-sm font-semibold text-text-secondary transition-colors hover:bg-background hover:text-text-primary"
            >
              Batal
            </button>

            <button
              type="button"
              onClick={handleSave}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-semibold text-text-primary transition-transform hover:-translate-y-0.5"
            >
              <LinkIcon size={17} />
              Simpan Link
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ArticleEditor({
  content,
  onChange,
}: ArticleEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  const [isBubbleMenuVisible, setIsBubbleMenuVisible] =
    useState(false)

  const [bubblePosition, setBubblePosition] =
    useState<BubblePosition>({
      top: 0,
      left: 0,
    })

  const [isLinkModalOpen, setIsLinkModalOpen] =
    useState(false)

  const [linkUrl, setLinkUrl] = useState('')

  const selectionRef = useRef<{
    from: number
    to: number
  } | null>(null)

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
    ],

    content: parseEditorContent(content),

    editorProps: {
      attributes: {
        class:
          'article-editor-content min-h-[420px] break-words px-4 py-5 text-base leading-8 text-text-primary outline-none sm:px-6 sm:py-6',
      },
    },

    onUpdate: ({ editor: currentEditor }) => {
      onChange(
        JSON.stringify(currentEditor.getJSON()),
      )
    },

    onSelectionUpdate: ({
      editor: currentEditor,
    }) => {
      updateBubbleMenu(currentEditor)
    },

    onFocus: ({ editor: currentEditor }) => {
      updateBubbleMenu(currentEditor)
    },

    onBlur: () => {
      window.setTimeout(() => {
        if (!isLinkModalOpen) {
          setIsBubbleMenuVisible(false)
        }
      }, 150)
    },
  })

  function updateBubbleMenu(
    currentEditor: NonNullable<typeof editor>,
  ) {
    const { from, to, empty } =
      currentEditor.state.selection

    if (empty || from === to) {
      setIsBubbleMenuVisible(false)
      return
    }

    selectionRef.current = {
      from,
      to,
    }

    const start = currentEditor.view.coordsAtPos(from)
    const end = currentEditor.view.coordsAtPos(to)

    const left =
      start.left + (end.right - start.left) / 2

    const top = Math.max(
      12,
      start.top - 12,
    )

    setBubblePosition({
      top,
      left,
    })

    setIsBubbleMenuVisible(true)
  }

  if (!isMounted || editor === null) {
    return (
      <div className="flex min-h-105 items-center justify-center rounded-2xl border border-border bg-background px-4 text-center text-sm text-text-muted">
        Memuat editor...
      </div>
    )
  }

  const currentEditor = editor

  function restoreSelection() {
    const savedSelection = selectionRef.current

    if (!savedSelection) {
      return
    }

    currentEditor
      .chain()
      .focus()
      .setTextSelection({
        from: savedSelection.from,
        to: savedSelection.to,
      })
      .run()
  }

  function setHeading(level: HeadingLevel) {
    restoreSelection()

    currentEditor
      .chain()
      .focus()
      .toggleHeading({ level })
      .run()
  }

  function openLinkModal() {
    const savedSelection = selectionRef.current

    if (savedSelection) {
      currentEditor
        .chain()
        .focus()
        .setTextSelection({
          from: savedSelection.from,
          to: savedSelection.to,
        })
        .run()
    }

    const previousUrl =
      currentEditor.getAttributes('link')
        .href as string | undefined

    setLinkUrl(previousUrl ?? '')
    setIsLinkModalOpen(true)
  }

  function closeLinkModal() {
    setIsLinkModalOpen(false)
    setIsBubbleMenuVisible(false)

    window.setTimeout(() => {
      currentEditor.commands.focus()
    }, 0)
  }

  function saveLink(url: string) {
    const savedSelection = selectionRef.current

    if (savedSelection) {
      currentEditor
        .chain()
        .focus()
        .setTextSelection({
          from: savedSelection.from,
          to: savedSelection.to,
        })
        .run()
    }

    if (!url) {
      currentEditor
        .chain()
        .focus()
        .extendMarkRange('link')
        .unsetLink()
        .run()

      setIsLinkModalOpen(false)
      setIsBubbleMenuVisible(false)

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
    setIsBubbleMenuVisible(false)
  }

  function removeLink() {
    restoreSelection()

    currentEditor
      .chain()
      .focus()
      .extendMarkRange('link')
      .unsetLink()
      .run()

    setIsBubbleMenuVisible(false)
  }

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
          <EditorContent editor={currentEditor} />
        </div>
      </div>

      {isBubbleMenuVisible ? (
        <div
          className="fixed z-90 flex max-w-[calc(100vw-24px)] -translate-x-1/2 -translate-y-full items-center gap-1 overflow-x-auto rounded-2xl border border-border bg-surface p-1.5 shadow-xl"
          style={{
            top: bubblePosition.top,
            left: bubblePosition.left,
          }}
          onMouseDown={(event) => {
            event.preventDefault()
          }}
        >
          <ToolbarButton
            label="Bold"
            isActive={currentEditor.isActive('bold')}
            onClick={() => {
              restoreSelection()

              currentEditor
                .chain()
                .focus()
                .toggleBold()
                .run()
            }}
          >
            <Bold size={16} />
          </ToolbarButton>

          <ToolbarButton
            label="Italic"
            isActive={currentEditor.isActive('italic')}
            onClick={() => {
              restoreSelection()

              currentEditor
                .chain()
                .focus()
                .toggleItalic()
                .run()
            }}
          >
            <Italic size={16} />
          </ToolbarButton>

          <div className="h-6 w-px shrink-0 bg-border" />

          <ToolbarButton
            label="Heading 1"
            isActive={currentEditor.isActive(
              'heading',
              {
                level: 1,
              },
            )}
            onClick={() => {
              setHeading(1)
            }}
          >
            <Heading1 size={17} />
          </ToolbarButton>

          <ToolbarButton
            label="Heading 2"
            isActive={currentEditor.isActive(
              'heading',
              {
                level: 2,
              },
            )}
            onClick={() => {
              setHeading(2)
            }}
          >
            <Heading2 size={17} />
          </ToolbarButton>

          <ToolbarButton
            label="Heading 3"
            isActive={currentEditor.isActive(
              'heading',
              {
                level: 3,
              },
            )}
            onClick={() => {
              setHeading(3)
            }}
          >
            <Heading3 size={17} />
          </ToolbarButton>

          <ToolbarButton
            label="Heading 4"
            isActive={currentEditor.isActive(
              'heading',
              {
                level: 4,
              },
            )}
            onClick={() => {
              setHeading(4)
            }}
          >
            <Heading4 size={17} />
          </ToolbarButton>

          <div className="h-6 w-px shrink-0 bg-border" />

          <ToolbarButton
            label="Tambah backlink"
            isActive={currentEditor.isActive('link')}
            onClick={openLinkModal}
          >
            <LinkIcon size={17} />
          </ToolbarButton>
        </div>
      ) : null}

      <LinkModal
        isOpen={isLinkModalOpen}
        initialUrl={linkUrl}
        onClose={closeLinkModal}
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