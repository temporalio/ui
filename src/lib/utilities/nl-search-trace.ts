import { translate } from '$lib/i18n/translate';
import type { BadgeColorScheme } from '$lib/io/badge/badge.svelte';
import type {
  NLSearchFilter,
  NLSearchTraceOutcome,
  NLSearchTraceStep,
} from '$lib/services/nl-search-service';

export type NLSearchTraceGroupName =
  | 'status'
  | 'identifiers'
  | 'values'
  | 'time'
  | 'custom';

export type NLSearchTraceGroup = {
  name: NLSearchTraceGroupName;
  notable: NLSearchTraceStep[];
  other: NLSearchTraceStep[];
};

const GROUP_ORDER: NLSearchTraceGroupName[] = [
  'status',
  'identifiers',
  'values',
  'time',
  'custom',
];

const QUESTION_GROUPS: Record<string, NLSearchTraceGroupName> = {
  status: 'status',
  workflow_type: 'identifiers',
  workflow_id: 'identifiers',
  id_is_prefix: 'identifiers',
  run_id: 'identifiers',
  value_attribute: 'values',
  value_comparison: 'values',
  time_range: 'time',
  time_amount: 'time',
  time_unit: 'time',
  time_direction: 'time',
  time_attribute: 'time',
  custom: 'custom',
};

const NOTABLE_BELOW_THRESHOLD_SCORE = 0.2;

const COMPARISON_SYMBOLS: Record<string, string> = {
  equals: '=',
  not_equals: '!=',
  starts_with: 'STARTS_WITH',
  greater: '>',
  greater_or_equal: '>=',
  less: '<',
  less_or_equal: '<=',
};

const COMPARISON_LABELS: Record<string, () => string> = {
  equals: () => translate('workflows.nl-search-trace-comparison-equals'),
  not_equals: () =>
    translate('workflows.nl-search-trace-comparison-not-equals'),
  starts_with: () =>
    translate('workflows.nl-search-trace-comparison-starts-with'),
  greater: () => translate('workflows.nl-search-trace-comparison-greater'),
  greater_or_equal: () =>
    translate('workflows.nl-search-trace-comparison-greater-or-equal'),
  less: () => translate('workflows.nl-search-trace-comparison-less'),
  less_or_equal: () =>
    translate('workflows.nl-search-trace-comparison-less-or-equal'),
};

const NO_ANSWER_KEYS = ['none', 'not_mentioned', 'not_a_value'];

const optionLabel = (key: string): string => {
  if (key === 'none') return translate('workflows.nl-search-trace-answer-none');
  if (key === 'not_mentioned')
    return translate('workflows.nl-search-trace-answer-not-mentioned');
  if (key === 'not_a_value')
    return translate('workflows.nl-search-trace-answer-not-a-value');
  return COMPARISON_LABELS[key]?.() ?? key.replaceAll('_', ' ');
};

export const formatPercent = (value: number): string => {
  const tenths = Math.round(value * 1000) / 10;
  return `${Number.isInteger(tenths) ? tenths : tenths.toFixed(1)}%`;
};

export const isNotableStep = (step: NLSearchTraceStep): boolean => {
  switch (step.outcome) {
    case 'unused':
    case 'no_match':
      return false;
    case 'below_threshold':
      return (step.score ?? 0) >= NOTABLE_BELOW_THRESHOLD_SCORE;
    default:
      return true;
  }
};

export const groupTrace = (
  steps: readonly NLSearchTraceStep[],
): NLSearchTraceGroup[] =>
  GROUP_ORDER.map((name) => {
    const inGroup = steps.filter(
      (step) => (QUESTION_GROUPS[step.question] ?? 'custom') === name,
    );
    return {
      name,
      notable: inGroup.filter(isNotableStep),
      other: inGroup.filter((step) => !isNotableStep(step)),
    };
  }).filter((group) => group.notable.length + group.other.length > 0);

export const groupLabel = (name: NLSearchTraceGroupName): string => {
  if (name === 'status') return translate('workflows.nl-search-trace-status');
  if (name === 'identifiers')
    return translate('workflows.nl-search-trace-identifiers');
  if (name === 'values') return translate('workflows.nl-search-trace-values');
  if (name === 'time') return translate('workflows.nl-search-trace-time');
  return translate('workflows.nl-search-trace-custom');
};

export const questionLabel = (step: NLSearchTraceStep): string => {
  const subject = step.subject ?? '';
  switch (step.question) {
    case 'status':
      return translate('workflows.nl-search-trace-q-status', { subject });
    case 'workflow_type':
      return translate('workflows.nl-search-trace-q-workflow-type');
    case 'workflow_id':
      return translate('workflows.nl-search-trace-q-workflow-id');
    case 'id_is_prefix':
      return translate('workflows.nl-search-trace-q-id-is-prefix');
    case 'run_id':
      return translate('workflows.nl-search-trace-q-run-id');
    case 'time_range':
      return translate('workflows.nl-search-trace-q-time-range');
    case 'time_amount':
      return translate('workflows.nl-search-trace-q-time-amount');
    case 'time_unit':
      return translate('workflows.nl-search-trace-q-time-unit');
    case 'time_direction':
      return translate('workflows.nl-search-trace-q-time-direction');
    case 'time_attribute':
      return translate('workflows.nl-search-trace-q-time-attribute');
    case 'value_attribute':
      return translate('workflows.nl-search-trace-q-value-attribute', {
        subject,
      });
    case 'value_comparison':
      return translate('workflows.nl-search-trace-q-value-comparison', {
        subject,
      });
    default:
      return translate('workflows.nl-search-trace-q-custom', { subject });
  }
};

