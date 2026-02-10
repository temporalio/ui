<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import Skeleton from '$lib/holocene/skeleton/index.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();
</script>

<div class="space-y-6 {className}">
  <Card class="space-y-3">
    <div
      class="text-gray-700 grid grid-cols-[1fr_140px_40px] gap-3 border-b border-subtle pb-2 text-sm font-medium"
    >
      <div>{translate('search-attributes.column-attribute')}</div>
      <div>{translate('search-attributes.column-type')}</div>
      <div></div>
    </div>

    <!-- Skeleton rows for loading state -->
    {#each Array.from({ length: 3 }) as _, index (index)}
      <div class="grid grid-cols-[1fr_140px_40px] items-start gap-3">
        <Skeleton class="h-10 w-full rounded" />
        <Skeleton class="h-10 w-full rounded" />
        <Skeleton class="h-10 w-10 rounded" />
      </div>
    {/each}

    <div class="border-t border-subtle pt-4">
      <Skeleton class="h-10 w-64 rounded" />
    </div>
  </Card>

  <div class="flex gap-3 pt-4">
    <Skeleton class="h-10 w-16 rounded" />
    <Skeleton class="h-10 w-16 rounded" />
  </div>
</div>
