import * as React from "react"
import { cn } from "@/lib/utils"

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  hoverable?: boolean
  padding?: "none" | "sm" | "md" | "lg"
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, children, hoverable = false, padding = "md", ...props }, ref) => {
    const paddingClasses = {
      none: "",
      sm: "p-3",
      md: "p-6",
      lg: "p-8"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "glass-card",
          paddingClasses[padding],
          hoverable && "hover-lift hover-glow cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

GlassCard.displayName = "GlassCard"

export { GlassCard }