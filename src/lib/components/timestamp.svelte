<script lang="ts" module>
  import { derived } from 'svelte/store';

  import {
    relativeTime,
    timeFormat,
    timestampFormat,
  } from '$lib/stores/time-format';
  import {
    formatDate,
    type FormatDateOptions,
    type ValidTime,
  } from '$lib/utilities/format-date';

  export const timestamp = derived(
    [timeFormat, relativeTime, timestampFormat],
    ([$timeFormat, $relativeTime, $timestampFormat]) => {
      return (
        date: ValidTime | undefined | null,
        options: FormatDateOptions = {},
      ): string => {
        const format = options?.format ?? $timestampFormat;
        const relative = options?.relative ?? $relativeTime;
        const relativeLabel = options?.relativeLabel;

        return formatDate(date, $timeFormat, {
          ...options,
          relative,
          format,
          relativeLabel,
        });
      };
    },
  );
</script>

<script lang="ts">
  import type { SvelteHTMLElements } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  type T = $$Generic<keyof SvelteHTMLElements>;

  export { timestampSnippet as timestamp };

  type Props = SvelteHTMLElements[T] & {
    dateTime: ValidTime | null | undefined;
    as?: T;
    fallback?: string;
    leading?: Snippet<[]>;
    options?: FormatDateOptions; // overrides the user's stored preference
  };

  let {
    dateTime,
    as = undefined,
    class: className = undefined,
    fallback = undefined,
    options = undefined,
    leading,
    ...rest
  }: Props = $props();
</script>

{#snippet timestampSnippet(dateTime: ValidTime | null | undefined)}
  {$timestamp(dateTime, options)}
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
