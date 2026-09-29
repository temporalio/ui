<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { ThemeOverride } from './dark-mode';
  import { darkMode } from './dark-mode';

  let {
    children,
    overrideTheme,
  }: { children?: Snippet; overrideTheme?: ThemeOverride } = $props();
</script>

<svelte:body use:darkMode={overrideTheme} />
{@render children?.()}
