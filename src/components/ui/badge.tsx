import { type HTMLAttributes } from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300",
        secondary: "bg-secondary-100 text-secondary-700 dark:bg-secondary-700 dark:text-secondary-300",
        accent: "bg-accent-100 text-accent-700 dark:bg-accent-900/30 dark:text-accent-300",
        danger: "bg-danger-100 text-danger-700 dark:bg-danger-900/30 dark:text-danger-300",
        warning: "bg-warning-100 text-warning-700 dark:bg-warning-900/30 dark:text-warning-300",
        outline: "border border-secondary-200 text-secondary-600 dark:border-secondary-700 dark:text-secondary-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

interface BadgeProps extends HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
