import { get } from 'svelte/store';

import type { I18nKey } from '$lib/i18n';
import { translate } from '$lib/i18n/translate';
import { relativeTime, timeFormat } from '$lib/stores/time-format';
import type {
  EventAttribute,
  EventAttributeKey,
  IterableEvent,
} from '$lib/types/events';
import { capitalize } from '$lib/utilities/format-camel-case';
import { formatDate } from '$lib/utilities/format-date';
import {
  shouldDisplayAttribute,
  shouldDisplayNestedAttribute,
} from '$lib/utilities/get-single-attribute-for-event';

export type CombinedAttributes = EventAttribute & {
  eventTime?: string;
  workflowExecutionRunId?: string;
  workflowExecutionWorkflowId?: string;
  firstExecutionRunId?: string;
  continuedExecutionRunId?: string;
  newExecutionRunId?: string;
  namespace?: string;
};

const keysToOmit: Readonly<Set<string>> = new Set(['header']);

const keysToExpand: Readonly<Set<string>> = new Set([
  'taskQueue',
  'retryPolicy',
  'parentWorkflowExecution',
  'workflowExecution',
  'meta',
]);

const keysToFormat: Readonly<Set<string>> = new Set(['maximumAttempts']);

export const UnlimitedAttempts = translate('workflows.unlimited');
export const NoExpiration = translate('workflows.no-expiration');

export const formatRetryExpiration = (
  maxAttempts: number,
  expiration: string,
): number | string => {
  if (maxAttempts === 0) {
    return NoExpiration;
  }
  return expiration;
};

export const formatAttemptsLeft = (
  maxAttempts: number | null,
  attempt: number,
): number | string => {
  if (!maxAttempts) {
    return UnlimitedAttempts;
  }
  return maxAttempts - attempt;
};

export const formatMaximumAttempts = (
  maxAttempts: number | null,
): number | string => {
  if (!maxAttempts) {
    return UnlimitedAttempts;
  }
  return maxAttempts;
};

const formatValue = (key: string, value: unknown) => {
  if (key === 'maximumAttempts' && !value) {
    return UnlimitedAttempts;
  }
  return value;
};

const formatNestedAttributes = (
  attributes: CombinedAttributes,
  key: string,
) => {
  if (keysToExpand.has(key) && typeof attributes[key] === 'object') {
    for (const [nestedKey, nestedValue] of Object.entries(attributes[key])) {
      const shouldDisplayNested = shouldDisplayNestedAttribute(nestedValue);
      if (shouldDisplayNested) {
        if (keysToFormat.has(nestedKey)) {
          attributes[`${key}${capitalize(nestedKey)}`] = formatValue(
            nestedKey,
            nestedValue,
          );
        } else {
          attributes[`${key}${capitalize(nestedKey)}`] = nestedValue;
        }
      }
    }
    delete attributes[key];
  }
};

export const formatAttributes = (
  event: IterableEvent,
  { compact } = { compact: false },
): CombinedAttributes => {
  const attributes: CombinedAttributes = {};

  if (compact)
    attributes.eventTime = formatDate(event.eventTime, get(timeFormat), {
      relative: get(relativeTime),
    });

  for (const [key, value] of Object.entries(event.attributes)) {
    const shouldDisplay = shouldDisplayAttribute(key, value);
    if (!keysToOmit.has(key) && shouldDisplay) attributes[key] = value;
    formatNestedAttributes(attributes, key);
  }

  return attributes;
};

export type AttributeGroup =
  | 'summary'
  | 'parent'
  | 'activity'
  | 'taskQueue'
  | 'schedule'
  | 'retryPolicy'
  | 'workflow'
  | 'searchAttributes';

const attributeGroupings: Readonly<AttributeGroup[]> = [
  'summary',
  'parent',
  'activity',
  'taskQueue',
  'schedule',
  'retryPolicy',
  'workflow',
  'searchAttributes',
];

type GroupingOption = {
  label: I18nKey;
};

export const attributeGroupingProperties: Readonly<
  Record<AttributeGroup, GroupingOption>
> = {
  activity: { label: 'events.attribute-group.activity' },
  parent: { label: 'events.attribute-group.parent' },
  retryPolicy: { label: 'events.attribute-group.retry-policy' },
  schedule: { label: 'events.attribute-group.schedule' },
  searchAttributes: {
    label: 'events.attribute-group.search-attributes',
  },
  summary: { label: 'events.attribute-group.summary' },
  taskQueue: { label: 'events.attribute-group.task-queue' },
  workflow: { label: 'events.attribute-group.workflow' },
};

export type AttributeGrouping = Partial<
  Record<AttributeGroup, EventAttributeKey[]>
>;

const consolidateActivityGroups = (
  event: IterableEvent,
  groupedAttributes: AttributeGrouping,
) => {
  // Move activity group into summary if activity
  if (event.category === 'activity' && groupedAttributes?.activity?.length) {
    groupedAttributes.summary = [
      ...groupedAttributes.activity,
      ...groupedAttributes.summary,
    ];
    groupedAttributes.activity = [];
  }

  // Move workflow group into summary if activity
  if (event.category === 'activity' && groupedAttributes?.workflow?.length) {
    groupedAttributes.summary = [
      ...groupedAttributes.summary,
      ...groupedAttributes.workflow,
    ];
    groupedAttributes.workflow = [];
  }
};

const consolidateSingleItemGroups = (groupedAttributes: AttributeGrouping) => {
  const keysToIgnore: Readonly<Set<string>> = new Set([
    'summary',
    'searchAttributes',
  ]);
  for (const [key, value] of Object.entries(groupedAttributes)) {
    if (value.length === 1 && !keysToIgnore.has(key)) {
      groupedAttributes.summary = [...groupedAttributes.summary, ...value];
      groupedAttributes[key] = [];
    }
  }
};

export const attributeGroups = (
  event: IterableEvent,
  attributes: CombinedAttributes,
): AttributeGrouping => {
  const groupedAttributes: AttributeGrouping = {};
  attributeGroupings.forEach((group) => {
    if (group === 'summary') {
      groupedAttributes[group] = Object.keys(attributes) as EventAttributeKey[];
    } else {
      groupedAttributes[group] = [];
    }
  });

  for (const key in attributes) {
    const attributeGroup = attributeGroupings.find((group) =>
      key.includes(group),
    );
    if (attributeGroup) {
      groupedAttributes[attributeGroup] = [
        key as EventAttributeKey,
        ...groupedAttributes[attributeGroup],
      ];
      groupedAttributes.summary = groupedAttributes.summary.filter(
        (g) => g !== key,
      );
    }
  }

  consolidateActivityGroups(event, groupedAttributes);
  consolidateSingleItemGroups(groupedAttributes);

  return groupedAttributes;
};
