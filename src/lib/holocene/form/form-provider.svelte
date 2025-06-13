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

  // Extract action and method for server mode
  const action = formParams.mode === 'server' ? formParams.action : undefined;
  const method =
    formParams.mode === 'server' ? formParams.method || 'POST' : undefined;
</script>

<form {action} {method} use:enhance>
  {@render children()}
</form>
