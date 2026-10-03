import { ASSUMED_EVAPORATOR_APPROACH_K } from './assumptions';
import { fixed, signed } from './format';
import { hypothesisName } from './hypothesisEngine';
import type { AnalysisResult, EngineeringFinding, HypothesisId, InvestigationResult } from './types';

const NEXT_CHECKS: Record<HypothesisId, string[]> = {
  condenserFouling: [
    'Inspect condenser-side heat-transfer condition (tube fouling or scaling) at the next suitable opportunity.',
    'Verify condensing pressure against a calibrated gauge to confirm the saturation-temperature reading.',
    'Verify condenser-water flow independently (clamp-on meter or pump curve) to rule out maldistribution or meter error.',
    'Review condenser-water treatment and blow-down records.',
  ],
  flowReduction: [
    'Check condenser-water strainers, isolation and control valves for restriction.',
    'Compare pump differential pressure and speed against the pump curve.',
    'Check cooling-tower basin level and make-up.',
    'Verify the flow reading with an independent measurement.',
  ],
  instrumentation: [
    'Compare the suspect sensor against a calibrated reference measurement.',
    'Review calibration and maintenance records for the affected sensors.',
    'Cross-check against redundant or BMS-side readings where available.',
    'Keep the asset under observation until the measurement is confirmed.',
  ],
};

const BASE_LIMITATIONS = [
  'Synthetic telemetry: this is a demonstration, not a diagnosis of real equipment.',
  'Condensing saturation temperature is a synthetic channel; real systems may derive it from pressure.',
  `Evaporator temperature is estimated (chilled-water supply − ${ASSUMED_EVAPORATOR_APPROACH_K} K).`,
  'Heat balance is a simplified steady-state approximation.',
];

export function buildFinding(analysis: AnalysisResult, investigation: InvestigationResult): EngineeringFinding {
  const limitations = [
    ...BASE_LIMITATIONS,
    `Baseline covers only the first ${analysis.config.baselineHours} h of data.`,
    ...analysis.dataQuality.limitations,
  ];
  const additionalMeasurement =
    'Compare condenser performance against a longer history at equivalent load and ambient / inlet conditions.';

  if (investigation.outcome === 'insufficientEvidence') {
    return {
      headline: 'Insufficient evidence',
      observed: 'The available data does not support a comparison against the baseline.',
      leadingHypothesis: 'None — insufficient evidence',
      supportingEvidence: [],
      alternatives: [],
      limitations,
      strengthLabel: 'Not assessed',
      nextChecks: ['Restore missing or invalid measurements, then repeat the investigation.'],
      additionalMeasurement,
    };
  }

  if (investigation.outcome === 'noAbnormality') {
    return {
      headline: 'No supported abnormality',
      observed: 'Recent operation matches the comparable-condition baseline within thresholds.',
      leadingHypothesis: 'None',
      supportingEvidence: [],
      alternatives: [],
      limitations,
      strengthLabel: 'Not applicable',
      nextChecks: ['Continue routine monitoring.'],
      additionalMeasurement,
    };
  }

  const parts: string[] = [];
  if (analysis.approach) {
    parts.push(
      `condenser approach averaged ${fixed(analysis.approach.observed, 2)} K vs ${fixed(analysis.approach.expected, 2)} K expected (${signed(analysis.approach.residual, 2)} K)`,
    );
  }
  if (analysis.power) parts.push(`baseline-adjusted compressor power is ${signed(analysis.power.residualPct)}%`);
  if (analysis.cop) parts.push(`COP is ${signed(analysis.cop.residualPct)}%`);
  if (analysis.flow) parts.push(`measured condenser-water flow changed ${signed(analysis.flow.changePct)}%`);
  const observed = `Over the last ${analysis.config.recentHours} h, at comparable load and inlet temperature, ${parts.join('; ')}.`;

  const leading = investigation.leading;
  const leadingEval = investigation.hypotheses.find((h) => h.id === leading);
  const supportingEvidence = leadingEval
    ? leadingEval.evidence.filter((e) => e.assessment === 'supports').map((e) => (e.value ? `${e.title} (${e.value})` : e.title))
    : [];
  const alternatives = investigation.hypotheses
    .filter((h) => h.id !== leading)
    .map((h) => {
      const against = h.evidence.find((e) => e.assessment === 'weakens');
      return `${h.name} — ${h.statusLabel.toLowerCase()}${against ? `: ${against.title.toLowerCase()}` : ''}.`;
    });

  return {
    headline: leading ? 'Abnormal cooling-performance pattern' : 'Abnormal pattern — cause not discriminated',
    observed,
    leadingHypothesis: leading ? hypothesisName(leading) : 'Not determined — evidence does not discriminate',
    supportingEvidence,
    alternatives,
    limitations,
    strengthLabel: investigation.strength ? `${investigation.strength} — requires verification` : 'Low — requires verification',
    nextChecks: leading ? NEXT_CHECKS[leading] : [...NEXT_CHECKS.instrumentation.slice(0, 1), ...NEXT_CHECKS.flowReduction.slice(3)],
    additionalMeasurement,
  };
}
