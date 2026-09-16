import type { SiteFooterDTO, SiteHeaderDTO } from "@ams/realtbase-contracts";
import { Button, Container } from "@ams/realtbase-ui";
import Link from "next/link";
import type { ReactNode } from "react";

export function SiteShell({
	header,
	footer,
	children,
}: {
	header: SiteHeaderDTO;
	footer: SiteFooterDTO;
	children: ReactNode;
}) {
	return (
		<div className="min-h-screen bg-surface-page text-content-strong">
			<header className="sticky top-0 z-40 border-b border-border bg-[var(--surface-card)]/95 backdrop-blur-xl">
				<Container className="flex min-h-17 items-center gap-5 py-3">
					<Link
						href={header.homeHref}
						className="shrink-0 text-body font-extrabold tracking-caps"
						aria-label={`${header.brandName} — на главную`}
					>
						<span
							className="mr-2 inline-block size-3 rounded-[var(--site-radius-micro)] bg-action-primary"
							aria-hidden
						/>
						{header.brandName}
					</Link>
					<nav
						className="ml-auto hidden items-center gap-1 lg:flex"
						aria-label="Основная навигация"
					>
						{header.navigation.map((item) => (
							<Link
								key={item.href}
								href={item.href}
								className="rounded-md px-3 py-2 text-label font-semibold text-content-default transition-colors hover:bg-surface-subtle hover:text-action-primary"
							>
								{item.label}
							</Link>
						))}
					</nav>
					{header.phone ? (
						<a
							href={header.phone.href}
							className="hidden text-label font-semibold md:inline"
						>
							{header.phone.label}
						</a>
					) : null}
					{header.primaryAction ? (
						<Button asChild size="sm" className="hidden sm:inline-flex">
							<Link href={header.primaryAction.href}>
								{header.primaryAction.label}
							</Link>
						</Button>
					) : null}
				</Container>
				<Container
					className="flex gap-2 overflow-x-auto pb-3 lg:hidden"
					aria-label="Мобильная навигация"
				>
					{header.navigation.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							className="whitespace-nowrap rounded-md bg-surface-subtle px-3 py-2 text-label font-semibold"
						>
							{item.label}
						</Link>
					))}
				</Container>
			</header>
			{children}
			<footer className="border-t border-[var(--dark-border)] bg-surface-inverse py-12 text-content-inverse">
				<Container>
					<div className="grid gap-10 md:grid-cols-[1.2fr_2fr]">
						<div>
							<p className="text-body font-extrabold tracking-caps">
								{footer.brandName}
							</p>
							<p className="mt-3 max-w-sm text-label leading-step-copy text-[var(--text-dark-muted)]">
								Fixture-сайт работает на presentation contracts. Контакты и
								юридические тексты демонстрационные.
							</p>
						</div>
						<div className="grid gap-8 sm:grid-cols-3">
							{footer.groups.map((group) => (
								<nav key={group.title} aria-label={group.title}>
									<p className="mb-3 text-label font-bold">{group.title}</p>
									<div className="grid gap-2 text-label text-[var(--text-dark-muted)]">
										{group.links.map((link) => (
											<Link
												key={link.href}
												href={link.href}
												className="hover:text-content-inverse"
											>
												{link.label}
											</Link>
										))}
									</div>
								</nav>
							))}
						</div>
					</div>
					<div className="mt-10 flex flex-col gap-3 border-t border-[var(--dark-border)] pt-6 text-caption text-[var(--text-dark-muted)] md:flex-row md:items-center md:justify-between">
						<p>{footer.copyright}</p>
						<nav
							className="flex flex-wrap gap-4"
							aria-label="Правовая информация"
						>
							{footer.legalLinks.map((link) => (
								<Link
									key={link.href}
									href={link.href}
									className="hover:text-content-inverse"
								>
									{link.label}
								</Link>
							))}
						</nav>
					</div>
				</Container>
			</footer>
		</div>
	);
}
