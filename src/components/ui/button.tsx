import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";

/** Native button shared by error fallbacks. */
export function Button({ className, type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cn("primary", className)} {...props} />;
}
