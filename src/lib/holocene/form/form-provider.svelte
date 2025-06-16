<script lang="ts" module>
  import type { Snippet } from 'svelte';

  import type { BaseSPAFormConfig } from './form-context';

  export type FormProps = {
    config: BaseSPAFormConfig;
    children: Snippet;
  };
</script>

<script lang="ts">
  import { createFormContext } from './form-context';

  let { children, config }: FormProps = $props();

  const context = createFormContext({ config });
  const { enhance } = context.form;
</script>

<form use:enhance>
  {@render children()}
</form>
