export type PropertyDerivedInput = {
	priceMinor?: number | null;
	totalArea?: number | null;
};

export type PropertyDerivedFields = {
	pricePerMeterMinor?: number;
};

const maxSafeMinor = Number.MAX_SAFE_INTEGER;

export function calculatePropertyDerivedFields({
	priceMinor,
	totalArea,
}: PropertyDerivedInput): PropertyDerivedFields {
	if (
		priceMinor == null ||
		totalArea == null ||
		!Number.isFinite(priceMinor) ||
		!Number.isFinite(totalArea) ||
		priceMinor < 0 ||
		totalArea <= 0
	) {
		return {};
	}

	const perMeter = Math.round(priceMinor / totalArea);
	if (!Number.isSafeInteger(perMeter) || perMeter < 0 || perMeter > maxSafeMinor) {
		return {};
	}

	return { pricePerMeterMinor: perMeter };
}
