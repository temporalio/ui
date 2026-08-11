import type { SandboxWorkflow } from './mock-workflows';

export type SortKey = keyof Pick<
  SandboxWorkflow,
  'status' | 'workflowId' | 'type' | 'startTime' | 'endTime' | 'taskQueue'
>;

export type SortDirection = 'asc' | 'desc';

export type SortTerm = { key: SortKey; direction: SortDirection };

export type SandboxColumn = {
  key: SortKey;
  label: string;
  kind: 'text' | 'time';
  width: string;
};

/**
 * Every column is sortable in here — that is the whole point of the sandbox.
 * The live table only offers the two the visibility store can order by.
 */
export const SANDBOX_COLUMNS: SandboxColumn[] = [
  { key: 'status', label: 'Status', kind: 'text', width: '120px' },
  { key: 'workflowId', label: 'Workflow ID', kind: 'text', width: '260px' },
  { key: 'type', label: 'Type', kind: 'text', width: '200px' },
  { key: 'startTime', label: 'Start', kind: 'time', width: '160px' },
  { key: 'endTime', label: 'End', kind: 'time', width: '160px' },
  { key: 'taskQueue', label: 'Task Queue', kind: 'text', width: '140px' },
];

export const MAX_SORT_TERMS = 3;

export const GRID_MIN_WIDTH = SANDBOX_COLUMNS.reduce(
  (total, column) => total + parseInt(column.width, 10),
  0,
);

const columnFor = (key: SortKey) =>
  SANDBOX_COLUMNS.find((column) => column.key === key);

const defaultDirection = (key: SortKey): SortDirection =>
  columnFor(key)?.kind === 'time' ? 'desc' : 'asc';

/**
 * Plain click replaces the sort (or flips it when it is already the only term).
 * Shift-click appends a tiebreaker, up to MAX_SORT_TERMS.
 */
export const nextSort = (
  terms: SortTerm[],
  key: SortKey,
  additive: boolean,
): SortTerm[] => {
  const index = terms.findIndex((term) => term.key === key);

  if (additive) {
    if (index >= 0) {
      return terms.map((term, i) =>
        i === index
          ? { ...term, direction: term.direction === 'asc' ? 'desc' : 'asc' }
          : term,
      );
    }
    if (terms.length >= MAX_SORT_TERMS) return terms;
    return [...terms, { key, direction: defaultDirection(key) }];
  }

  if (index === 0 && terms.length === 1) {
    return [{ key, direction: terms[0].direction === 'asc' ? 'desc' : 'asc' }];
  }

  return [{ key, direction: defaultDirection(key) }];
};

const compareValues = (
  a: SandboxWorkflow,
  b: SandboxWorkflow,
  term: SortTerm,
): number => {
  const sign = term.direction === 'asc' ? 1 : -1;
  const left = a[term.key];
  const right = b[term.key];

  // Running workflows have no end time; keep them together at the bottom
  // regardless of direction rather than sorting them as zero.
  if (left === null && right === null) return 0;
  if (left === null) return 1;
  if (right === null) return -1;

  if (typeof left === 'number' && typeof right === 'number') {
    return (left - right) * sign;
  }

  return String(left).localeCompare(String(right)) * sign;
};

export const comparatorFor =
  (terms: SortTerm[]) => (a: SandboxWorkflow, b: SandboxWorkflow) => {
    for (const term of terms) {
      const result = compareValues(a, b, term);
      if (result !== 0) return result;
    }
    return 0;
  };

export const describeSort = (terms: SortTerm[]): string => {
  const phrases = terms.map((term) => {
    const column = columnFor(term.key);
    if (!column) return '';
    if (column.kind === 'time') {
      return `${column.label} ${term.direction === 'desc' ? 'newest first' : 'oldest first'}`;
    }
    return `${column.label} ${term.direction === 'asc' ? 'A→Z' : 'Z→A'}`;
  });

  return `Sorted by ${phrases.join(', then ')}.`;
};
