<script lang="ts">
  import type { SvelteHTMLElements } from 'svelte/elements';

  import type { Snippet } from 'svelte';

  import {
    relativeTime,
    timeFormat,
    timestampFormat,
  } from '$lib/stores/time-format';
  import {
    formatDate,
    type FormatDateOptions,
  } from '$lib/utilities/format-date';
  import type { ValidTime } from '$lib/utilities/format-time';

  type T = $$Generic<keyof SvelteHTMLElements>;
  type DateTime = ValidTime | null | undefined;
  type Options = Omit<FormatDateOptions, 'relative'>;

  export { timestamp };

  type Props = SvelteHTMLElements[T] & {
    dateTime: DateTime;
    options?: Options;
    as?: T;
    fallback?: string;
    leading?: Snippet<[]>;
  };

  let {
    dateTime,
    options = {},
    as = undefined,
    class: className = undefined,
    fallback = undefined,
    leading,
    ...rest
  }: Props = $props();
</script>

{#snippet timestamp(dateTime: DateTime, options: Options)}
  {formatDate(dateTime, $timeFormat, $timestampFormat, {
    relative: $relativeTime,
    ...options,
  })}
{/snippet}

{#if as}
  <svelte:element this={as} class={className} {...rest}>
    {#if leading}
      {@render leading()}&nbsp;
    {/if}
    {#if dateTime}
      {@render timestamp(dateTime, options)}
    {:else if fallback}
      {fallback}
    {/if}
  </svelte:element>
{:else}
  {@render timestamp(dateTime, options)}
{/if}
