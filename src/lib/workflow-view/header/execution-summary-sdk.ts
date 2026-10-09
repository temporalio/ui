import { formatSDKName } from '$lib/utilities/get-sdk-version';

import type { QualifiedHistoryEvent } from '../data/history-events/types';
import { compareEventIds } from '../data/identity-keys';

/** Reads the latest reported SDK name and version from selected-run history. */
export function getExecutionSummarySdk(
  events: readonly QualifiedHistoryEvent[],
): { sdk: string; version: string } {
  let nameEvent: QualifiedHistoryEvent | undefined;
  let versionEvent: QualifiedHistoryEvent | undefined;

  for (const event of events) {
    const metadata = event.workflowTaskCompletedEventAttributes?.sdkMetadata;
    if (!metadata) continue;

    if (
      metadata.sdkName &&
      (!nameEvent || compareEventIds(event.eventId, nameEvent.eventId) > 0)
    ) {
      nameEvent = event;
    }
    if (
      metadata.sdkVersion &&
      (!versionEvent ||
        compareEventIds(event.eventId, versionEvent.eventId) > 0)
    ) {
      versionEvent = event;
    }
  }

  return {
    sdk: formatSDKName(
      nameEvent?.workflowTaskCompletedEventAttributes?.sdkMetadata?.sdkName,
    ),
    version:
      versionEvent?.workflowTaskCompletedEventAttributes?.sdkMetadata
        ?.sdkVersion || '',
  };
}