export const answerLabel = (step: NLSearchTraceStep): string | null => {
  if (step.kind === 'noul') {
    if (step.question === 'id_is_prefix' && step.answer === 'STARTS_WITH') {
      return translate('workflows.nl-search-trace-answer-prefix');
    }
    if (step.question === 'id_is_prefix' && step.answer === '=') {
      return translate('workflows.nl-search-trace-answer-exact');
    }
    return step.score === null
      ? null
      : translate('workflows.nl-search-trace-answer-yes', {
          probability: formatPercent(step.score),
        });
  }
  if (step.answer === null) return null;
  if (step.question === 'value_attribute' && step.answer !== 'not_a_value') {
    return step.answer;
  }
  return optionLabel(step.answer);
};

export const outcomeLabel = (outcome: NLSearchTraceOutcome): string => {
  switch (outcome) {
    case 'kept':
      return translate('workflows.nl-search-trace-outcome-kept');
    case 'below_threshold':
      return translate('workflows.nl-search-trace-outcome-below-threshold');
    case 'no_match':
      return translate('workflows.nl-search-trace-outcome-no-match');
    case 'missing':
      return translate('workflows.nl-search-trace-outcome-missing');
    case 'unused':
      return translate('workflows.nl-search-trace-outcome-unused');
    case 'incomplete':
      return translate('workflows.nl-search-trace-outcome-incomplete');
    case 'conflict':
      return translate('workflows.nl-search-trace-outcome-conflict');
    default:
      return translate('workflows.nl-search-trace-outcome-unavailable');
  }
};

const OUTCOME_TONES: Record<NLSearchTraceOutcome, BadgeColorScheme> = {
  kept: 'success',
  below_threshold: 'warning',
  no_match: 'neutral',
  missing: 'danger',
  unused: 'neutral',
  incomplete: 'warning',
  conflict: 'warning',
  unavailable: 'danger',
};

export const outcomeTone = (outcome: NLSearchTraceOutcome): BadgeColorScheme =>
  OUTCOME_TONES[outcome];

export const outcomeReason = (step: NLSearchTraceStep): string => {
  switch (step.outcome) {
    case 'kept':
      return step.filters.length > 0
        ? translate('workflows.nl-search-trace-reason-kept-filter')
        : translate('workflows.nl-search-trace-reason-kept');
    case 'below_threshold':
      return step.score !== null && step.threshold !== null
        ? translate('workflows.nl-search-trace-reason-below-threshold', {
            score: formatPercent(step.score),
            threshold: formatPercent(step.threshold),
          })
        : translate('workflows.nl-search-trace-reason-below-threshold-plain');
    case 'no_match':
      return translate('workflows.nl-search-trace-reason-no-match');
    case 'missing':
      return translate('workflows.nl-search-trace-reason-missing');
    case 'unused':
      return translate('workflows.nl-search-trace-reason-unused');
    case 'incomplete':
      return translate('workflows.nl-search-trace-reason-incomplete');
    case 'conflict':
      return translate('workflows.nl-search-trace-reason-conflict');
    default:
      return translate('workflows.nl-search-trace-reason-unavailable');
  }
};

export const filterLabel = (filter: NLSearchFilter): string =>
  `${filter.attribute} ${filter.conditional} ${filter.value}`;

export type NLSearchTraceBranch = {
  key: string;
  label: string;
  destination: string;
  tone: BadgeColorScheme;
  taken: boolean;
};

const CHOICE_KICKERS: Record<string, () => string> = {
  workflow_type: () =>
    translate('workflows.nl-search-trace-kicker-workflow-type'),
  workflow_id: () => translate('workflows.nl-search-trace-kicker-workflow-id'),
  run_id: () => translate('workflows.nl-search-trace-kicker-run-id'),
  time_range: () => translate('workflows.nl-search-trace-kicker-time-range'),
  time_amount: () => translate('workflows.nl-search-trace-kicker-time-amount'),
  time_unit: () => translate('workflows.nl-search-trace-kicker-time-unit'),
  time_direction: () =>
    translate('workflows.nl-search-trace-kicker-time-direction'),
  time_attribute: () =>
    translate('workflows.nl-search-trace-kicker-time-attribute'),
};

export const stageKicker = (step: NLSearchTraceStep): string => {
  if (step.question === 'status')
    return translate('workflows.nl-search-trace-kicker-status');
  if (step.question === 'id_is_prefix')
    return translate('workflows.nl-search-trace-kicker-prefix');
  if (step.question === 'custom') return step.subject ?? '';
  if (
    step.question === 'value_attribute' ||
    step.question === 'value_comparison'
  ) {
    return translate('workflows.nl-search-trace-kicker-value');
  }
  return CHOICE_KICKERS[step.question]?.() ?? step.question;
};

