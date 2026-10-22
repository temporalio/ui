<script lang="ts">
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
  }

  let { facts, recentKey, label }: Props = $props();

  $effect.pre(function publishFacts() {
    appPalette.facts = facts;
    return () => {
      appPalette.facts = undefined;
    };
  });

  const toolSets = $derived(
    sortToolSets(visibleToolSets(registeredToolSets(), facts)),
  );
</script>

{#if toolSets.length > 0}
  <Palette {toolSets} {recentKey} {label} bind:open={appPalette.open} />
{/if}
