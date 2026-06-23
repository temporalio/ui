<script lang="ts">
  import type { Announcement, Politeness } from '$lib/stores/announcer';

  interface Props {
    messages: Announcement[];
    politeness?: Politeness | 'both';
    'data-testid'?: string;
  }

  let {
    messages,
    politeness = 'both',
    'data-testid': testid,
  }: Props = $props();

  const showPolite = $derived(politeness !== 'assertive');
  const showAssertive = $derived(politeness !== 'polite');

  const polite = $derived(
    messages.filter((message) => message.politeness === 'polite'),
  );
  const assertive = $derived(
    messages.filter((message) => message.politeness === 'assertive'),
  );
</script>

{#if showPolite}
  <div
    class="sr-only"
    aria-live="polite"
    aria-relevant="additions"
    data-testid={testid ? `${testid}-polite` : undefined}
  >
    {#each polite as { id, message } (id)}
      <div>{message}</div>
    {/each}
  </div>
{/if}
{#if showAssertive}
  <div
    class="sr-only"
    aria-live="assertive"
    aria-relevant="additions"
    data-testid={testid ? `${testid}-assertive` : undefined}
  >
    {#each assertive as { id, message } (id)}
      <div>{message}</div>
    {/each}
  </div>
{/if}
