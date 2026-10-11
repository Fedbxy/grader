"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Progress as ProgressPrimitive } from "radix-ui"

import { cn } from "@/lib/shadcn"

const progressVariants = cva("h-full w-full flex-1 transition-all", {
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
        "relative h-2 w-full overflow-hidden rounded-full bg-primary/20",
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
