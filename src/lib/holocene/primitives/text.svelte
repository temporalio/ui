<script lang="ts">
  import type { I18nKey, I18nNamespace, I18nReplace } from '$lib/i18n';
  import { translate } from '$lib/i18n/translate';

  type Namespace = $$Generic<I18nNamespace>;

  type $$Props = {
    namespace: Namespace;
    key: I18nKey<Namespace>;
    replace?: I18nReplace;
    count?: number;
  };

  export let namespace: Namespace = 'common' as Namespace;
  export let key: I18nKey<Namespace>;
  export let replace: I18nReplace = undefined;
  export let count: number = undefined;
</script>

{translate(namespace, key, count, replace)}
