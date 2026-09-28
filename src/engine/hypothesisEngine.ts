import { THRESHOLDS } from './assumptions';
import { fixed, signed } from './format';
import type {
  AnalysisResult,
  EvidenceAssessment,
  EvidenceItem,
  EvidenceStrength,
  HypothesisEvaluation,
  HypothesisId,
  HypothesisStatus,
  InvestigationResult,
} from './types';

type Draft = Omit<EvidenceItem, 'weight'> & { weight?: 1 | 2 };

function item(draft: Draft, weightIfCounted: 1 | 2 = 2): EvidenceItem {
  const counted = draft.assessment === 'supports' || draft.assessment === 'weakens';
  return { ...draft, weight: counted ? (draft.weight ?? weightIfCounted) : 0 };
}

function powerRatio(a: AnalysisResult): number | null {
  if (!a.power || a.impliedPowerChangePct === null) return null;
  if (Math.abs(a.impliedPowerChangePct) < THRESHOLDS.impliedPowerMinPct) return null;
  return a.power.residualPct / a.impliedPowerChangePct;
}

function flowState(a: AnalysisResult): 'reduced' | 'stable' | 'unclear' | 'unknown' {
  if (!a.flow) return 'unknown';
  if (a.flow.changePct <= -THRESHOLDS.flowReductionPct) return 'reduced';
  if (Math.abs(a.flow.changePct) <= THRESHOLDS.flowStablePct) return 'stable';
  return 'unclear';
}

