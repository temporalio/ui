import type { EventGroup } from '$lib/models/event-groups/event-groups';
import type { IterableEvent, Payload, WorkflowEvent } from '$lib/types/events';
import type { Settings } from '$lib/types/global';

import {
  cloneAllPotentialPayloadsWithCodec,
  decodePayloadAttributes,
} from './decode-payload';
import {
  getCodecEndpoint,
  getCodecIncludeCredentials,
  getCodecPassAccessToken,
} from './get-codec';
import {
  formatSummaryValue,
  getActivityType,
  type SummaryAttribute,
} from './get-single-attribute-for-event';
import { isLocalActivityMarkerEvent } from './is-event-type';

export type DecodedLocalActivity = {
  details?: {
    data?: {
      payloads?: Payload[];
    };
    type?: {
      payloads?: Payload[];
    };
  };
};

export type LocalActivityDecodeOptions = {
  namespace: string;
  settings: Settings;
  accessToken?: string;
};

export const decodeLocalActivity = async (
  event: IterableEvent,
  options: LocalActivityDecodeOptions,
): Promise<SummaryAttribute | undefined> => {
  if (!('eventType' in event) || !isLocalActivityMarkerEvent(event)) {
    return undefined;
  }

  const { namespace, settings, accessToken } = options;

  const codecSettings = {
    ...settings,
    codec: {
      ...settings?.codec,
      endpoint: getCodecEndpoint(settings),
      passAccessToken: getCodecPassAccessToken(settings),
      includeCredentials: getCodecIncludeCredentials(settings),
    },
  };

  try {
    const convertedAttributes = await cloneAllPotentialPayloadsWithCodec(
      event.attributes,
      namespace,
      codecSettings,
      accessToken,
    );

    const payloads = (event.markerRecordedEventAttributes?.details?.data
      ?.payloads ||
      event.markerRecordedEventAttributes?.details?.type?.payloads ||
      []) as unknown as Payload[];

    if (!payloads?.length) return undefined;

    const decodedAttributes = decodePayloadAttributes(
      convertedAttributes,
    ) as DecodedLocalActivity;

    const payload = (decodedAttributes?.details?.data?.payloads ||
      decodedAttributes?.details?.type?.payloads)?.[0];
    const activityType = getActivityType(payload);

    if (activityType) {
      return formatSummaryValue('ActivityType', activityType);
    }
  } catch (err) {
    console.error('Failed to decode local activity type:', err);
  }

  return undefined;
};

export const getLocalActivityMarkerEvent = (
  eventOrGroup: WorkflowEvent | EventGroup,
): WorkflowEvent | undefined => {
  if ('eventList' in eventOrGroup) {
    return eventOrGroup.eventList.find(isLocalActivityMarkerEvent);
  } else if (isLocalActivityMarkerEvent(eventOrGroup)) {
    return eventOrGroup;
  }

  return undefined;
};
