<script lang="ts" module>
  import type { Snippet } from 'svelte';

  import type { FormConfig } from '../types';

  export type FormProps = {
    config: FormConfig;
    children: Snippet;
  };
</script>

<script lang="ts">
  import { setFormContext } from './form-context';

  let { children, config }: FormProps = $props();

  const context = setFormContext({ config });
  const { enhance } = context.form;
</script>

<form use:enhance>
  {@render children()}
</form>