function condenserEvidence(a: AnalysisResult): EvidenceItem[] {
  const out: EvidenceItem[] = [];
  const approach = a.approach;
  if (approach) {
    const r = approach.residual;
    const assessment: EvidenceAssessment =
      r > THRESHOLDS.approachResidualK ? 'supports' : r <= THRESHOLDS.approachResidualK / 2 ? 'weakens' : 'inconclusive';
    out.push(
      item({
        id: 'cond-approach',
        title:
          assessment === 'supports'
            ? 'Condenser approach elevated at comparable conditions'
            : 'Condenser approach not elevated at comparable conditions',
        detail: `Last ${a.config.recentHours} h: ${fixed(approach.observed, 2)} K observed vs ${fixed(approach.expected, 2)} K expected from the baseline at the same load and inlet temperature.`,
        value: `${signed(r, 2)} K`,
        calculation: 'Approach = T_cond,sat − T_CW,out; expected value from the baseline model y ≈ b₀ + b₁·Q_cooling + b₂·T_CW,in.',
        assessment,
        critical: true,
      }),
    );
  }

  if (a.power) {
    const ratio = powerRatio(a);
    const pct = a.power.residualPct;
    let assessment: EvidenceAssessment;
    let title: string;
    if (pct >= THRESHOLDS.powerResidualPct) {
      const consistent =
        ratio === null || (ratio >= THRESHOLDS.powerConsistencyMin && ratio <= THRESHOLDS.powerConsistencyMax);
      assessment = consistent ? 'supports' : 'inconclusive';
      title = consistent
        ? 'Compressor power rises in line with the higher condensing temperature'
        : 'Compressor power rise is larger than the condensing temperature explains';
    } else if (a.impliedPowerChangePct !== null && a.impliedPowerChangePct >= 2 * THRESHOLDS.impliedPowerMinPct) {
      assessment = 'weakens';
      title = 'Condensing temperature rose but compressor power did not follow';
    } else {
      assessment = 'weakens';
      title = 'No baseline-adjusted compressor-power increase';
    }
    out.push(
      item({
        id: 'cond-power',
        title,
        detail: `Baseline-adjusted power ${signed(pct)}%; a condensing-temperature change of ${signed(a.condSat?.residual ?? 0, 2)} K implies about ${signed(a.impliedPowerChangePct ?? 0)}% at a baseline lift of ${fixed(a.baselineLiftK ?? 0)} K.`,
        value: `${signed(pct)}%`,
        calculation: 'Implied ΔP/P ≈ ΔT_cond,sat / (T_cond,sat − T_evap), from COP ∝ T_evap / lift at fixed compressor efficiency.',
        assessment,
        critical: true,
      }),
    );
  }

  const fs = flowState(a);
  if (a.flow) {
    out.push(
      item(
        {
          id: 'cond-flow',
          title:
            fs === 'stable'
              ? 'Measured condenser-water flow comparatively stable'
              : fs === 'reduced'
                ? 'Measured condenser-water flow reduced'
                : 'Measured condenser-water flow changed moderately',
          detail: `Median flow ${fixed(a.flow.recentMedianKgS)} kg/s vs ${fixed(a.flow.baselineMedianKgS)} kg/s in the baseline. Stable measured flow does not rule out maldistribution or a flow-meter error.`,
          value: `${signed(a.flow.changePct)}%`,
          calculation: 'Change in median measured condenser-water flow, recent window vs baseline window.',
          assessment: fs === 'stable' ? 'supports' : fs === 'reduced' ? 'weakens' : 'inconclusive',
          critical: false,
        },
        1,
      ),
    );
  }

  const p = a.persistence;
  if (p.blocks.length > 0) {
    const assessment: EvidenceAssessment =
      p.elevatedBlocks >= THRESHOLDS.persistenceMinBlocks ? 'supports' : p.elevatedBlocks === 0 ? 'weakens' : 'inconclusive';
    out.push(
      item(
        {
          id: 'cond-persistence',
          title:
            assessment === 'supports'
              ? 'Pattern persists and grows over time'
              : assessment === 'weakens'
                ? 'No persistent combined approach and power pattern'
                : 'Pattern is intermittent',
          detail: `Approach and power both elevated in ${p.elevatedBlocks} of the last ${p.blocks.length} ${a.config.blockHours}-hour blocks; approach residual trend ${signed(p.trendKPerDay ?? 0, 2)} K/day since the baseline.`,
          value: `${p.elevatedBlocks}/${p.blocks.length} blocks`,
          calculation: `A block counts as elevated when approach residual > ${THRESHOLDS.approachResidualK} K and power residual > ${THRESHOLDS.powerResidualPct / 2}%.`,
          assessment,
          critical: false,
        },
        1,
      ),
    );
  }

  out.push(
    item({
      id: 'cond-missing',
      title: 'No independent condensing-pressure or tube-condition measurement',
      detail:
        'Condensing temperature comes from a single channel. A calibrated condensing-pressure reading or tube inspection would confirm or refute degradation.',
      value: null,
      calculation: 'Not available in this dataset.',
      assessment: 'missing',
      critical: false,
    }),
  );
  return out;
}

