export const nexusLinksViews = ['inbound', 'outbound'] as const;

export type NexusLinksView = (typeof nexusLinksViews)[number];

export const nexusLinksViewKey = 'links';

const isNexusLinksView = (value: string | null): value is NexusLinksView =>
  nexusLinksViews.some((view) => view === value);

export const getNexusLinksView = (
  requested: string | null,
  counts: Record<NexusLinksView, number>,
): NexusLinksView => {
  if (isNexusLinksView(requested)) return requested;
  return counts.inbound > 0 ? 'inbound' : 'outbound';
};
