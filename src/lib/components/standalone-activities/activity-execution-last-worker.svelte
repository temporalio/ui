<script lang="ts">
  import Card from '$lib/holocene/card.svelte';

  interface Props {
    identity: string;
  }

  let { identity }: Props = $props();
</script>

<Card class="flex flex-col gap-1 py-5">
  <h5 class="text-xs font-semibold uppercase tracking-wide">Last Worker</h5>
  <p class="text-sm text-secondary">
    {identity}
  </p>
</Card>
