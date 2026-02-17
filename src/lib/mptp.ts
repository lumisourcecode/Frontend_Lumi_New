export type MptpFareInput = {
  baseFare: number;
  cardEligible: boolean;
};

export type MptpFareOutput = {
  subsidy: number;
  riderPayable: number;
  applied: boolean;
};

export function applyMptpFareRules(input: MptpFareInput): MptpFareOutput {
  if (!input.cardEligible) {
    return {
      subsidy: 0,
      riderPayable: Number(input.baseFare.toFixed(2)),
      applied: false,
    };
  }

  const subsidy = Math.min(input.baseFare * 0.5, 60);
  const riderPayable = Math.max(input.baseFare - subsidy, 0);

  return {
    subsidy: Number(subsidy.toFixed(2)),
    riderPayable: Number(riderPayable.toFixed(2)),
    applied: true,
  };
}
