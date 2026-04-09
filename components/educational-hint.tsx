import type { ReactNode } from 'react'

export function EducationalHint({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border/70 bg-muted/25 px-3 py-2.5 text-sm leading-relaxed text-muted-foreground sm:px-4">
      {children}
    </div>
  )
}
