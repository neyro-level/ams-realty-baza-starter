/**
 * Platform defaults for request parameters that are attribution-only.
 *
 * Client projects may append a parameter only after proving that it cannot
 * change page content. Removing a default requires an explicit project
 * decision and regression coverage.
 */
export const trackingQueryParams = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
  "utm_referrer",
  "utm_media",
  "utm_group",
  "utm_expid",
  "yclid",
  "ysclid",
  "yrclid",
  "gclid",
  "_openstat",
] as const;

export type TrackingQueryParam = (typeof trackingQueryParams)[number];

const trackingQueryParamSet = new Set<string>(trackingQueryParams);

export function isTrackingQueryParam(parameter: string): parameter is TrackingQueryParam {
  return trackingQueryParamSet.has(parameter);
}

export function cleanParamDirective(): string {
  return `Clean-param: ${trackingQueryParams.join("&")}`;
}
