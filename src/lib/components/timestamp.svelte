<script lang="ts" module>
  import { derived } from 'svelte/store';

  import {
    relativeTime,
    timeFormat,
    timestampFormat,
  } from '$lib/stores/time-format';
  import {
    formatDate,
    type TimestampFormat,
    type ValidTime,
  } from '$lib/utilities/format-date';

  type TimestampOptions = {
    format?: TimestampFormat | 'relative';
    relativeLabel?: string;
  };

  export const timestamp = derived(
    [timeFormat, relativeTime, timestampFormat],
    ([$timeFormat, $relativeTime, $timestampFormat]) => {
      return (
        date: ValidTime | undefined | null,
        options?: TimestampOptions,
      ): string => {
        const isRelativeOverride = options?.format === 'relative';

        const format = isRelativeOverride
          ? $timestampFormat
          : (options?.format ?? $timestampFormat);
        const relative = isRelativeOverride ? true : $relativeTime;
        const relativeLabel = options?.relativeLabel ?? undefined;

        return formatDate(date, $timeFormat, {
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
