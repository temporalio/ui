import { get } from 'svelte/store';

import { page } from '$app/stores';

import type {
  PendingActivity,
  PendingActivityWithMetadata,
} from '$lib/types/events';
import type { Settings } from '$lib/types/global';
import type { WorkflowExecution } from '$lib/types/workflows';
import {
  decodeEventAttributes,
  type DecodeFunctions,
  decodePayloadAttributes,
} from '$lib/utilities/decode-payload';

export async function getActivityAttributes(
  { activity, namespace, settings }: PendingActivityWithMetadata,
  {
    convertWithCodec = decodeEventAttributes,
    decodeAttributes = decodePayloadAttributes,
  }: DecodeFunctions = {},
): Promise<PendingActivity> {
  const convertedAttributes = await convertWithCodec(activity, settings);

  const decodedAttributes = decodeAttributes(
    convertedAttributes,
  ) as PendingActivity;
  return decodedAttributes;
}

const decodePendingActivity = async ({
  activity,
  namespace,
  settings,
}: PendingActivityWithMetadata): Promise<PendingActivity> => {
  const decodedActivity = await getActivityAttributes({
    activity,
    namespace,
    settings,
  });
  return decodedActivity;
};

export const toDecodedPendingActivities = async (
  workflow: WorkflowExecution,
  namespace: string = get(page).params.namespace,
  settings: Settings = get(page).data.settings,
) => {
  const pendingActivities = workflow?.pendingActivities ?? [];
  const decodedActivities: PendingActivity[] = [];
  for (const activity of pendingActivities) {
    const decodedActivity = await decodePendingActivity({
      activity,
      namespace,
      settings,
    });
    decodedActivities.push(decodedActivity);
  }

  return decodedActivities;
};
