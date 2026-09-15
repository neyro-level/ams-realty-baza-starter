import { baseContractFixture } from "@ams/realtbase-contracts/fixtures";
import { LeadConsentField } from "@ams/realtbase-ui";

export default function HomePage() {
	return (
		<main className="min-h-screen bg-slate-100 px-5 py-12 text-slate-950">
			<section className="mx-auto grid max-w-2xl gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
				<div className="grid gap-2">
					<p className="text-sm font-semibold uppercase tracking-wider text-slate-500">
						Contracts fixture
					</p>
					<h1 className="text-3xl font-semibold">AMS Realty Baza Starter</h1>
					<p className="text-base leading-7 text-slate-600">
						Проверка presentation-контракта согласия до подключения Payload и
						реальной отправки заявок.
					</p>
				</div>

				<LeadConsentField context={baseContractFixture.lead} />
			</section>
		</main>
	);
}
