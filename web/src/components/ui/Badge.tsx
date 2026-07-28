import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-primary-light focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "bg-primary text-text-on-primary",
        secondary: "bg-surface text-text-primary border border-border",
        accent: "bg-accent-subtle text-text-on-accent",
        success: "bg-green-50 text-success border border-green-200",
        warning: "bg-amber-50 text-warning border border-amber-200",
        danger: "bg-red-50 text-danger border border-red-200",
        outline: "text-text-primary border border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
