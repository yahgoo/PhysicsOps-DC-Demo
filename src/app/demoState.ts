import { WHAT_IF_DEFAULT_REDUCTION } from '../engine/assumptions';
import type { HypothesisId } from '../engine/types';

export const BASELINE_HOURS = 72;
export const TOTAL_HOURS = 168;

export type Stage = 'overview' | 'revealing' | 'investigating';
export type InvestigationStep = 'observations' | 'hypotheses' | 'evidence' | 'finding' | 'whatIf';
export type ChartTab = 'approach' | 'power' | 'flow' | 'cop' | 'whatIf';
export type InspectionStatus = 'notRequested' | 'created';

export interface DemoState {
  stage: Stage;
  revealedHours: number;
  step: InvestigationStep;
  selectedHypothesis: HypothesisId | null;
  chartTab: ChartTab;
  whatIfReduction: number;
  /** Reduction used for the last explicit what-if run; null until run. */
  whatIfRunReduction: number | null;
  checkedItems: string[];
  inspection: InspectionStatus;
}

export type DemoAction =
  | { type: 'start' }
  | { type: 'reveal'; hours: number }
  | { type: 'setStep'; step: InvestigationStep }
  | { type: 'selectHypothesis'; id: HypothesisId }
  | { type: 'setChartTab'; tab: ChartTab }
  | { type: 'setWhatIfReduction'; value: number }
  | { type: 'runWhatIf' }
  | { type: 'toggleCheck'; item: string }
  | { type: 'createInspection' }
  | { type: 'reset' };

export const initialDemoState: DemoState = {
  stage: 'overview',
  revealedHours: BASELINE_HOURS,
  step: 'observations',
  selectedHypothesis: null,
  chartTab: 'approach',
  whatIfReduction: WHAT_IF_DEFAULT_REDUCTION,
  whatIfRunReduction: null,
  checkedItems: [],
  inspection: 'notRequested',
};

export function demoReducer(state: DemoState, action: DemoAction): DemoState {
  switch (action.type) {
    case 'start':
      return { ...initialDemoState, stage: 'revealing' };
    case 'reveal': {
      if (state.stage !== 'revealing') return state;
      const hours = Math.min(Math.max(action.hours, BASELINE_HOURS), TOTAL_HOURS);
      return { ...state, revealedHours: hours, stage: hours >= TOTAL_HOURS ? 'investigating' : 'revealing' };
    }
    case 'setStep':
      return state.stage === 'investigating' ? { ...state, step: action.step } : state;
    case 'selectHypothesis':
      return state.stage === 'investigating' ? { ...state, selectedHypothesis: action.id, step: 'evidence' } : state;
    case 'setChartTab':
      if (action.tab === 'whatIf' && state.whatIfRunReduction === null) return state;
      return { ...state, chartTab: action.tab };
    case 'setWhatIfReduction':
      return { ...state, whatIfReduction: action.value };
    case 'runWhatIf':
      return state.stage === 'investigating'
        ? { ...state, whatIfRunReduction: state.whatIfReduction, chartTab: 'whatIf' }
        : state;
    case 'toggleCheck':
      return {
        ...state,
        checkedItems: state.checkedItems.includes(action.item)
          ? state.checkedItems.filter((i) => i !== action.item)
          : [...state.checkedItems, action.item],
      };
    case 'createInspection':
      return state.stage === 'investigating' ? { ...state, inspection: 'created' } : state;
    case 'reset':
      return initialDemoState;
  }
}
