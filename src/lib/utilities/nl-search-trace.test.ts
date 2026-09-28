import { describe, expect, it } from 'vitest';

import type { NLSearchTraceStep } from '$lib/services/nl-search-service';

import {
  answerLabel,
  carouselWindow,
  choiceBranches,
  filterLabel,
  formatPercent,
  groupTrace,
  isNotableStep,
  noulBranches,
  orderedStages,
  outcomeLabel,
  outcomeReason,
  outcomeTone,
  questionLabel,
  stageKicker,
  stepReason,
} from './nl-search-trace';

const step = (overrides: Partial<NLSearchTraceStep>): NLSearchTraceStep => ({
  id: 'status_Failed',
  question: 'status',
  subject: 'Failed',
  kind: 'noul',
  answer: null,
  score: 0.97,
  threshold: 0.6,
  probabilities: {},
  outcome: 'kept',
  filters: [],
  ...overrides,
});

describe('formatPercent', () => {
  it('keeps whole numbers whole and rounds to one decimal', () => {
    expect(formatPercent(0.6)).toBe('60%');
    expect(formatPercent(0.14)).toBe('14%');
    expect(formatPercent(0.425)).toBe('42.5%');
  });
});

describe('isNotableStep', () => {
  it('shows used, replaced, incomplete, and missing answers', () => {
    expect(isNotableStep(step({ outcome: 'kept' }))).toBe(true);
    expect(isNotableStep(step({ outcome: 'conflict' }))).toBe(true);
    expect(isNotableStep(step({ outcome: 'incomplete' }))).toBe(true);
    expect(isNotableStep(step({ outcome: 'missing', score: null }))).toBe(true);
  });

  it('hides answers that were not needed or matched nothing', () => {
    expect(isNotableStep(step({ outcome: 'unused' }))).toBe(false);
    expect(isNotableStep(step({ outcome: 'no_match' }))).toBe(false);
  });

  it('shows a near miss and hides a clear no', () => {
    expect(
      isNotableStep(step({ outcome: 'below_threshold', score: 0.42 })),
    ).toBe(true);
    expect(
      isNotableStep(step({ outcome: 'below_threshold', score: 0.02 })),
    ).toBe(false);
  });
});

describe('groupTrace', () => {
  it('groups steps in a fixed order and drops empty groups', () => {
    const groups = groupTrace([
      step({ id: 'time_range', question: 'time_range', kind: 'choice' }),
      step({ id: 'status_Running', subject: 'Running', outcome: 'unused' }),
      step({ id: 'status_Failed' }),
    ]);

    expect(groups.map((group) => group.name)).toEqual(['status', 'time']);
    expect(groups[0].notable.map((s) => s.id)).toEqual(['status_Failed']);
    expect(groups[0].other.map((s) => s.id)).toEqual(['status_Running']);
  });
});

describe('labels', () => {
  it('names each question', () => {
    expect(questionLabel(step({}))).toBe('Status is Failed?');
    expect(
      questionLabel(step({ question: 'custom', subject: 'CustomerTier' })),
    ).toBe('Value of CustomerTier?');
    expect(questionLabel(step({ question: 'time_range' }))).toBe(
      'Which time range?',
    );
  });

  it('describes each kind of answer', () => {
    expect(answerLabel(step({ score: 0.97 }))).toBe('97% yes');
    expect(answerLabel(step({ score: null }))).toBeNull();
    expect(
      answerLabel(
        step({ question: 'id_is_prefix', answer: 'STARTS_WITH', score: 0.85 }),
      ),
    ).toBe('Starts with');
    expect(answerLabel(step({ kind: 'choice', answer: 'none' }))).toBe(
      'No answer',
    );
    expect(answerLabel(step({ kind: 'choice', answer: 'last_3_hours' }))).toBe(
      'last 3 hours',
    );
  });

  it('labels outcomes with a tone', () => {
    expect(outcomeLabel('below_threshold')).toBe('Too unsure');
    expect(outcomeTone('kept')).toBe('success');
    expect(outcomeTone('conflict')).toBe('warning');
    expect(outcomeTone('missing')).toBe('danger');
  });

  it('explains a near miss with its numbers', () => {
    expect(
      outcomeReason(step({ outcome: 'below_threshold', score: 0.42 })),
    ).toBe('Jev was not sure enough: 42% is under the 60% threshold.');
  });

  it('formats a filter', () => {
    expect(
      filterLabel({
        attribute: 'ExecutionStatus',
        type: 'Keyword',
        conditional: '=',
        value: 'Failed',
        confidence: 0.97,
      }),
    ).toBe('ExecutionStatus = Failed');
  });
});

