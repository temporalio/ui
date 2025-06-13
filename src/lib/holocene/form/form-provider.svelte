<script lang="ts" module>
  import type { Snippet } from 'svelte';

  import type { FormContextParams } from './form-context';

  export type FormProps = FormContextParams & {
    children: Snippet;
  };
</script>

<script lang="ts">
  import { createFormContext } from './form-context';

  let {
    formKey,
    mode = 'spa',
    action,
    method = 'POST',
    onUpdate,
    onServerSuccess,
    onServerError,
    defaultValues,
    schema,
    enableClientValidation = true,
    children,
  }: FormProps = $props();

  createFormContext({
    formKey,
    mode,
    action,
    method,
    onUpdate,
    onServerSuccess,
    onServerError,
    defaultValues,
    schema,
    enableClientValidation,
  });

  function handleSubmit(event: Event) {
    event.preventDefault();

    if (mode === 'spa' && onUpdate) {
      // Get form data
      const form = event.target as HTMLFormElement;
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());

      // Call the onUpdate handler
      onUpdate(data);
    }
  }
</script>

<form
  action={mode === 'server' || mode === 'progressive' ? action : undefined}
  method={mode === 'server' || mode === 'progressive' ? method : undefined}
  onsubmit={handleSubmit}
>
  {@render children()}
</form>
