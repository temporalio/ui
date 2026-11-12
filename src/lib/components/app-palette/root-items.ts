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

type ItemSource = (tool: PaletteTool, ctx: PaletteContext) => PaletteItem[];

// Builds the context a set's tools get, so a view a dev tool pushes keeps
// the dev styling.
export type ContextForVariant = (variant: PaletteVariant) => PaletteContext;

function sectionTitle(
  toolSet: PaletteToolSet,
  tool: PaletteTool,
  page: boolean,
  labelSections: boolean,
  pageSection: string,
): string {
  if (page) return pageSection;
  if (!labelSections) return tool.section;
  return `${toolSet.label} · ${tool.section}`;
}

function entries(
  toolSets: readonly PaletteToolSet[],
  contextFor: ContextForVariant,
  pageSection: string,
  source: ItemSource,
): PaletteEntry[] {
  const labelSections = toolSets.length > 1;

  const all = toolSets.flatMap((toolSet) => {
    const ctx = contextFor(toolSet.variant ?? 'default');
    return sortTools(toolSet.tools).flatMap((tool) => {
      const page = tool.placement === 'page';
      const section = sectionTitle(
        toolSet,
        tool,
        page,
        labelSections,
        pageSection,
      );
      return source(tool, ctx).map((item) => ({
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
    });
  });
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
  contextFor: ContextForVariant,
  pageSection: string,
): PaletteEntry[] {
  return entries(toolSets, contextFor, pageSection, (tool, ctx) =>
    tool.items(ctx),
  );
}

// Items that tools build from the query, with the same id prefix.
export function searchItems(
  toolSets: readonly PaletteToolSet[],
  query: string,
  contextFor: ContextForVariant,
  pageSection: string,
): PaletteEntry[] {
  const trimmed = query.trim();
  if (!trimmed) return [];
  return entries(
    toolSets,
    contextFor,
    pageSection,
    (tool, ctx) => tool.search?.(trimmed, ctx) ?? [],
  );
}

// Keeps the first item for each id, so rows and lookups by id stay unique
// even when a view or a tool repeats an id.
export function uniqueById<T extends { id: string }>(items: readonly T[]): T[] {
  const seen = new Set<string>();
  return items.filter(({ id }) => {
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });
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
