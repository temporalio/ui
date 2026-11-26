<script lang="ts">
  import { createCountAnnouncer } from '$lib/utilities/count-announcer';

  let {
    count,
    getMessage,
  }: {
    count: number;
    getMessage: (newItems: number) => string;
  } = $props();

  let announcement = $state('');
  const announcer = createCountAnnouncer({
    onAnnounce: (message) => (announcement = message),
    getMessage: (newItems) => getMessage(newItems),
  });

  $effect(() => {
    announcer.update(count);
  });
  $effect(() => () => announcer.dispose());
</script>

<span class="sr-only" role="status" aria-live="polite" aria-atomic="true"
  >{announcement}</span
>
