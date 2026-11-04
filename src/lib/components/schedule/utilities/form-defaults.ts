import type { SearchAttribute } from '$lib/types';
import type { SearchAttributes } from '$lib/types/workflows';
import { parsePayloadAttributes } from '$lib/utilities/decode-payload';

import { durationString } from '../schema/common';
import type { DurationString } from '../types';

const durationSchema = durationString();

export function toDurationString<Fallback extends DurationString | ''>(
  value: unknown,
  fallback: Fallback,
): DurationString | Fallback {
  const parsed = durationSchema.safeParse(value);

  return parsed.success ? parsed.data : fallback;
}

export function decodeSearchAttributeRows(
  searchAttributes: SearchAttribute,
  customSearchAttributes: SearchAttributes,
) {
  const decoded = parsePayloadAttributes({ searchAttributes });
  const indexedFields = decoded?.searchAttributes.indexedFields ?? {};

  return Object.entries(indexedFields).map(([label, value]) => ({
    label,
    value,
    type: customSearchAttributes[label],
  }));
}
