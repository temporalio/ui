<script lang="ts">
  import type { I18nNamespace, I18nKey, I18nReplace } from '.';
  import { translate } from './translate';

  /**
   * once Svelte supports generic type constraints, we can make `namespace` an optional prop.
   * and ensure that keys are still stongly typed to the corresponding namespace.
   * https://github.com/sveltejs/language-tools/issues/442#issuecomment-1556031397
   * https://github.com/sveltejs/language-tools/pull/2020
   */
  type Namespace = $$Generic<I18nNamespace>;

  interface $$Props {
    key: I18nKey<Namespace>;
    namespace: Namespace;
    count?: number;
    replace?: I18nReplace;
  }

  export let key: I18nKey<Namespace>;
  export let namespace: Namespace;
  export let count: number = undefined;
  export let replace: I18nReplace = undefined;

  $: translated = translate(namespace, key, count, replace);
</script>

{#if translated !== key}
  {translated}
{:else}
  <slot />
{/if}
