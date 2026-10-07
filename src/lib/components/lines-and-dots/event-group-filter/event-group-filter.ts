import type { EventGroupOption } from '$lib/services/grouped-event-buffer';

export const EVENT_GROUP_FILTER_OPTION_LIMIT = 100;

export const matchesEventGroupSearch = (
  option: EventGroupOption,
  label: string,
  search: string,
): boolean => {
  const query = search.trim().toLocaleLowerCase();
  if (!query) return true;
  return [label, option.group.id, option.group.name].some((value) =>
    value?.toLocaleLowerCase().includes(query),
  );
};

export const limitEventGroupOptions = (
  options: EventGroupOption[],
  selectedKeys: ReadonlySet<string>,
  limit = EVENT_GROUP_FILTER_OPTION_LIMIT,
): EventGroupOption[] => {
  if (options.length <= limit) return options;

  const selected: EventGroupOption[] = [];
  const unselected: EventGroupOption[] = [];
  for (const option of options) {
    (selectedKeys.has(option.group.key) ? selected : unselected).push(option);
  }
  return [...selected, ...unselected].slice(
    0,
    Math.max(limit, selected.length),
  );
};