function flowEvidence(a: AnalysisResult): EvidenceItem[] {
  const out: EvidenceItem[] = [];
  const fs = flowState(a);
  if (a.flow) {
    out.push(
      item({
        id: 'flow-measured',
        title:
          fs === 'reduced'
            ? 'Sustained reduction in measured condenser-water flow'
            : fs === 'stable'
              ? 'No sustained reduction in measured flow'
              : 'Measured flow change is small',
        detail: `Median flow ${fixed(a.flow.recentMedianKgS)} kg/s vs ${fixed(a.flow.baselineMedianKgS)} kg/s in the baseline.`,
        value: `${signed(a.flow.changePct)}%`,
        calculation: `Reduction threshold ${THRESHOLDS.flowReductionPct}%; treated as stable within ±${THRESHOLDS.flowStablePct}%.`,
        assessment: fs === 'reduced' ? 'supports' : fs === 'stable' ? 'weakens' : 'inconclusive',
        critical: true,
      }),
    );
  }
  if (a.cwRange) {
    const pct = a.cwRange.residualPct;
    const assessment: EvidenceAssessment =
      pct >= THRESHOLDS.cwRangeResidualPct
        ? 'supports'
        : Math.abs(pct) < THRESHOLDS.cwRangeResidualPct / 2
          ? 'weakens'
          : 'inconclusive';
    out.push(
      item({
        id: 'flow-range',
        title:
          assessment === 'supports'
            ? 'Condenser-water temperature range increased'
            : 'Condenser-water temperature range unchanged',
        detail: `Range ${fixed(a.cwRange.observed, 2)} K observed vs ${fixed(a.cwRange.expected, 2)} K expected. Less water carrying the same heat should widen the range.`,
        value: `${signed(pct)}%`,
        calculation: 'Range = T_CW,out − T_CW,in, compared with the comparable-condition baseline.',
        assessment,
        critical: false,
      }),
    );
  }
  if (a.heatBalance) {
    const closes = Math.abs(a.heatBalance.shiftPct) < THRESHOLDS.heatBalanceShiftPct;
    const assessment: EvidenceAssessment = fs === 'reduced' ? (closes ? 'supports' : 'weakens') : 'inconclusive';
    out.push(
      item(
        {
          id: 'flow-balance',
          title:
            fs !== 'reduced'
              ? 'Heat balance not informative without a flow change'
              : closes
                ? 'Heat balance still closes with the lower measured flow'
                : 'Heat balance no longer closes with the measured flow',
          detail: `Median closure ${signed(a.heatBalance.recentMedianPct)}% recently vs ${signed(a.heatBalance.baselineMedianPct)}% in the baseline.`,
          value: `${signed(a.heatBalance.shiftPct)} pts`,
          calculation: 'Closure = (ṁ·c_p·(T_out − T_in) − (Q_cooling + P)) / (Q_cooling + P). Simplified steady-state balance.',
          assessment,
          critical: false,
        },
        1,
      ),
    );
  }
  out.push(
    item({
      id: 'flow-missing',
      title: 'No pump differential pressure or valve-position data',
      detail: 'Pump ΔP, valve positions or strainer ΔP would show whether hydraulic resistance changed.',
      value: null,
      calculation: 'Not available in this dataset.',
      assessment: 'missing',
      critical: false,
    }),
  );
  return out;
}

