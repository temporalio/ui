<script lang="ts">
  import type { Snippet } from 'svelte';

  import Card from '$lib/holocene/card.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    children: Snippet;
  }

  let { children }: Props = $props();
</script>

<Card class="w-full">
  <h2 class="text-2xl font-medium">
    {translate('schedules.execution-details-heading')}
  </h2>
  <div class="mt-4 flex flex-col gap-4">
    {@render children()}
  </div>
</Card>
