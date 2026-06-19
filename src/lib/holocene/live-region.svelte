<script lang="ts">
  import type { Announcement } from '$lib/stores/announcer';

  interface Props {
    messages: Announcement[];
    'data-testid'?: string;
  }

  let { messages, ...rest }: Props = $props();

  const polite = $derived(
    messages.filter((message) => message.politeness === 'polite'),
  );
  const assertive = $derived(
    messages.filter((message) => message.politeness === 'assertive'),
  );
</script>

<div class="sr-only" aria-live="polite" aria-relevant="additions" {...rest}>
  {#each polite as { id, message } (id)}
    <div>{message}</div>
  {/each}
</div>
<div class="sr-only" aria-live="assertive" aria-relevant="additions">
  {#each assertive as { id, message } (id)}
    <div>{message}</div>
  {/each}
</div>
