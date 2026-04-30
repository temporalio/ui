<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';
  import Link from '$lib/holocene/link.svelte';
  import type { CommonError } from '$lib/types/common-errors';

  interface Props {
    error: CommonError;
    class?: string;
    'data-testid'?: string;
  }

  let { error, class: className = '', ...rest }: Props = $props();
</script>

<Alert intent={error.severity} title={error.title} class={className} {...rest}>
  <p>{error.description}</p>
  <Link href={error.link} newTab>{error.action} →</Link>
</Alert>
