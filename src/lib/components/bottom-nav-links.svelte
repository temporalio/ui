<script lang="ts">
  import NavSection from '$lib/holocene/navigation/nav-section.svelte';
  import type { NavLinkItem } from '$lib/types/global';

  interface Props {
    open?: boolean;
    sections: NavLinkItem[][];
  }

  let { open = false, sections }: Props = $props();

  const isNotLastSection = (i: number): boolean => i !== sections.length - 1;
</script>

{#if open}
  <div
    class="flex h-full flex-col-reverse justify-start gap-6 overflow-auto px-4 py-8"
  >
    {#each sections as section, i (i)}
      <NavSection navItems={section} />
      {#if isNotLastSection(i)}
        <hr class="border-subtle" />
      {/if}
    {/each}
  </div>
{/if}
