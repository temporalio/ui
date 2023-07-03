import {
  codecEndpoint,
  passAccessToken as codecPassAccessToken,
} from '$lib/stores/data-encoder-config';
import type {
  PendingActivity,
  PendingActivityWithMetadata,
} from '$lib/types/events';
import type { Settings } from '$lib/types/global';
import type { WorkflowExecution } from '$lib/types/workflows';
import {
  convertPayloadToJsonWithCodec,
  convertPayloadToJsonWithWebsocket,
  type DecodeFunctions,
  decodePayloadAttributes,
} from '$lib/utilities/decode-payload';
import {
  getCodecEndpoint,
  getCodecPassAccessToken,
} from '$lib/utilities/get-codec';

export async function getActivityAttributes(
  { activity, namespace, settings, accessToken }: PendingActivityWithMetadata,
  {
    convertWithCodec = convertPayloadToJsonWithCodec,
    convertWithWebsocket = convertPayloadToJsonWithWebsocket,
    decodeAttributes = decodePayloadAttributes,
    encoderEndpoint = codecEndpoint,
  }: DecodeFunctions = {},
): Promise<PendingActivity> {
  // Use locally set endpoint over settings endpoint for testing purposes
  const endpoint = getCodecEndpoint(settings, encoderEndpoint);
  const passAccessToken = getCodecPassAccessToken(
    settings,
    codecPassAccessToken,
  );
  const _settings = {
    ...settings,
    codec: { ...settings?.codec, endpoint, passAccessToken },
  };

  const convertedAttributes = endpoint
    ? await convertWithCodec({
        attributes: activity,
        namespace,
        settings: _settings,
        accessToken,
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
