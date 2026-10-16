"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/shadcn"
import { Progress as ProgressPrimitive } from "radix-ui"

const progressVariants = cva("size-full flex-1 transition-all", {
  variants: {
    variant: {
      default: "bg-primary",
      constructive: "bg-constructive",
      destructive: "bg-destructive",
      warning: "bg-warning",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function Progress({
  className,
  value,
  variant,
  ...props
}: React.ComponentProps<typeof ProgressPrimitive.Root> &
  VariantProps<typeof progressVariants>) {
  return (
    <ProgressPrimitive.Root
      data-slot="progress"
      className={cn(
        "relative flex h-1 w-full items-center overflow-x-hidden rounded-full bg-muted",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={progressVariants({ variant })}
        style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
      />
    </ProgressPrimitive.Root>
  )
}

export { Progress }
