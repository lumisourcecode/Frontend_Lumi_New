export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export type MptpPricingInput = {
  baseFare: number;
  cardEligible: boolean;
  subsidyCap?: number; // default $60 (VIC)
};

export type MptpPricingResult = {
  subsidy: number;
  riderPayable: number;
};

// Victorian MPTP: 50% subsidy up to $60 cap.
export function applyMptpFareRules(input: MptpPricingInput): MptpPricingResult {
  const subsidyCap = input.subsidyCap ?? 60;
  const baseFare = Math.max(0, input.baseFare);

  if (!input.cardEligible) return { subsidy: 0, riderPayable: baseFare };

  const subsidy = clamp(baseFare * 0.5, 0, subsidyCap);
  const riderPayable = Math.max(0, baseFare - subsidy);
  return { subsidy: Math.round(subsidy * 100) / 100, riderPayable: Math.round(riderPayable * 100) / 100 };
}

