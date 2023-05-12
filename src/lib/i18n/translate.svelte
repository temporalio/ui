<script lang="ts">
  import { page } from '$app/stores';
  import type { I18nKey } from './keys';

  export let key: I18nKey;
  export let namespace: string = 'common';
  export let count: number = null;
  export let replace: { [index: string]: string | number } = {};

  const { t } = $page.data.i18n();

  $: translated = t(`${namespace}:${key}`, {
    count,
    replace,
  });
</script>

{#if translated !== key}
  {translated}
{:else}
  <slot />
{/if}
