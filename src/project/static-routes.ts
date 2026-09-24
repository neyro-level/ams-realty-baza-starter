export type ProjectStaticRoute = {
	path: `/${string}`;
	changeFrequency: "daily" | "weekly" | "monthly" | "yearly";
	priority: number;
	indexable: boolean;
};

export const projectStaticRoutes = [
	{ path: "/", changeFrequency: "daily", priority: 1, indexable: true },
	{ path: "/nedvizhimost", changeFrequency: "daily", priority: 0.9, indexable: true },
	{ path: "/uslugi", changeFrequency: "weekly", priority: 0.7, indexable: true },
	{ path: "/o-kompanii", changeFrequency: "monthly", priority: 0.6, indexable: true },
	{ path: "/ipoteka", changeFrequency: "weekly", priority: 0.7, indexable: true },
	{ path: "/prodat", changeFrequency: "weekly", priority: 0.7, indexable: true },
	{ path: "/sdat", changeFrequency: "weekly", priority: 0.7, indexable: true },
	{ path: "/kontakty", changeFrequency: "monthly", priority: 0.6, indexable: true },
	{ path: "/politika-konfidencialnosti", changeFrequency: "yearly", priority: 0.2, indexable: false },
	{ path: "/soglasie-na-obrabotku-personalnyh-dannyh", changeFrequency: "yearly", priority: 0.2, indexable: false },
] as const satisfies readonly ProjectStaticRoute[];
