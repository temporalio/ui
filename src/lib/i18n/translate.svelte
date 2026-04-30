<script lang="ts">
  import type { Snippet } from 'svelte';

  import type { I18nKey, I18nReplace } from '.';
  import { translate } from './translate';

  interface Props {
    key: I18nKey;
    count?: number;
    replace?: I18nReplace;
    children?: Snippet;
  }

  let {
    key,
    count = undefined,
    replace = undefined,
    children,
  }: Props = $props();

  let translated = $derived(translate(key, { ...replace, count }));
</script>

{#if translated !== key}
  {translated}
{:else}
  {@render children?.()}
{/if}
