<script lang="ts">
  import { DEFAULT_SHORTCUT, type PaletteShortcut } from './keys';
  import { sortToolSets } from './root-items';
  import { visibleToolSets } from './rules';
  import type { PaletteFacts } from './types';

  import { appPalette } from './app-palette-state.svelte';
  import Palette from './palette.svelte';
  import { registeredToolSets } from './registry.svelte';

  interface Props {
    facts: PaletteFacts;
    recentKey?: string;
    label?: string;
    // The app's shortcut, Cmd+K by default. Each user can replace it or turn
    // it off with the palette shortcut tool.
    shortcut?: PaletteShortcut;
  }

  let {
    facts,
    recentKey,
    label,
    shortcut = DEFAULT_SHORTCUT,
  }: Props = $props();

  $effect.pre(function publishFacts() {
    appPalette.facts = facts;
    return () => {
      appPalette.facts = undefined;
    };
  });

  $effect.pre(function publishShortcut() {
    appPalette.appShortcut = shortcut;
    return () => {
      appPalette.appShortcut = DEFAULT_SHORTCUT;
    };
  });

  const toolSets = $derived(
    sortToolSets(visibleToolSets(registeredToolSets(), facts)),
  );

  // With nothing to show, a request to open is dropped, so the palette does
  // not open by itself once a set shows up later.
  $effect.pre(function dropOpenWithoutTools() {
    if (toolSets.length > 0 || !appPalette.open) return;
    appPalette.open = false;
  });
</script>

{#if toolSets.length > 0}
  <Palette
    {toolSets}
    {facts}
    {recentKey}
    {label}
    shortcut={appPalette.shortcut}
    bind:open={appPalette.open}
  />
{/if}
