import type { ReactNode } from 'react'

type TextMark = {
  type: string
  attrs?: {
    href?: string
    target?: string
    rel?: string
  }
}

export type ArticleNode = {
  type?: string
  text?: string
  attrs?: {
    level?: number
    href?: string
    target?: string
    rel?: string
  }
  marks?: TextMark[]
  content?: ArticleNode[]
}

type ArticleContentProps = {
  content: ArticleNode
}

function renderTextNode(
  node: ArticleNode,
  key: string,
): ReactNode {
  let element: ReactNode = node.text ?? ''

  node.marks?.forEach((mark) => {
    if (mark.type === 'bold') {
      element = (
        <strong key={`${key}-bold`}>
          {element}
        </strong>
      )
    }

    if (mark.type === 'italic') {
      element = (
        <em key={`${key}-italic`}>
          {element}
        </em>
      )
    }

    if (mark.type === 'strike') {
      element = (
        <s key={`${key}-strike`}>
          {element}
        </s>
      )
    }

    if (mark.type === 'code') {
      element = (
        <code
          key={`${key}-code`}
          className="rounded-md bg-primary-soft px-1.5 py-0.5 text-[0.9em]"
        >
          {element}
        </code>
      )
    }

    if (mark.type === 'link') {
      const href = mark.attrs?.href ?? '#'

      element = (
        <a
          key={`${key}-link`}
          href={href}
          target={mark.attrs?.target ?? '_blank'}
          rel={
            mark.attrs?.rel ??
            'noopener noreferrer nofollow'
          }
          className="font-medium text-secondary underline decoration-secondary/40 underline-offset-4 transition-colors hover:text-text-primary"
        >
          {element}
        </a>
      )
    }
  })

  return element
}

function renderChildren(
  nodes: ArticleNode[] | undefined,
  parentKey: string,
): ReactNode[] {
  if (!nodes) {
    return []
  }

  return nodes.map((node, index) =>
    renderNode(node, `${parentKey}-${index}`),
  )
}

function renderNode(
  node: ArticleNode,
  key: string,
): ReactNode {
  if (node.type === 'text') {
    return renderTextNode(node, key)
  }

  const children = renderChildren(
    node.content,
    key,
  )

  if (node.type === 'paragraph') {
    return (
      <p
        key={key}
        className="mb-6 text-base leading-8 text-text-secondary sm:text-lg"
      >
        {children}
      </p>
    )
  }

  if (node.type === 'heading') {
    const level = node.attrs?.level ?? 2

    if (level === 1) {
      return (
        <h1
          key={key}
          className="mt-10 mb-5 text-3xl font-semibold tracking-tight text-text-primary sm:text-4xl"
        >
          {children}
        </h1>
      )
    }

    if (level === 2) {
      return (
        <h2
          key={key}
          className="mt-10 mb-4 text-2xl font-semibold tracking-tight text-text-primary sm:text-3xl"
        >
          {children}
        </h2>
      )
    }

    return (
      <h3
        key={key}
        className="mt-8 mb-3 text-xl font-semibold text-text-primary sm:text-2xl"
      >
        {children}
      </h3>
    )
  }

  if (node.type === 'bulletList') {
    return (
      <ul
        key={key}
        className="mb-7 list-disc space-y-2 pl-6 text-base leading-8 text-text-secondary sm:text-lg"
      >
        {children}
      </ul>
    )
  }

  if (node.type === 'orderedList') {
    return (
      <ol
        key={key}
        className="mb-7 list-decimal space-y-2 pl-6 text-base leading-8 text-text-secondary sm:text-lg"
      >
        {children}
      </ol>
    )
  }

  if (node.type === 'listItem') {
    return <li key={key}>{children}</li>
  }

  if (node.type === 'blockquote') {
    return (
      <blockquote
        key={key}
        className="my-8 rounded-r-2xl border-l-4 border-primary bg-primary-soft px-5 py-4 text-lg leading-8 text-text-primary"
      >
        {children}
      </blockquote>
    )
  }

  if (node.type === 'hardBreak') {
    return <br key={key} />
  }

  return (
    <div key={key}>
      {children}
    </div>
  )
}

export function ArticleContent({
  content,
}: ArticleContentProps) {
  if (!content.content) {
    return null
  }

  return (
    <article className="w-full max-w-full">
      {renderChildren(content.content, 'article')}
    </article>
  )
}