import type { EventGroup } from '$lib/models/event-groups/event-groups';

import { formatDistanceAbbreviated, type ValidTime } from './format-time';

export const eventGroupUsesCurrentDuration = (
  group: EventGroup | undefined,
): boolean => {
  return Boolean(
    group?.isPending && (group.pendingActivity || group.pendingNexusOperation),
  );
};

export const getEventGroupDurationEnd = (
  group: EventGroup | undefined,
  endTime: ValidTime = new Date(),
): ValidTime | null | undefined => {
  if (!group) return undefined;
  if (eventGroupUsesCurrentDuration(group)) return endTime;
  return group.lastEvent?.eventTime;
};

export const formatEventGroupDuration = ({
  group,
  endTime,
  includeMilliseconds = false,
  includeMillisecondsForUnderSecond = false,
}: {
  group: EventGroup | undefined;
  endTime?: ValidTime;
  includeMilliseconds?: boolean;
  includeMillisecondsForUnderSecond?: boolean;
}): string => {
  return formatDistanceAbbreviated({
    start: group?.initialEvent?.eventTime,
    end: getEventGroupDurationEnd(group, endTime),
    includeMilliseconds,
    includeMillisecondsForUnderSecond,
  });
};