describe('stages', () => {
  it('orders notable steps into stages and folds the rest', () => {
    const { stages, other } = orderedStages([
      step({ id: 'time_range', question: 'time_range', kind: 'choice' }),
      step({ id: 'status_Running', subject: 'Running', outcome: 'unused' }),
      step({ id: 'status_Failed' }),
    ]);
    expect(stages.map((s) => s.id)).toEqual(['status_Failed', 'time_range']);
    expect(other.map((s) => s.id)).toEqual(['status_Running']);
  });

  it('labels each stage', () => {
    expect(stageKicker(step({}))).toBe('Status gate');
    expect(stageKicker(step({ question: 'id_is_prefix' }))).toBe('Prefix gate');
    expect(stageKicker(step({ question: 'workflow_id', kind: 'choice' }))).toBe(
      'Workflow ID',
    );
    expect(
      stageKicker(step({ question: 'custom', subject: 'CustomerTier' })),
    ).toBe('CustomerTier');
  });
});

describe('noulBranches', () => {
  it('takes the use branch at or above the bar', () => {
    const branches = noulBranches(step({ score: 0.97 }));
    expect(branches.map((b) => [b.label, b.destination, b.taken])).toEqual([
      ['Below 60%', 'Skip', false],
      ['At least 60%', 'Use', true],
    ]);
  });

  it('takes the skip branch below the bar', () => {
    expect(
      noulBranches(step({ score: 0.41, outcome: 'below_threshold' })).map(
        (b) => b.taken,
      ),
    ).toEqual([true, false]);
  });

  it('names the prefix branches', () => {
    expect(
      noulBranches(step({ question: 'id_is_prefix', score: 0.85 })).map(
        (b) => b.destination,
      ),
    ).toEqual(['Exact match', 'Starts with']);
  });

  it('takes no branch without a score or a bar', () => {
    expect(
      noulBranches(step({ score: null, outcome: 'missing' })).some(
        (b) => b.taken,
      ),
    ).toBe(false);
    expect(noulBranches(step({ threshold: null }))).toEqual([]);
  });
});

describe('choiceBranches', () => {
  it('shows the top options by probability and marks the answer', () => {
    const branches = choiceBranches(
      step({
        question: 'workflow_id',
        kind: 'choice',
        answer: 'agent',
        score: 0.72,
        probabilities: { agent: 0.72, none: 0.2, 'agent-1': 0.05, x: 0.03 },
      }),
    );
    expect(branches.map((b) => [b.label, b.destination, b.taken])).toEqual([
      ['agent · 72%', 'Filter on this value', true],
      ['No answer · 20%', 'No filter', false],
      ['agent-1 · 5%', 'Filter on this value', false],
    ]);
  });

  it('keeps the answer when it is outside the top options', () => {
    const branches = choiceBranches(
      step({
        kind: 'choice',
        answer: 'rare',
        score: 0.1,
        probabilities: { a: 0.4, b: 0.3, c: 0.2, rare: 0.1 },
      }),
    );
    expect(branches.map((b) => b.key)).toEqual(['a', 'b', 'rare']);
    expect(branches.at(-1)?.taken).toBe(true);
  });

  it('falls back to the answer alone without probabilities', () => {
    const branches = choiceBranches(
      step({ kind: 'choice', answer: 'yesterday', score: 0.88 }),
    );
    expect(branches.map((b) => b.label)).toEqual(['yesterday · 88%']);
  });
});

describe('stepReason', () => {
  const workflowId = step({
    id: 'workflow_id',
    question: 'workflow_id',
    kind: 'choice',
    answer: 'agent',
    score: 0.61,
    outcome: 'conflict',
    filters: [
      {
        attribute: 'WorkflowId',
        type: 'Keyword',
        conditional: 'STARTS_WITH',
        value: 'agent',
        confidence: 0.61,
      },
    ],
  });
  const custom = step({
    id: 'custom_0',
    question: 'custom',
    subject: 'CustomKeywordField',
    kind: 'choice',
    answer: 'agent',
    score: 0.72,
    filters: [
      {
        attribute: 'CustomKeywordField',
        type: 'Keyword',
        conditional: '=',
        value: 'Agent',
        confidence: 0.72,
      },
    ],
  });

  it('names the reading that replaced a conflict', () => {
    expect(stepReason(workflowId, [workflowId, custom])).toBe(
      'Replaced by CustomKeywordField = Agent (72%).',
    );
  });

  it('falls back to the plain reason without a winner', () => {
    expect(stepReason(workflowId, [workflowId])).toBe(
      'A stronger reading claimed the same word.',
    );
    expect(stepReason(custom, [workflowId, custom])).toBe(
      'Jev was sure enough, so this became part of the query.',
    );
  });
});

