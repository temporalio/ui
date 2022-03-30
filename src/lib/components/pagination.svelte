<script lang="ts">
  import { page } from '$app/stores';
  import { pagination } from '$lib/stores/pagination';

  export let key = 'per-page';
  export let items: T[];

  $: perPage = $page.url.searchParams.get(key) || '100';
  $: store = pagination(items, perPage);
</script>

<div class="flex flex-col gap-4">
  <slot visibleItems={$store.items} />
</div>
