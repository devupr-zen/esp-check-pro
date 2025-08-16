import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-lg hover:shadow-xl",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-lg shadow-lg",
        outline: "border border-border bg-transparent hover:bg-secondary hover:text-secondary-foreground rounded-lg",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg shadow-sm",
        ghost: "hover:bg-secondary hover:text-secondary-foreground rounded-lg",
        link: "text-primary underline-offset-4 hover:underline",
        // Premium Upraizen variants
        glass: "glass-card hover:shadow-xl hover:scale-[1.02] text-foreground",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 rounded-lg shadow-lg hover:shadow-xl",
        premium: "bg-gradient-to-r from-primary to-accent text-white hover:shadow-2xl hover:scale-[1.02] rounded-lg",
        hero: "bg-primary text-primary-foreground hover:bg-primary/90 rounded-lg shadow-xl hover:shadow-2xl hover:scale-[1.02] font-semibold",
        info: "bg-info text-info-foreground hover:bg-info/90 rounded-lg shadow-lg",
        warning: "bg-warning text-warning-foreground hover:bg-warning/90 rounded-lg shadow-lg",
        success: "bg-success text-success-foreground hover:bg-success/90 rounded-lg shadow-lg",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-lg px-3",
        lg: "h-12 rounded-lg px-8",
        xl: "h-14 rounded-lg px-10 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
