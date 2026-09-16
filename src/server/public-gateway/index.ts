import "server-only";
import { z } from "zod";
import { publicGatewayPolicy } from "./policy";

export const publicGatewayRequestSchema = z.object({
	limit: z.number().int().min(1).max(48).default(24),
	depth: z.literal(0).default(0),
});

export type PublicGatewayRequest = z.input<typeof publicGatewayRequestSchema>;
export type PublicGatewayQuery = z.output<typeof publicGatewayRequestSchema>;

export function parsePublicGatewayQuery(input: PublicGatewayRequest): PublicGatewayQuery {
	return publicGatewayRequestSchema.parse(input);
}

export {
	catalogQuerySchema,
	findPublicCatalogProperties,
	findPublicPropertyBySlug,
	publicPropertyPublicationWhere,
} from "./catalog";
export type { CatalogQuery, CatalogQueryInput, PublicCatalogResult } from "./catalog";
export {
	getPublicCatalog,
	getPublicHomePage,
	getPublicMarketingPage,
	getPublicProperty,
	getPublicShell,
} from "./provider";
export { publicGatewayPolicy } from "./policy";
