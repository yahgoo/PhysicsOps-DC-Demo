import { CP_WATER, KELVIN_OFFSET } from './assumptions';

/**
 * Simplified steady-state water-cooled chiller model.
 *
 * Condenser: refrigerant condenses at a uniform saturation temperature, so
 *   ε = 1 − exp(−UA / (ṁ·c_p)),  Q_rej = ε·ṁ·c_p·(T_sat − T_in).
 * Heat rejection: Q_rej ≈ Q_cooling + P_compressor.
 * Compressor: COP = η · T_evap[K] / (T_sat − T_evap), with η a lumped
 * efficiency relative to the Carnot cycle.
 */
export interface ChillerOperatingPoint {
  coolingLoadKw: number;
  cwInletC: number;
  cwFlowKgS: number;
  evapSatC: number;
  uaKwPerK: number;
  carnotEfficiency: number;
}

export interface ChillerState {
  compressorPowerKw: number;
  heatRejectionKw: number;
  condSatC: number;
  cwOutletC: number;
  approachK: number;
  liftK: number;
  cop: number;
}

export function condenserEffectiveness(uaKwPerK: number, flowKgS: number): number {
  return 1 - Math.exp(-uaKwPerK / (flowKgS * CP_WATER));
}

export function uaFromEffectiveness(effectiveness: number, flowKgS: number): number {
  return -flowKgS * CP_WATER * Math.log(1 - effectiveness);
}

export function solveChiller(op: ChillerOperatingPoint): ChillerState {
  const mcp = op.cwFlowKgS * CP_WATER;
  const eps = condenserEffectiveness(op.uaKwPerK, op.cwFlowKgS);
  const evapK = op.evapSatC + KELVIN_OFFSET;
  let power = op.coolingLoadKw / 5;
  let condSatC: number;
  let cop: number;
  for (let i = 0; i < 100; i += 1) {
    const heatRejection = op.coolingLoadKw + power;
    condSatC = op.cwInletC + heatRejection / (eps * mcp);
    const lift = condSatC - op.evapSatC;
    cop = (op.carnotEfficiency * evapK) / lift;
    const next = op.coolingLoadKw / cop;
    if (Math.abs(next - power) < 1e-10) {
      power = next;
      break;
    }
    power = next;
  }
  const heatRejectionKw = op.coolingLoadKw + power;
  condSatC = op.cwInletC + heatRejectionKw / (eps * mcp);
  const cwOutletC = op.cwInletC + heatRejectionKw / mcp;
  const liftK = condSatC - op.evapSatC;
  return {
    compressorPowerKw: power,
    heatRejectionKw,
    condSatC,
    cwOutletC,
    approachK: condSatC - cwOutletC,
    liftK,
    cop: op.coolingLoadKw / power,
  };
}
