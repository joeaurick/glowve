import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'

import { cn } from '@/lib/utils'

type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'dark'
  | 'affiliate'

type ButtonSize = 'sm' | 'default' | 'lg'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  asChild?: boolean
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    'bg-primary',
    'text-text-primary',
    'hover:bg-primary-hover',
    'hover:shadow-soft',
  ].join(' '),

  secondary: [
    'bg-secondary',
    'text-text-primary',
    'hover:bg-secondary-hover',
  ].join(' '),

  outline: [
    'border',
    'border-border-strong',
    'bg-transparent',
    'text-text-primary',
    'hover:bg-surface-muted',
  ].join(' '),

  ghost: [
    'bg-transparent',
    'text-text-primary',
    'hover:bg-surface-muted',
  ].join(' '),

  dark: [
    'bg-surface-dark',
    'text-text-inverse',
    'hover:bg-surface-dark-soft',
  ].join(' '),

  affiliate: [
    'bg-primary',
    'text-text-primary',
    'hover:bg-primary-hover',
    'hover:shadow-soft',
  ].join(' '),
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3.5 text-sm',
  default: 'h-11 px-5 text-sm',
  lg: 'h-13 px-6 text-base',
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'default',
      fullWidth = false,
      asChild = false,
      type,
      ...props
    },
    ref,
  ) => {
    const Component = asChild ? Slot : 'button'

    return (
      <Component
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-full',
          'font-semibold',
          'transition-all duration-200',
          'outline-none',
          'focus-visible:ring-2',
          'focus-visible:ring-primary',
          'focus-visible:ring-offset-2',
          'disabled:pointer-events-none',
          'disabled:opacity-50',
          'active:scale-[0.98]',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className,
        )}
        {...(!asChild ? { type: type ?? 'button' } : {})}
        {...props}
      />
    )
  },
)

Button.displayName = 'Button'

export { Button }