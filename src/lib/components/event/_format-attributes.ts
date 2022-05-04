import { formatDate } from '$lib/utilities/format-date';
import {
  shouldDisplayAttribute,
  shouldDisplayNestedAttribute,
} from '$lib/utilities/get-single-attribute-for-event';
import { capitalize } from '$lib/utilities/format-camel-case';

export type CombinedAttributes = EventAttribute & {
  eventTime?: string;
};

const keysToOmit: Readonly<Set<string>> = new Set(['header']);

const keysToExpand: Readonly<Set<string>> = new Set([
  'taskQueue',
  'retryPolicy',
  'parentWorkflowExecution',
  'workflowExecution',
]);

const formatNestedAttributes = (
  attributes: CombinedAttributes,
  key: string,
) => {
  if (keysToExpand.has(key) && typeof attributes[key] === 'object') {
    for (const [nestedKey, nestedValue] of Object.entries(attributes[key])) {
      const shouldDisplayNested = shouldDisplayNestedAttribute(nestedValue);
      if (shouldDisplayNested) {
        attributes[`${key}${capitalize(nestedKey)}`] = nestedValue;
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

  if (compact) attributes.eventTime = formatDate(event.eventTime);

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
  label: string;
  color: Color;
};

export const attributeGroupingProperties: Readonly<
  Record<AttributeGroup, GroupingOption>
> = {
  activity: { label: 'Activity', color: 'green' },
  parent: { label: 'Parent', color: 'blue' },
  retryPolicy: { label: 'Retry Policy', color: 'red' },
  schedule: { label: 'Schedule', color: 'pink' },
  searchAttributes: { label: 'Search Attributes', color: 'indigo' },
  summary: { label: 'Summary', color: 'blueGray' },
  taskQueue: { label: 'Task Queue', color: 'yellow' },
  workflow: { label: 'Workflow', color: 'purple' },
};

export type AttributeGrouping = Partial<
  Record<AttributeGroup, EventAttributeKey[]>
>;

export const attributeGroups = (
  attributes: CombinedAttributes,
): AttributeGrouping => {
  const groupedAttributes = {
    summary: Object.keys(attributes),
  };

  for (const key of Object.keys(attributes)) {
    const attributeGroup = attributeGroupings.find((group) =>
      key.includes(group),
    );
    if (attributeGroup) {
      if (!groupedAttributes[attributeGroup]) {
        groupedAttributes[attributeGroup] = [key];
      } else {
        groupedAttributes[attributeGroup] = [
          key,
          ...groupedAttributes[attributeGroup],
        ];
      }
      groupedAttributes.summary = groupedAttributes.summary.filter(
        (g) => g !== key,
      );
    }
  }

  return groupedAttributes;
};
