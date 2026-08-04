import * as React from "react";
import { cn } from "@/lib/utils";

const palette = [
  "bg-[#00236F]/90",
  "bg-[#4059AA]",
  "bg-[#7C6B9E]",
  "bg-[#3F6C51]",
  "bg-[#9A5B40]",
  "bg-[#5B6C8A]",
] as const;

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
} as const;

export function Avatar({ name, size = "md", className, ...props }: AvatarProps) {
  const hash = name
    .split("")
    .reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
  const color = palette[hash % palette.length];
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length === 1
      ? parts[0].slice(0, 2).toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();

  return (
    <div
      aria-hidden="true"
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white ring-2 ring-white",
        sizes[size],
        color,
        className
      )}
      {...props}
    >
      {initials}
    </div>
  );
}