function instrumentationEvidence(a: AnalysisResult): EvidenceItem[] {
  const out: EvidenceItem[] = [];
  if (a.heatBalance) {
    const shifted = Math.abs(a.heatBalance.shiftPct) >= THRESHOLDS.heatBalanceShiftPct;
    out.push(
      item({
        id: 'inst-balance',
        title: shifted ? 'Heat balance closure shifted' : 'Water-side heat balance still closes',
        detail: shifted
          ? `Closure moved from ${signed(a.heatBalance.baselineMedianPct)}% to ${signed(a.heatBalance.recentMedianPct)}%: the flow and temperature readings no longer agree with Q_cooling + P.`
          : 'Flow, water temperatures, load and power remain mutually consistent. This does not test the condensing-temperature channel.',
        value: `${signed(a.heatBalance.shiftPct)} pts`,
        calculation: `Shift threshold ${THRESHOLDS.heatBalanceShiftPct} percentage points.`,
        assessment: shifted ? 'supports' : 'weakens',
        weight: shifted ? 2 : 1,
        critical: false,
      }),
    );
  }

  const ratio = powerRatio(a);
  if (a.power) {
    let assessment: EvidenceAssessment;
    let title: string;
    if (ratio !== null) {
      const consistent = ratio >= THRESHOLDS.powerConsistencyMin && ratio <= THRESHOLDS.powerConsistencyMax;
      assessment = consistent ? 'weakens' : 'supports';
      title = consistent
        ? 'Condensing temperature and compressor power change together'
        : 'Condensing temperature and compressor power disagree';
    } else if (a.power.residualPct >= THRESHOLDS.powerResidualPct) {
      assessment = 'supports';
      title = 'Compressor power rose without a condensing-temperature change';
    } else {
      assessment = 'weakens';
      title = 'Condensing temperature and compressor power both unchanged';
    }
    out.push(
      item({
        id: 'inst-consistency',
        title,
        detail: `Observed power ${signed(a.power.residualPct)}% vs ${signed(a.impliedPowerChangePct ?? 0)}% implied by the condensing-temperature residual. Power is metered independently of the temperature channels.`,
        value: ratio === null ? null : `ratio ${fixed(ratio, 2)}`,
        calculation: `Consistent when observed / implied is between ${THRESHOLDS.powerConsistencyMin} and ${THRESHOLDS.powerConsistencyMax}.`,
        assessment,
        critical: false,
      }),
    );
  }

  const fs = flowState(a);
  if (a.flow && a.cwRange) {
    const rangeUp = a.cwRange.residualPct >= THRESHOLDS.cwRangeResidualPct;
    const assessment: EvidenceAssessment = fs === 'reduced' ? (rangeUp ? 'weakens' : 'supports') : 'inconclusive';
    out.push(
      item({
        id: 'inst-flow-range',
        title:
          fs !== 'reduced'
            ? 'Flow reading not tested (no flow change)'
            : rangeUp
              ? 'Flow reduction confirmed by a wider water range'
              : 'Flow reading fell but water range did not widen',
        detail: `Flow ${signed(a.flow.changePct)}%, condenser-water range ${signed(a.cwRange.residualPct)}% vs baseline.`,
        value: null,
        calculation: 'For fixed heat rejection, range ∝ 1 / flow.',
        assessment,
        critical: false,
      }),
    );
  }

  const implausible = a.dataQuality.implausibleFraction;
  out.push(
    item(
      {
        id: 'inst-implausible',
        title: implausible >= THRESHOLDS.implausibleFraction ? 'Implausible readings present' : 'No implausible readings',
        detail:
          implausible >= THRESHOLDS.implausibleFraction
            ? 'Out-of-range, zero-flow or physically inconsistent readings were found.'
            : 'All reported values are within physical bounds. A slow drift can still look plausible.',
        value: `${fixed(implausible * 100)}%`,
        calculation: 'Share of reported intervals failing bounds or ordering checks (T_out ≥ T_in, T_sat ≥ T_out).',
        assessment: implausible >= THRESHOLDS.implausibleFraction ? 'supports' : 'inconclusive',
        critical: false,
      },
      1,
    ),
  );

  out.push(
    item({
      id: 'inst-missing',
      title: 'No independent reference measurement',
      detail:
        'Changes in several channels derived from the same sensors are not independent confirmation. A calibrated reference probe or clamp-on flow meter would settle this.',
      value: null,
      calculation: 'Not available in this dataset.',
      assessment: 'missing',
      critical: false,
    }),
  );
  return out;
}

const DEFINITIONS: Record<HypothesisId, { name: string; summary: string; evaluate: (a: AnalysisResult) => EvidenceItem[] }> = {
  condenserFouling: {
    name: 'Condenser heat-transfer degradation',
    summary: 'Reduced effective heat transfer (e.g. fouling or scaling) raises condensing temperature and compressor lift.',
    evaluate: condenserEvidence,
  },
  flowReduction: {
    name: 'Reduced condenser-water flow',
    summary: 'Less condenser water (pump, valve, strainer or tower issue) carries the same heat with a wider range.',
    evaluate: flowEvidence,
  },
  instrumentation: {
    name: 'Sensor / instrumentation problem',
    summary: 'A drifting or failed sensor makes healthy operation look abnormal.',
    evaluate: instrumentationEvidence,
  },
};

export const HYPOTHESIS_ORDER: HypothesisId[] = ['condenserFouling', 'flowReduction', 'instrumentation'];

function abnormalSignals(a: AnalysisResult): string[] {
  const signals: string[] = [];
  if (a.approach && a.approach.residual > THRESHOLDS.approachResidualK) {
    signals.push(`Condenser approach ${signed(a.approach.residual, 2)} K above comparable baseline`);
  }
  if (a.power && a.power.residualPct >= THRESHOLDS.powerResidualPct) {
    signals.push(`Baseline-adjusted compressor power ${signed(a.power.residualPct)}%`);
  }
  if (a.flow && Math.abs(a.flow.changePct) >= THRESHOLDS.flowReductionPct) {
    signals.push(`Measured condenser-water flow ${signed(a.flow.changePct)}%`);
  }
  if (a.cwRange && Math.abs(a.cwRange.residualPct) >= THRESHOLDS.cwRangeResidualPct) {
    signals.push(`Condenser-water range ${signed(a.cwRange.residualPct)}% vs baseline`);
  }
  if (a.heatBalance && Math.abs(a.heatBalance.shiftPct) >= THRESHOLDS.heatBalanceShiftPct) {
    signals.push(`Heat-balance closure shifted ${signed(a.heatBalance.shiftPct)} points`);
  }
  if (a.dataQuality.implausibleFraction >= THRESHOLDS.implausibleFraction) {
    signals.push(`${fixed(a.dataQuality.implausibleFraction * 100)}% implausible readings`);
  }
  return signals;
}

