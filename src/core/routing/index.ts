export {
	createUrlGrammar,
	isPlatformReservedRoot,
	platformReservedRoots,
	propertySurfaceSlugs,
	transliterateToSlug,
	type DevelopmentKind,
	type PageKey,
	type PropertySurfaceSlug,
	type UrlGrammar,
	type UrlGrammarInput,
} from "./url-grammar.ts";
export {
	createRouteResolver,
	type ResolverDataPort,
	type ResolverPageResult,
	type ResolverPageRecord,
	type ResolverRedirectRecord,
	type ResolverResult,
	type RouteResolver,
} from "./resolver.ts";
export { decidePage, type PageDecision } from "./page-decision.ts";
