import * as React from 'react'

import { cn } from '@/lib/utils'

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          [
            'flex h-11 w-full rounded-md border border-border',
            'bg-surface px-4 py-2',
            'text-sm text-text-primary',
            'placeholder:text-text-muted',
            'transition-colors duration-200',
            'outline-none',
            'focus:border-primary focus:ring-2 focus:ring-primary/15',
            'disabled:cursor-not-allowed disabled:opacity-50',
          ].join(' '),
          className,
        )}
        {...props}
      />
    )
  },
)

Input.displayName = 'Input'

export { Input }