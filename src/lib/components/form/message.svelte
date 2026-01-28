<script lang="ts">
  import Alert from '$lib/holocene/alert.svelte';

  type Intent =
    | 'warning'
    | 'error'
    | 'success'
    | 'info'
    | 'nexus'
    | 'transcoder-error';

  interface Props {
    value?: { intent: Intent; title: string; text: string };
    errors?: string[];
    errorsTitle?: string;
  }

  let { value, errors, errorsTitle = 'Validation Error' }: Props = $props();
</script>

<!-- Form-level validation errors -->
{#if errors && errors.length > 0}
  <Alert intent="error" title={errorsTitle}>
    {#each errors as error, index (index)}
      <p>{error}</p>
    {/each}
  </Alert>
{/if}

<!-- Status message -->
{#if value}
  <Alert intent={value.intent} title={value.title}>
    {value.text}
  </Alert>
{/if}
