import { dataEncoderEndpoint } from '$lib/stores/data-encoder-config';
import {
  convertPayloadToJsonWithCodec,
  decodePayloadAttributes,
  type DecodeFunctions,
} from '$lib/utilities/decode-payload';
import { getEncoderEndpoint } from '$lib/utilities/get-encoder-endpoint';

export async function getActivityAttributes(
  { activity, namespace, settings, accessToken }: PendingActivityWithMetadata,
  {
    convertWithCodec = convertPayloadToJsonWithCodec,
    decodeAttributes = decodePayloadAttributes,
    encoderEndpoint = dataEncoderEndpoint,
  }: DecodeFunctions = {},
): Promise<PendingActivity> {
  // Use locally set endpoint over settings endpoint for testing purposes
  const endpoint = getEncoderEndpoint(settings, encoderEndpoint);
  const _settings = { ...settings, codec: { ...settings?.codec, endpoint } };

  const convertedAttributes = await convertWithCodec({
    attributes: activity,
    namespace,
    settings: _settings,
    accessToken,
  });

  const decodedAttributes = decodeAttributes(
    convertedAttributes,
  ) as PendingActivity;
  return decodedAttributes;
}

const decodePendingActivity = async ({
  activity,
  namespace,
  settings,
  accessToken,
}: PendingActivityWithMetadata): Promise<PendingActivity> => {
  const decodedActivity = await getActivityAttributes({
    activity,
    namespace,
    settings,
    accessToken,
  });
  return decodedActivity;
};

export const toDecodedPendingActivities = async (
  workflow: WorkflowExecution,
  namespace: string,
  settings: Settings,
  accessToken: string,
) => {
  const pendingActivities = workflow?.pendingActivities ?? [];
  const decodedActivities: PendingActivity[] = [];
  for (const activity of pendingActivities) {
    const decodedActivity = await decodePendingActivity({
      activity,
      namespace,
      settings,
      accessToken,
    });
    decodedActivities.push(decodedActivity);
  }

  return decodedActivities;
};
