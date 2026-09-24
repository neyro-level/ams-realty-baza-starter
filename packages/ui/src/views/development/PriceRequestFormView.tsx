import type { LeadFormContext } from "@ams/realtbase-contracts";
import { LeadFormView } from "../starter/LeadFormView";

export function PriceRequestFormView({
	leadContext,
	developmentSlug,
	geo,
}: {
	leadContext: LeadFormContext;
	developmentSlug: string;
	geo?: string;
}) {
	return (
		<LeadFormView
			context={leadContext}
			intakeKind="development_price"
			entityContext={{ development: developmentSlug, geo }}
			title="Запросить актуальные цены"
			description="Уточним доступные варианты и дату последней проверки цены."
			submitLabel="Запросить цены"
		/>
	);
}
