import * as React from "react";
import { cn } from "../../lib/utils";

export const Input = React.forwardRef<
	HTMLInputElement,
	React.ComponentProps<"input"> & { variant?: "default" | "plain" }
>(function Input({ className, type, variant = "default", ...props }, ref) {
	return (
		<input
			ref={ref}
			type={type}
			data-slot="input"
			className={
				variant === "plain"
					? className
					: cn(
							"h-11 w-full min-w-0 rounded-[var(--radius)] border border-[var(--input)] bg-transparent px-3 text-body-large text-[var(--foreground)] outline-none transition-colors placeholder:text-[var(--muted-foreground)] focus-visible:border-[var(--ring)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--ring)_24%,transparent)] disabled:cursor-not-allowed disabled:opacity-50 md:text-body",
							className,
						)
			}
			{...props}
		/>
	);
});
