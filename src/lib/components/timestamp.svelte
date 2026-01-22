<script lang="ts">
  import type { SvelteHTMLElements } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  import { timestamp } from '$lib/runes/timestamp.svelte';
  import type { TimestampFormat } from '$lib/utilities/format-date';
  import type { ValidTime } from '$lib/utilities/format-time';

  type T = $$Generic<keyof SvelteHTMLElements>;
  type DateTime = ValidTime | null | undefined;

  export { timestampSnippet as timestamp };

  type Props = SvelteHTMLElements[T] & {
    dateTime: DateTime;
    as?: T;
    fallback?: string;
    leading?: Snippet<[]>;
    // only used to override the user's stored preference in certain cases
    overrideTimestampFormat?: TimestampFormat;
  };

  let {
    dateTime,
    as = undefined,
    class: className = undefined,
    fallback = undefined,
    overrideTimestampFormat = undefined,
    leading,
    ...rest
  }: Props = $props();
</script>

{#snippet timestampSnippet(dateTime: DateTime)}
  {$timestamp(
    dateTime,
    overrideTimestampFormat ? { format: overrideTimestampFormat } : undefined,
  )}
{/snippet}

{#if as}
  <svelte:element this={as} class={className} {...rest}>
    {#if leading}
      {@render leading()}
    {/if}
    {#if dateTime}
      {@render timestampSnippet(dateTime)}
    {:else if fallback}
      {fallback}
    {/if}
  </svelte:element>
{:else}
  {@render timestampSnippet(dateTime)}
{/if}
