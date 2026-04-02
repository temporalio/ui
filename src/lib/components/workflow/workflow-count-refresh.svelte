<script lang="ts">
  import { fly } from 'svelte/transition';

  import { twMerge as merge } from 'tailwind-merge';

  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { refresh } from '$lib/stores/workflows';

  interface Props {
    count: number;
  }

  let { count }: Props = $props();

  const duration = 300;
</script>

<Button
  size="xs"
  variant="ghost"
  leadingIcon="retry"
  on:click={() => ($refresh = Date.now())}
>
  {translate('common.refresh')}
  <span
    class={merge(
      'inline-grid overflow-hidden rounded-sm bg-slate-50 px-1 py-0.5 dark:bg-slate-600',
      !count && 'bg-transparent p-0',
    )}
  >
    {#key count}
      <span
        class="col-start-1 row-start-1"
        in:fly={{ y: 8, duration }}
        out:fly={{ y: -8, duration }}
      >
        {#if count > 0}
          +{count.toLocaleString()}
        {:else if count < 0}
          {count.toLocaleString()}
        {/if}
      </span>
    {/key}
  </span>
</Button>
