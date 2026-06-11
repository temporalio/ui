<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';

  interface Props {
    show: boolean;
    count: number;
    class?: string;
  }

  let { show, count, class: className = '' }: Props = $props();
</script>

{#if show && count > 0}
  <Badge
    class="absolute right-0 top-0 origin-bottom-left translate-x-[10px] translate-y-[-10px] {className}"
    type="count"
  >
    {count}
  </Badge>
{/if}
