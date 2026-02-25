"use client"

import * as React from "react"
import { VariantProps, cva } from "class-variance-authority"

import { cn } from "@/lib/utils"

const headerVariants = cva(
  "sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6",
  {
    variants: {},
    defaultVariants: {},
  }
)

const Header = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement> & VariantProps<typeof headerVariants>
>(({ className, ...props }, ref) => {
  return (
    <header
      ref={ref}
      className={cn(headerVariants({ className }))}
      {...props}
    />
  )
})
Header.displayName = "Header"

export { Header }
