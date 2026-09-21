import type { SearchAttributeFilter } from '$lib/models/search-attribute-filters';
import { isWorkflowStatusType } from '$lib/models/workflow-status';
import type { NLSearchFilter } from '$lib/services/nl-search-service';
import {
  SEARCH_ATTRIBUTE_TYPE,
  type SearchAttributes,
  type SearchAttributeType,
} from '$lib/types/workflows';

import { combineFilters, createFilter } from './to-list-workflow-filters';

const STATUS_ATTRIBUTE = 'ExecutionStatus';

const EQUALITY_CONDITIONALS = ['=', '!='];
const LOWER_BOUND_CONDITIONALS = ['>', '>='];
const UPPER_BOUND_CONDITIONALS = ['<', '<='];
const COMPARISON_CONDITIONALS = [
  ...EQUALITY_CONDITIONALS,
  ...LOWER_BOUND_CONDITIONALS,
  ...UPPER_BOUND_CONDITIONALS,
];

const allowedConditionals: Record<SearchAttributeType, string[]> = {
  [SEARCH_ATTRIBUTE_TYPE.BOOL]: EQUALITY_CONDITIONALS,
  [SEARCH_ATTRIBUTE_TYPE.DATETIME]: COMPARISON_CONDITIONALS,
  [SEARCH_ATTRIBUTE_TYPE.DOUBLE]: COMPARISON_CONDITIONALS,
  [SEARCH_ATTRIBUTE_TYPE.INT]: COMPARISON_CONDITIONALS,
  [SEARCH_ATTRIBUTE_TYPE.KEYWORD]: [...EQUALITY_CONDITIONALS, 'STARTS_WITH'],
  [SEARCH_ATTRIBUTE_TYPE.TEXT]: EQUALITY_CONDITIONALS,
  [SEARCH_ATTRIBUTE_TYPE.KEYWORDLIST]: EQUALITY_CONDITIONALS,
  [SEARCH_ATTRIBUTE_TYPE.UNSPECIFIED]: [],
};

type Candidate = {
  attribute: string;
  type: SearchAttributeType;
  conditional: string;
  value: string;
};

const toISOString = (value: string): string | null => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
};

const shiftMilliseconds = (value: string, milliseconds: number): string =>
  new Date(new Date(value).getTime() + milliseconds).toISOString();

const normalizeValue = (
  type: SearchAttributeType,
  value: string,
): string | null => {
  if (type === SEARCH_ATTRIBUTE_TYPE.BOOL) {
    const bool = value.toLowerCase();
    return bool === 'true' || bool === 'false' ? bool : null;
  }

  if (type === SEARCH_ATTRIBUTE_TYPE.DATETIME) {
    return toISOString(value);
  }

  if (
    type === SEARCH_ATTRIBUTE_TYPE.INT ||
    type === SEARCH_ATTRIBUTE_TYPE.DOUBLE
  ) {
    return value.trim() !== '' && Number.isFinite(Number(value))
      ? value.trim()
      : null;
  }

  return value.includes('"') ? null : value;
};

export type NLSearchFilterOptions = {
  prefixSearchEnabled: boolean;
};

const toCandidate = (
  filter: NLSearchFilter,
  searchAttributes: SearchAttributes,
  { prefixSearchEnabled }: NLSearchFilterOptions,
): Candidate | null => {
  const { attribute, conditional } = filter ?? {};
  if (typeof attribute !== 'string' || typeof filter.value !== 'string') {
    return null;
  }

  const type = searchAttributes[attribute];
  if (!type) return null;

  const isStatus = attribute === STATUS_ATTRIBUTE;
  const conditionals = isStatus
    ? EQUALITY_CONDITIONALS
    : (allowedConditionals[type] ?? []);
  if (!conditionals.includes(conditional)) return null;
  if (conditional === 'STARTS_WITH' && !prefixSearchEnabled) return null;

  if (isStatus) {
    return isWorkflowStatusType(filter.value)
      ? { attribute, type, conditional, value: filter.value }
      : null;
  }

  const value = normalizeValue(type, filter.value);
  if (value === null || value === '') return null;

  if (type === SEARCH_ATTRIBUTE_TYPE.BOOL && conditional === '!=') {
    return {
      attribute,
      type,
      conditional: '=',
      value: value === 'true' ? 'false' : 'true',
    };
  }

  return { attribute, type, conditional, value };
};

const isSameCandidate = (a: Candidate, b: Candidate): boolean =>
  a.attribute === b.attribute &&
  a.conditional === b.conditional &&
  a.value === b.value;

const dedupe = (candidates: Candidate[]): Candidate[] =>
  candidates.filter(
    (candidate, index) =>
      candidates.findIndex((other) => isSameCandidate(candidate, other)) ===
      index,
  );

const toStatusFilters = (candidates: Candidate[]): SearchAttributeFilter[] => {
  const statuses = candidates.filter((c) => c.attribute === STATUS_ATTRIBUTE);
  const included = statuses.filter((c) => c.conditional === '=');
  const excluded = statuses.filter((c) => c.conditional === '!=');

  return [
    ...included.map((candidate, index) =>
      createFilter({
        ...candidate,
        operator: index < included.length - 1 ? 'OR' : '',
      }),
    ),
    ...excluded.map((candidate) => createFilter(candidate)),
  ];
};

const toDatetimeFilters = (
  candidates: Candidate[],
): SearchAttributeFilter[] => {
  const lower = candidates.find((c) =>
    LOWER_BOUND_CONDITIONALS.includes(c.conditional),
  );
  const upper = candidates.find((c) =>
    UPPER_BOUND_CONDITIONALS.includes(c.conditional),
  );

  if (lower && upper) {
    const start =
      lower.conditional === '>'
        ? shiftMilliseconds(lower.value, 1)
        : lower.value;
    const end =
      upper.conditional === '<'
        ? shiftMilliseconds(upper.value, -1)
        : upper.value;

    if (start <= end) {
      const range = createFilter({
        attribute: lower.attribute,
        type: lower.type,
        conditional: 'BETWEEN',
        value: `BETWEEN "${start}" AND "${end}"`,
        customDate: true,
      });
      const rest = candidates.filter((c) => c !== lower && c !== upper);
      return [range, ...rest.map((c) => createFilter(c))];
    }
  }

  return candidates.map((c) => createFilter(c));
};

export const toFiltersFromNLSearch = (
  nlFilters: NLSearchFilter[] = [],
  searchAttributes: SearchAttributes = {},
  options: NLSearchFilterOptions = { prefixSearchEnabled: true },
): SearchAttributeFilter[] => {
  const candidates = dedupe(
    nlFilters
      .map((filter) => toCandidate(filter, searchAttributes, options))
      .filter((candidate): candidate is Candidate => candidate !== null),
  );

  const rest = candidates.filter((c) => c.attribute !== STATUS_ATTRIBUTE);
  const datetimeAttributes = new Set<string>();

  const otherFilters = rest.flatMap((candidate) => {
    if (candidate.type !== SEARCH_ATTRIBUTE_TYPE.DATETIME) {
      return [createFilter(candidate)];
    }
    if (datetimeAttributes.has(candidate.attribute)) return [];
    datetimeAttributes.add(candidate.attribute);
    return toDatetimeFilters(
      rest.filter((c) => c.attribute === candidate.attribute),
    );
  });

  return combineFilters([...toStatusFilters(candidates), ...otherFilters]);
};
