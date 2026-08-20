import * as React from 'react'

import { cn } from '@/lib/utils'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          [
            'flex min-h-28 w-full rounded-md border border-border',
            'bg-surface px-4 py-3',
            'text-sm leading-6 text-text-primary',
            'placeholder:text-text-muted',
            'transition-colors duration-200',
            'outline-none',
            'focus:border-primary focus:ring-2 focus:ring-primary/15',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-y',
          ].join(' '),
          className,
        )}
        {...props}
      />
    )
  },
)

Textarea.displayName = 'Textarea'

export { Textarea }