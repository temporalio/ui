export type TimelineRowPoolGroup = {
  readonly id: string;
  readonly version?: number;
};

export type TimelineRowSlot<T extends TimelineRowPoolGroup> = {
  index: number;
  lazy: T;
  version: number | undefined;
};

type AssignTimelineRowPoolOptions<T extends TimelineRowPoolGroup> = {
  groups: T[];
  poolSize: number;
  previousSlots: (TimelineRowSlot<T> | null)[];
  windowEnd: number;
  windowStart: number;
};

/**
 * Assign visible groups to persistent DOM slots while retaining every group
 * that is still in the window. Slot identity must not depend on pool size:
 * opening a details panel grows the pool, and a modulo assignment would
 * otherwise repoint all existing rows.
 */
export function assignTimelineRowPool<T extends TimelineRowPoolGroup>({
  groups,
  poolSize,
  previousSlots,
  windowEnd,
  windowStart,
}: AssignTimelineRowPoolOptions<T>): (TimelineRowSlot<T> | null)[] {
  const slots: (TimelineRowSlot<T> | null)[] = new Array(poolSize).fill(null);
  const previousByGroupId = new Map(
    previousSlots
      .map((slot, slotIndex) => ({ slot, slotIndex }))
      .filter(
        (
          entry,
        ): entry is {
          slot: TimelineRowSlot<T>;
          slotIndex: number;
        } => Boolean(entry.slot) && entry.slotIndex < poolSize,
      )
      .map(({ slot, slotIndex }) => [slot.lazy.id, { slot, slotIndex }]),
  );
  const unassigned: { index: number; lazy: T }[] = [];
  const end = Math.min(windowEnd, groups.length, windowStart + poolSize);

  for (let index = windowStart; index < end; index++) {
    const lazy = groups[index];
    const previous = previousByGroupId.get(lazy.id);

    if (previous && slots[previous.slotIndex] === null) {
      slots[previous.slotIndex] =
        previous.slot.index === index &&
        previous.slot.lazy === lazy &&
        previous.slot.version === lazy.version
          ? previous.slot
          : { index, lazy, version: lazy.version };
    } else {
      unassigned.push({ index, lazy });
    }
  }

  let freeSlotIndex = 0;
  for (const { index, lazy } of unassigned) {
    while (freeSlotIndex < slots.length && slots[freeSlotIndex] !== null)
      freeSlotIndex++;
    if (freeSlotIndex >= slots.length) break;
    slots[freeSlotIndex] = { index, lazy, version: lazy.version };
  }

  return slots;
}
