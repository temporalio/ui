<script lang="ts" module>
  import type { Snippet } from 'svelte';

  import type { FormContextParams } from './form-context';

  export type FormProps = FormContextParams & {
    children: Snippet;
  };
</script>

<script lang="ts">
  import { createFormContext } from './form-context';

  let { children, ...formParams }: FormProps = $props();

  const context = createFormContext(formParams);
  const { enhance } = context.form;
</script>

<form use:enhance>
  {@render children()}
</form>
