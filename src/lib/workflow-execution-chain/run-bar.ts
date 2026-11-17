import { getCategoryStrokeColor } from '$lib/components/lines-and-dots/colors';
import {
  isWorkflowTaskGroup,
  type LazyGroup,
} from '$lib/services/grouped-event-buffer';
import type { EventTypeCategory } from '$lib/types/events';

export const SLOT_WIDTH = 2;
export const PENDING_OPACITY = 0.4;

export type RunBarSegment = {
  category: EventTypeCategory;
  color: string;
  opacity: number;
};

export const runBarSlots = (cardWidth: number): number =>
  Math.max(1, Math.floor(cardWidth / SLOT_WIDTH));

const dominantCategory = (groups: readonly LazyGroup[]): EventTypeCategory => {
  const counts = new Map<EventTypeCategory, number>();
  let dominant = groups[0].category;
  for (const group of groups) {
    const count = (counts.get(group.category) ?? 0) + 1;
    counts.set(group.category, count);
    if (count > (counts.get(dominant) ?? 0)) {
      dominant = group.category;
    }
  }
  return dominant;
};

const toSegment = (groups: readonly LazyGroup[]): RunBarSegment => {
  const category = dominantCategory(groups);
  return {
    category,
    color: getCategoryStrokeColor(category),
    opacity: groups.some((group) => group.isPending) ? PENDING_OPACITY : 1,
  };
};

export const buildRunBar = (
  groups: readonly LazyGroup[],
  cardWidth: number,
): RunBarSegment[] => {
  const lifecycleGroups = groups.filter((group) => !isWorkflowTaskGroup(group));
  const slots = runBarSlots(cardWidth);

  if (lifecycleGroups.length <= slots) {
    return lifecycleGroups.map((group) => toSegment([group]));
  }

  const segments: RunBarSegment[] = [];
  for (let slot = 0; slot < slots; slot++) {
    const start = Math.floor((slot * lifecycleGroups.length) / slots);
    const end = Math.floor(((slot + 1) * lifecycleGroups.length) / slots);
    segments.push(toSegment(lifecycleGroups.slice(start, end)));
  }
  return segments;
};
