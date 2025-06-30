<script lang="ts">
  import type { Readable } from 'svelte/store';

  import Alert from '$lib/holocene/alert.svelte';

  interface Props {
    message: Readable<
      { intent: string; title: string; text: string } | undefined
    >;
    errors?: Readable<Record<string, string[] | undefined>>;
    errorTitle?: string;
  }

  let { message, errors, errorTitle = 'Validation Error' }: Props = $props();
</script>

<!-- Form-level validation errors -->
{#if errors && $errors}
  {#each Object.entries($errors) as [_field, fieldErrors]}
    {#if fieldErrors}
      <Alert intent="error" title={errorTitle}>
        {#each fieldErrors as error}
          <p>{error}</p>
        {/each}
      </Alert>
    {/if}
  {/each}
{/if}

<!-- Status message -->
{#if $message}
  <Alert intent={$message.intent} title={$message.title}>
    {$message.text}
  </Alert>
{/if}
