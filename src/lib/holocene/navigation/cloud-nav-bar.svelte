<script lang="ts">
  import type { Snippet } from 'svelte';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    version: string;
    navOpen: boolean;
    subtitle?: string;
    children?: Snippet;
    bottom?: Snippet;
    ontoggle: () => void;
  }

  let { version, navOpen, subtitle, children, bottom, ontoggle }: Props =
    $props();
</script>

<div
  class="flex-col items-center justify-between pb-4 group-data-[nav=closed]:flex-col group-data-[nav=closed]:gap-2"
>
  <div role="list">
    <div class="align-center flex items-center justify-between pb-4">
      {#if subtitle}
        <div
          class="text-xs font-medium text-indigo-100 group-data-[nav=closed]:hidden"
        >
          {subtitle}
        </div>
      {/if}

      <button
        title={navOpen ? 'Collapse Navigation' : 'Expand Navigation'}
        class="flex items-center justify-center"
        onclick={ontoggle}
      >
        <Icon name="collapse" class="h-6 w-6" />
      </button>
    </div>
    {#if children}
      {@render children()}
    {/if}
  </div>

  <div class="self-end">
    {#if bottom}
      {@render bottom()}
    {/if}
    <div
      class="self-center justify-self-center py-3 text-center text-[0.6rem] text-slate-300"
    >
      <span class="sr-only">{translate('common.version')}</span>
      {version}
    </div>
  </div>
</div>
