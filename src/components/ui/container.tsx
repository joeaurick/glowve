import * as React from 'react'

import { cn } from '@/lib/utils'

type ContainerSize = 'default' | 'wide' | 'narrow' | 'full'

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  size?: ContainerSize
}

const containerSizes: Record<ContainerSize, string> = {
  default: 'max-w-7xl',
  wide: 'max-w-[90rem]',
  narrow: 'max-w-3xl',
  full: 'max-w-none',
}

const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ className, size = 'default', ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'mx-auto w-full px-4 sm:px-6 lg:px-8',
          containerSizes[size],
          className,
        )}
        {...props}
      />
    )
  },
)

Container.displayName = 'Container'

export { Container }