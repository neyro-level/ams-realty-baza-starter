"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { CheckIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "../../lib/utils";

export function Checkbox({
	className,
	...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			className={cn(
				"peer size-4 shrink-0 rounded-[3px] border border-[var(--input)] bg-[var(--background)] shadow-xs outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[var(--primary)] data-[state=checked]:bg-[var(--primary)] data-[state=checked]:text-[var(--primary-foreground)]",
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				data-slot="checkbox-indicator"
				className="grid place-content-center text-current"
			>
				<CheckIcon className="size-3.5" />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}
