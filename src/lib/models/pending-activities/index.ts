import { get } from 'svelte/store';
import { dataEncoderEndpoint } from '$lib/stores/data-encoder-config';
import {
  convertPayloadToJsonWithCodec,
  convertPayloadToJsonWithWebsocket,
  decodePayloadAttributes,
  type DecodeFunctions,
} from '$lib/utilities/decode-payload';

const getEndpoint = (
  settings: Settings,
  encoderEndpoint = dataEncoderEndpoint,
): string => {
  return get(encoderEndpoint) || settings?.codec?.endpoint || '';
};

export async function getActivityAttributes(
  { activity, namespace, settings }: PendingActivityWithMetadata,
  {
    convertWithCodec = convertPayloadToJsonWithCodec,
    convertWithWebsocket = convertPayloadToJsonWithWebsocket,
    decodeAttributes = decodePayloadAttributes,
    encoderEndpoint = dataEncoderEndpoint,
  }: DecodeFunctions = {},
): Promise<PendingActivity> {
  // Use locally set endpoint over settings endpoint for testing purposes
  const endpoint = getEndpoint(settings, encoderEndpoint);
  const _settings = { ...settings, codec: { ...settings?.codec, endpoint } };

  const convertedAttributes = endpoint
    ? await convertWithCodec({
        attributes: activity,
        namespace,
        settings: _settings,
      })
    : await convertWithWebsocket(activity);

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
  namespace: string,
  settings: Settings,
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