describe('text with special characters', () => {
  it('does not escape values twice', () => {
    const custom = step({
      question: 'custom',
      subject: 'Tier<&>"',
      kind: 'choice',
      answer: 'a&b',
      probabilities: { 'a&b': 0.7 },
    });
    expect(questionLabel(custom)).toBe('Value of Tier<&>"?');
    expect(choiceBranches(custom)[0].label).toBe('a&b · 70%');
    expect(
      choiceBranches(
        step({
          question: 'value_comparison',
          subject: 'x',
          kind: 'choice',
          answer: 'greater',
          probabilities: { greater: 0.9 },
        }),
      )[0].destination,
    ).toBe('> “x”');
  });
});

describe('value questions', () => {
  const attribute = step({
    id: 'value_attribute_0',
    question: 'value_attribute',
    subject: 'agent',
    kind: 'choice',
    answer: 'WorkflowId',
    score: 0.86,
    threshold: 0.5,
    probabilities: {
      WorkflowId: 0.86,
      not_a_value: 0.1,
      CustomKeywordField: 0.04,
    },
  });
  const comparison = step({
    id: 'value_comparison_0',
    question: 'value_comparison',
    subject: 'agent',
    kind: 'choice',
    answer: 'starts_with',
    score: 0.93,
    threshold: 0.5,
    probabilities: { starts_with: 0.93, equals: 0.06 },
  });

  it('labels value stages with the value', () => {
    expect(stageKicker(attribute)).toBe('Value');
    expect(questionLabel(attribute)).toBe('What does “agent” filter on?');
    expect(questionLabel(comparison)).toBe('How is “agent” compared?');
  });

  it('shows the attribute and the comparison symbol as answers', () => {
    expect(answerLabel(attribute)).toBe('WorkflowId');
    expect(answerLabel(comparison)).toBe('Starts with');
    expect(answerLabel({ ...attribute, answer: 'not_a_value' })).toBe(
      'Not a filter value',
    );
  });

  it('describes where each branch leads', () => {
    expect(
      choiceBranches(attribute).map((b) => [b.label, b.destination]),
    ).toEqual([
      ['WorkflowId · 86%', 'Filter on this attribute'],
      ['Not a filter value · 10%', 'No filter'],
      ['CustomKeywordField · 4%', 'Filter on this attribute'],
    ]);
    expect(
      choiceBranches(comparison).map((b) => [b.label, b.destination]),
    ).toEqual([
      ['Starts with · 93%', 'STARTS_WITH “agent”'],
      ['Equals · 6%', '= “agent”'],
    ]);
  });

  it('groups value questions after status', () => {
    expect(
      groupTrace([attribute, comparison, step({})]).map((g) => g.name),
    ).toEqual(['status', 'values']);
  });
});

describe('carouselWindow', () => {
  it('centers the selected card with at most two on each side', () => {
    const { slots } = carouselWindow(8, 4);
    expect(slots.map((slot) => [slot.index, slot.offset])).toEqual([
      [2, -2],
      [3, -1],
      [4, 0],
      [5, 1],
      [6, 2],
    ]);
  });

  it('shrinks and fades each step away from the center', () => {
    const { slots } = carouselWindow(5, 2);
    expect(slots.map((slot) => slot.scale)).toEqual([0.8, 0.9, 1, 0.9, 0.8]);
    expect(slots.map((slot) => Number(slot.opacity.toFixed(1)))).toEqual([
      0.4, 0.7, 1, 0.7, 0.4,
    ]);
  });

  it('stops at the ends', () => {
    const newest = carouselWindow(6, 5);
    expect(newest.slots.map((slot) => slot.index)).toEqual([3, 4, 5]);

    const oldest = carouselWindow(6, 0);
    expect(oldest.slots.map((slot) => slot.index)).toEqual([0, 1, 2]);
  });

  it('clamps an out-of-range selection and handles no searches', () => {
    expect(carouselWindow(3, 9).slots.at(-1)?.offset).toBe(0);
    expect(carouselWindow(0, 0).slots).toEqual([]);
  });
});
