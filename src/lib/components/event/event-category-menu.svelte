<script lang="ts">
  import { page } from '$app/stores';
  import DropdownMenu from '$lib/components/dropdown-menu.svelte';
  import {
    allEventTypeOptions,
    compactEventTypeOptions,
  } from '$lib/models/event-history/get-event-categorization';

  export let compact: boolean = false;

  let category = $page?.params?.category ?? undefined;
  let options = compact ? compactEventTypeOptions : allEventTypeOptions;
</script>

<DropdownMenu parameter="category" value={category} {options} />
