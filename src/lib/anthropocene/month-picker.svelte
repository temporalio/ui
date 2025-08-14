<script lang="ts">
  import Button from '$lib/anthropocene/button.svelte';
  import { monthNames } from '$lib/utilities/calendar';

  interface Props {
    months: string[];
  }

  let { months = $bindable() }: Props = $props();

  const onClick = (e: MouseEvent, month: string) => {
    if (e.metaKey && month !== '*') {
      if (months.includes('*')) {
        months = months.filter((m) => m !== '*');
      }
      if (months.includes(month)) {
        months = months.filter((m) => m !== month);
      } else {
        months = [...months, month];
      }
    } else {
      months = [month];
    }
  };
</script>

<div class="flex flex-wrap gap-4 text-center">
  {#each monthNames as { label, value }}
    {@const active = months.includes(value)}
    <Button
      variant="secondary"
      class={active && 'bg-interactive-secondary-active'}
      onclick={(e) => onClick(e, value)}
    >
      {label}
    </Button>
  {/each}
</div>
