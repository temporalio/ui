import type {
  PaletteContext,
  PaletteItem,
  PaletteTool,
  PaletteToolSet,
  PaletteVariant,
} from './types';

export interface PaletteEntry {
  section: string;
  variant: PaletteVariant;
  item: PaletteItem;
  // True for `page` tools, which go first under one section.
  page: boolean;
  // True for query items that show after the results.
  fallback: boolean;
}

export interface PaletteSection {
  title: string;
  variant: PaletteVariant;
  items: PaletteItem[];
}

const DEFAULT_ORDER = 100;

function byOrder<T extends { id: string; order?: number }>(a: T, b: T) {
  return (
    (a.order ?? DEFAULT_ORDER) - (b.order ?? DEFAULT_ORDER) ||
    a.id.localeCompare(b.id)
  );
}

export function sortTools(tools: readonly PaletteTool[]): PaletteTool[] {
  return [...tools].sort(byOrder);
}

export function sortToolSets(
  toolSets: readonly PaletteToolSet[],
): PaletteToolSet[] {
  return [...toolSets].sort(byOrder);
}

type ItemSource = (tool: PaletteTool) => PaletteItem[];

function entries(
  toolSets: readonly PaletteToolSet[],
  pageSection: string,
  source: ItemSource,
): PaletteEntry[] {
  const labelSections = toolSets.length > 1;

  const all = toolSets.flatMap((toolSet) =>
    sortTools(toolSet.tools).flatMap((tool) => {
      const page = tool.placement === 'page';
      const section = page
        ? pageSection
        : labelSections
          ? `${toolSet.label} · ${tool.section}`
          : tool.section;
      return source(tool).map((item) => ({
        section,
        variant: toolSet.variant ?? 'default',
        page,
        fallback: tool.fallback ?? false,
        item: {
          ...item,
          id: `${toolSet.id}:${tool.id}:${item.id}`,
          icon: item.icon ?? tool.icon,
        },
      }));
    }),
  );
  return [
    ...all.filter(({ page }) => page),
    ...all.filter(({ page }) => !page),
  ];
}

// Flattens every tool into one list, with `page` tools first under
// `pageSection`. Item ids only need to be unique within a tool, so they get
// the set and tool ids as a prefix. When more than one set is active, the set
// label goes in front of each other section title.
export function rootItems(
  toolSets: readonly PaletteToolSet[],
  ctx: PaletteContext,
  pageSection: string,
): PaletteEntry[] {
  return entries(toolSets, pageSection, (tool) => tool.items(ctx));
}

// Items that tools build from the query, with the same id prefix.
export function searchItems(
  toolSets: readonly PaletteToolSet[],
  query: string,
  ctx: PaletteContext,
  pageSection: string,
): PaletteEntry[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  return entries(
    toolSets,
    pageSection,
    (tool) => tool.search?.(trimmed, ctx) ?? [],
  );
}

// Groups consecutive entries that share a section, keeping the given order.
export function groupIntoSections(
  list: readonly PaletteEntry[],
): PaletteSection[] {
  const sections: PaletteSection[] = [];
  for (const { section, variant, item } of list) {
    const last = sections.at(-1);
    if (last && last.title === section && last.variant === variant) {
      last.items.push(item);
      continue;
    }
    sections.push({ title: section, variant, items: [item] });
  }
  return sections;
}

// The palette header shows the dev tag only when every set in it is a dev
// set. Otherwise only the dev sections and the views they open are tagged.
export function rootVariant(
  toolSets: readonly PaletteToolSet[],
): PaletteVariant {
  return toolSets.length > 0 &&
    toolSets.every(({ variant }) => variant === 'dev')
    ? 'dev'
    : 'default';
}
