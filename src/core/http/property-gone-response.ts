const goneCacheHeaders = {
	"Content-Type": "text/html; charset=utf-8",
	"X-Robots-Tag": "noindex, follow",
	"Cache-Control": "public, max-age=300, must-revalidate",
} as const;

export function renderEntityGoneHtml(slug: string): string {
	const safeSlug = slug.replaceAll(/[^a-z0-9_-]/gi, "");
	return `<!doctype html>
<html lang="ru">
<head>
<meta charset="utf-8">
<title>Объект снят с публикации</title>
<meta name="robots" content="noindex, follow">
</head>
<body>
<main>
<p>410</p>
<h1>Объект снят с публикации</h1>
<p>Страница объекта ${safeSlug} больше не содержит публичные данные после окончания retention-периода. Автоматический редирект на главную не выполняется.</p>
<p><a href="/kvartiry/">Смотреть актуальные объекты</a></p>
</main>
</body>
</html>`;
}

export function createEntityGoneResponse(slug: string): Response {
	return new Response(renderEntityGoneHtml(slug), {
		status: 410,
		headers: goneCacheHeaders,
	});
}