const STATUS_LABELS: Record<HypothesisStatus, string> = {
  leading: 'Leading hypothesis — requires verification',
  possible: 'Possible — cannot be excluded',
  lessConsistent: 'Less consistent with the evidence',
  notSupported: 'Not supported — no abnormality found',
  notEvaluated: 'Not evaluated — insufficient data',
};

function withStatus(h: Omit<HypothesisEvaluation, 'status' | 'statusLabel'>, status: HypothesisStatus): HypothesisEvaluation {
  return { ...h, status, statusLabel: STATUS_LABELS[status] };
}

export function evaluateHypotheses(a: AnalysisResult): InvestigationResult {
  const drafts = HYPOTHESIS_ORDER.map((id) => {
    const def = DEFINITIONS[id];
    const evidence = a.dataQuality.sufficient ? def.evaluate(a) : [];
    const supportScore = evidence.filter((e) => e.assessment === 'supports').reduce((s, e) => s + e.weight, 0);
    const weakenScore = evidence.filter((e) => e.assessment === 'weakens').reduce((s, e) => s + e.weight, 0);
    const excluded = evidence.some((e) => e.critical && e.assessment === 'weakens');
    return { id, name: def.name, summary: def.summary, evidence, supportScore, weakenScore, netScore: supportScore - weakenScore, excluded };
  });

  if (!a.dataQuality.sufficient) {
    return {
      outcome: 'insufficientEvidence',
      abnormalSignals: [],
      hypotheses: drafts.map((d) => withStatus(d, 'notEvaluated')),
      leading: null,
      strength: null,
      explanation: `Insufficient evidence: ${a.dataQuality.limitations.join(' ') || 'the data does not support a comparison.'}`,
    };
  }

  const signals = abnormalSignals(a);
  if (signals.length === 0) {
    return {
      outcome: 'noAbnormality',
      abnormalSignals: [],
      hypotheses: drafts.map((d) => withStatus(d, 'notSupported')),
      leading: null,
      strength: null,
      explanation: 'No supported abnormality: recent operation matches the comparable-condition baseline within thresholds.',
    };
  }

  const candidates = drafts.filter((d) => !d.excluded && d.netScore > 0).sort((x, y) => y.netScore - x.netScore);
  const top = candidates[0];
  const second = candidates[1];
  const leading = top && (!second || top.netScore - second.netScore >= THRESHOLDS.leadingMargin) ? top.id : null;

  const hypotheses = drafts.map((d) => {
    if (d.id === leading) return withStatus(d, 'leading');
    if (candidates.includes(d)) return withStatus(d, 'possible');
    return withStatus(d, 'lessConsistent');
  });

  let strength: EvidenceStrength | null = null;
  if (top && leading) {
    strength = top.netScore >= 4 && a.dataQuality.limitations.length === 0 ? 'Medium' : 'Low';
  }

  const leadingName = leading ? DEFINITIONS[leading].name : null;
  return {
    outcome: 'abnormal',
    abnormalSignals: signals,
    hypotheses,
    leading,
    strength,
    explanation: leadingName
      ? `The evidence is more consistent with ${leadingName.toLowerCase()} than with the alternatives.`
      : 'An abnormal pattern is present, but the evidence does not discriminate between the candidate explanations.',
  };
}

export function hypothesisName(id: HypothesisId): string {
  return DEFINITIONS[id].name;
}
