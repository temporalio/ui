<script lang="ts" module>
  import type { FormProps } from '../types';
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
