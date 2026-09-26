export type CloneBootstrap = {
	preparedAt: string;
	region: {
		slug: string;
		name: string;
		genitive: string;
		locative: string;
		shortName: string;
	};
	geos: Array<{
		slug: string;
		title: string;
		agglomerationOf?: string;
		morphology: {
			nominative: string;
			genitive: string;
			prepositional: string;
			preposition: "в" | "во" | "на";
		};
		districts: Array<{
			slug: string;
			name: string;
			type: "admin_district" | "microdistrict";
			locative: string;
			preposition: "в" | "во" | "на";
			synonyms: string[];
			parent: string | null;
		}>;
	}>;
};

export function validateCloneBootstrap(root: string): CloneBootstrap;
