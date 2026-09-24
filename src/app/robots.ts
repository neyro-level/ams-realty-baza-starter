import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/project/seo/site";
import {
	buildRobots,
	getProjectIndexingPolicy,
} from "@/project/indexing-policy";

export default function robots(): MetadataRoute.Robots {
	return buildRobots(getProjectIndexingPolicy(), getSiteUrl());
}
