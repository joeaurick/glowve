'use client'

import { useEffect, useState } from 'react'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import {
  Bold,
  ChevronDown,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Quote,
  Redo2,
  Undo2,
} from 'lucide-react'

type ArticleEditorProps = {
  content: string
  onChange: (content: string) => void
}

type ToolbarButtonProps = {
  label: string
  isActive?: boolean
  onClick: () => void
  children: React.ReactNode
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
      onClick={onClick}
      className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors sm:size-10 sm:rounded-xl ${
        isActive
          ? 'bg-primary text-text-primary'
          : 'text-text-secondary hover:bg-surface hover:text-text-primary'
      }`}
    >
      {children}
    </button>
  )
}

export function ArticleEditor({
  content,
  onChange,
}: ArticleEditorProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),

      Link.configure({
        openOnClick: false,
        autolink: true,
        linkOnPaste: true,
        HTMLAttributes: {
          rel: 'noopener noreferrer nofollow',
          target: '_blank',
        },
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
      onChange(JSON.stringify(currentEditor.getJSON()))
    },
  })

  if (!isMounted || editor === null) {
    return (
      <div className="flex min-h-105 items-center justify-center rounded-b-2xl bg-background px-4 text-center text-sm text-text-muted">
        Memuat editor...
      </div>
    )
  }

  const currentEditor = editor

  function changeBlockFormat(value: string) {
    if (value === 'paragraph') {
      currentEditor.chain().focus().setParagraph().run()
      return
    }

    if (value === 'heading-1') {
      currentEditor
        .chain()
        .focus()
        .setHeading({ level: 1 })
        .run()
      return
    }

    if (value === 'heading-2') {
      currentEditor
        .chain()
        .focus()
        .setHeading({ level: 2 })
        .run()
      return
    }

    if (value === 'heading-3') {
      currentEditor
        .chain()
        .focus()
        .setHeading({ level: 3 })
        .run()
    }
  }

  function setLink() {
    const previousUrl = currentEditor.getAttributes('link')
      .href as string | undefined

    const url = window.prompt(
      'Masukkan URL link:',
      previousUrl ?? '',
    )

    if (url === null) {
      return
    }

    if (!url.trim()) {
      currentEditor
        .chain()
        .focus()
        .extendMarkRange('link')
        .unsetLink()
        .run()

      return
    }

    currentEditor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({
        href: url.trim(),
      })
      .run()
  }

  const blockFormat = currentEditor.isActive('heading', {
    level: 1,
  })
    ? 'heading-1'
    : currentEditor.isActive('heading', {
          level: 2,
        })
      ? 'heading-2'
      : currentEditor.isActive('heading', {
            level: 3,
          })
        ? 'heading-3'
        : 'paragraph'

  return (
    <div className="w-full max-w-full overflow-hidden rounded-2xl border border-border bg-background">
      <div className="flex w-full flex-wrap items-center gap-1.5 border-b border-border p-2 sm:gap-1">
        <ToolbarButton
          label="Undo"
          onClick={() => {
            currentEditor.chain().focus().undo().run()
          }}
        >
          <Undo2 size={17} />
        </ToolbarButton>

        <ToolbarButton
          label="Redo"
          onClick={() => {
            currentEditor.chain().focus().redo().run()
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
              changeBlockFormat(event.target.value)
            }}
            className="h-9 w-full min-w-0 appearance-none rounded-lg border border-border bg-surface py-0 pl-3 pr-8 text-sm font-medium text-text-primary outline-none transition-colors hover:bg-primary-soft focus:ring-2 focus:ring-primary/40 sm:h-10 sm:w-36 sm:rounded-xl"
          >
            <option value="paragraph">Paragraph</option>
            <option value="heading-1">Heading 1</option>
            <option value="heading-2">Heading 2</option>
            <option value="heading-3">Heading 3</option>
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
            currentEditor.chain().focus().toggleBold().run()
          }}
        >
          <Bold size={17} />
        </ToolbarButton>

        <ToolbarButton
          label="Italic"
          isActive={currentEditor.isActive('italic')}
          onClick={() => {
            currentEditor.chain().focus().toggleItalic().run()
          }}
        >
          <Italic size={17} />
        </ToolbarButton>

        <ToolbarButton
          label="Link"
          isActive={currentEditor.isActive('link')}
          onClick={setLink}
        >
          <LinkIcon size={17} />
        </ToolbarButton>

        <ToolbarButton
          label="Bullet list"
          isActive={currentEditor.isActive('bulletList')}
          onClick={() => {
            currentEditor.chain().focus().toggleBulletList().run()
          }}
        >
          <List size={17} />
        </ToolbarButton>

        <ToolbarButton
          label="Ordered list"
          isActive={currentEditor.isActive('orderedList')}
          onClick={() => {
            currentEditor.chain().focus().toggleOrderedList().run()
          }}
        >
          <ListOrdered size={17} />
        </ToolbarButton>

        <ToolbarButton
          label="Quote"
          isActive={currentEditor.isActive('blockquote')}
          onClick={() => {
            currentEditor.chain().focus().toggleBlockquote().run()
          }}
        >
          <Quote size={17} />
        </ToolbarButton>
      </div>

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
        }
      `}</style>

      <EditorContent editor={currentEditor} />
    </div>
  )
}