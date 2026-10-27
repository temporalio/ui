import type {
  PaletteContext,
  PaletteEnv,
  PaletteFacts,
  PaletteRules,
  PaletteToolSet,
} from './types';

// `local` is the Vite dev server. Every other non-production build is `staging`.
export function paletteEnv(isDevServer: boolean, isProd: boolean): PaletteEnv {
  if (isDevServer) return 'local';
  return isProd ? 'production' : 'staging';
}

// An empty rule list allows everything. Every rule that is set must match.
// A user rule never matches before the user loads.
export function matchesRules(
  rules: PaletteRules | undefined,
  facts: PaletteFacts,
): boolean {
  if (!rules) return true;
  const { env, flags, permissions } = rules;
  if (env && !env.includes(facts.env)) return false;
  if (flags && !flags.every((flag) => facts.flags?.has(flag))) return false;
  if (permissions && !permissions.every((perm) => facts.can?.(perm))) {
    return false;
  }
  return true;
}

// Keeps the sets, tools and items whose rules match the facts. A set with
// no matching tools is dropped. Item rules are applied each time a tool lists
// its items, so items can still change with the page.
export function visibleToolSets(
  toolSets: readonly PaletteToolSet[],
  facts: PaletteFacts,
): PaletteToolSet[] {
  const allowed = <T extends { rules?: PaletteRules }>(entry: T) =>
    matchesRules(entry.rules, facts);

  return toolSets.flatMap((toolSet) => {
    if (!allowed(toolSet)) return [];
    const tools = toolSet.tools
      .filter(allowed)
      .map(({ items, search, ...tool }) => ({
        ...tool,
        items: (ctx: PaletteContext) => items(ctx).filter(allowed),
        search: search
          ? (query: string, ctx: PaletteContext) =>
              search(query, ctx).filter(allowed)
          : undefined,
      }));
    return tools.length > 0 ? [{ ...toolSet, tools }] : [];
  });
}
