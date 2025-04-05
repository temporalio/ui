<script lang="ts">
  import type { I18nKey, I18nReplace } from '.';
  import { translate } from './translate';

  interface $$Props {
    key: I18nKey;
    count?: number;
    replace?: I18nReplace;
  }

  export let key: I18nKey;
  export let count: number = undefined;
  export let replace: I18nReplace = undefined;

  $: translated = translate(key, { ...replace, count });
</script>

{#if translated !== key}
  {translated}
{:else}
  <slot />
{/if}
