import { Button, Container, Section } from "@ams/realtbase-ui";
import Link from "next/link";

export default function NotFound() {
	return (
		<main>
			<Section space="hero">
				<Container size="narrow" className="text-center">
					<p className="text-label font-bold uppercase tracking-wide-role text-action-primary">
						Ошибка 404
					</p>
					<h1 className="mt-4 text-display font-extrabold tracking-display">
						Страница не найдена
					</h1>
					<p className="mx-auto mt-4 max-w-xl text-body-large text-content-default">
						Адрес мог измениться. Вернитесь на главную или откройте каталог
						недвижимости.
					</p>
					<div className="mt-7 flex justify-center gap-3">
						<Button asChild>
							<Link href="/">На главную</Link>
						</Button>
						<Button asChild variant="outline">
							<Link href="/nedvizhimost">В каталог</Link>
						</Button>
					</div>
				</Container>
			</Section>
		</main>
	);
}
