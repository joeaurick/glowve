import * as React from 'react'

import { cn } from '@/lib/utils'

type SectionSpacing = 'none' | 'sm' | 'md' | 'lg' | 'xl'

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement> {
  spacing?: SectionSpacing
}

const sectionSpacing: Record<SectionSpacing, string> = {
  none: '',
  sm: 'py-8 sm:py-10',
  md: 'py-12 sm:py-16',
  lg: 'py-16 sm:py-20 lg:py-24',
  xl: 'py-20 sm:py-28 lg:py-32',
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ className, spacing = 'lg', ...props }, ref) => {
    return (
      <section
        ref={ref}
        className={cn(sectionSpacing[spacing], className)}
        {...props}
      />
    )
  },
)

Section.displayName = 'Section'

export { Section }