<script lang="ts">
  import type { IterableEvent } from '$lib/types/events';
  import { spaceBetweenCapitalLetters } from '$lib/utilities/format-camel-case';

  export let event: IterableEvent;
</script>

<div class="flex items-center items-center gap-6 px-4 py-2 text-white">
  <p>{event.id}</p>
  <p>{spaceBetweenCapitalLetters(event.name)}</p>
</div>
