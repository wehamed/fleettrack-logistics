import { forwardRef, type HTMLAttributes } from "react"
import { cn } from "@/lib/utils"

const Separator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("h-px bg-secondary-200 dark:bg-secondary-700", className)} {...props} />
  )
)
Separator.displayName = "Separator"

export { Separator }