export const orderedStages = (
  steps: readonly NLSearchTraceStep[],
): { stages: NLSearchTraceStep[]; other: NLSearchTraceStep[] } => {
  const groups = groupTrace(steps);
  return {
    stages: groups.flatMap((group) => group.notable),
    other: groups.flatMap((group) => group.other),
  };
};

const isNoAnswer = (key: string) => NO_ANSWER_KEYS.includes(key);

export const noulBranches = (
  step: NLSearchTraceStep,
): NLSearchTraceBranch[] => {
  if (step.threshold === null) return [];
  const threshold = formatPercent(step.threshold);
  const passed = step.score !== null && step.score >= step.threshold;
  const answered = step.score !== null;
  const prefix = step.question === 'id_is_prefix';

  return [
    {
      key: 'below',
      label: translate('workflows.nl-search-trace-below', { threshold }),
      destination: prefix
        ? translate('workflows.nl-search-trace-answer-exact')
        : translate('workflows.nl-search-trace-skip'),
      tone: prefix ? 'info' : 'warning',
      taken: answered && !passed,
    },
    {
      key: 'at-least',
      label: translate('workflows.nl-search-trace-at-least', { threshold }),
      destination: prefix
        ? translate('workflows.nl-search-trace-answer-prefix')
        : translate('workflows.nl-search-trace-use'),
      tone: 'success',
      taken: answered && passed,
    },
  ];
};

const choiceDestination = (step: NLSearchTraceStep, key: string): string => {
  if (isNoAnswer(key)) return translate('workflows.nl-search-trace-no-filter');
  if (step.question === 'value_attribute')
    return translate('workflows.nl-search-trace-filter-on-attribute');
  if (step.question === 'value_comparison')
    return `${COMPARISON_SYMBOLS[key] ?? key} “${step.subject ?? ''}”`;
  return translate('workflows.nl-search-trace-filter-on-value');
};

export const choiceBranches = (
  step: NLSearchTraceStep,
  limit = 3,
): NLSearchTraceBranch[] => {
  const ranked = Object.entries(step.probabilities).sort(
    ([, a], [, b]) => b - a,
  );
  if (step.answer !== null && !ranked.some(([key]) => key === step.answer)) {
    ranked.unshift([step.answer, step.score ?? 0]);
  }
  const top = ranked.slice(0, limit);
  if (step.answer !== null && !top.some(([key]) => key === step.answer)) {
    top[top.length - 1] = [
      step.answer,
      step.probabilities[step.answer] ?? step.score ?? 0,
    ];
  }

  return top.map(([key, probability]) => ({
    key,
    label: translate('workflows.nl-search-trace-option-probability', {
      option: optionLabel(key),
      probability: formatPercent(probability),
    }),
    destination: choiceDestination(step, key),
    tone: isNoAnswer(key) ? 'neutral' : outcomeTone(step.outcome),
    taken: key === step.answer,
  }));
};

export const replacedBy = (
  step: NLSearchTraceStep,
  steps: readonly NLSearchTraceStep[],
): NLSearchTraceStep | null => {
  if (step.outcome !== 'conflict') return null;
  const values = new Set(
    step.filters.map((filter) => filter.value.toLowerCase()),
  );
  return (
    steps.find(
      (other) =>
        other.id !== step.id &&
        other.outcome === 'kept' &&
        other.filters.some((filter) => values.has(filter.value.toLowerCase())),
    ) ?? null
  );
};

export const stepReason = (
  step: NLSearchTraceStep,
  steps: readonly NLSearchTraceStep[],
): string => {
  const winner = replacedBy(step, steps);
  const winningFilter = winner?.filters[0];
  if (!winner || !winningFilter) return outcomeReason(step);
  return translate('workflows.nl-search-trace-reason-conflict-by', {
    filter: filterLabel(winningFilter),
    score: formatPercent(winningFilter.confidence),
  });
};

export type CarouselSlot = {
  index: number;
  offset: number;
  scale: number;
  opacity: number;
};

export type CarouselWindow = {
  slots: CarouselSlot[];
};

export const CAROUSEL_RADIUS = 2;
const CAROUSEL_SCALE_STEP = 0.1;
const CAROUSEL_OPACITY_STEP = 0.3;

export const carouselWindow = (
  count: number,
  selected: number,
  radius = CAROUSEL_RADIUS,
): CarouselWindow => {
  if (count === 0) return { slots: [] };
  const center = Math.min(Math.max(selected, 0), count - 1);
  const first = Math.max(0, center - radius);
  const last = Math.min(count - 1, center + radius);
  const slots: CarouselSlot[] = [];
  for (let index = first; index <= last; index++) {
    const distance = Math.abs(index - center);
    slots.push({
      index,
      offset: index - center,
      scale: 1 - distance * CAROUSEL_SCALE_STEP,
      opacity: 1 - distance * CAROUSEL_OPACITY_STEP,
    });
  }
  return { slots };
};
