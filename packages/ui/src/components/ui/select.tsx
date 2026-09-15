import * as React from "react";
import { cn } from "../../lib/utils";

export const Select = React.forwardRef<
	HTMLSelectElement,
	React.ComponentProps<"select"> & { variant?: "native" | "styled" }
>(function Select({ className, variant = "styled", ...props }, ref) {
	return (
		<select
			ref={ref}
			data-slot="select"
			className={
				variant === "native"
					? className
					: cn(
							"h-11 w-full rounded-[var(--radius)] border border-[var(--input)] bg-[var(--background)] px-3 text-body text-[var(--foreground)] outline-none transition-colors focus-visible:border-[var(--ring)] focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--ring)_24%,transparent)] disabled:cursor-not-allowed disabled:opacity-50",
							className,
						)
			}
			{...props}
		/>
	);
});
