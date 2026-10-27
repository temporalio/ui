<script lang="ts" module>
  import type { Snippet } from 'svelte';

  import type { FieldMessageIds } from './messages';

  export interface FieldMessagesProps {
    ids: Pick<FieldMessageIds, 'helperTextId' | 'errorTextId'>;
    helperText?: string;
    error?: string;
    showError?: boolean;
    helperClass?: string;
    errorClass?: string;
    errorContent?: Snippet;
  }
</script>

<script lang="ts">
  import { fieldErrorTextRecipe, fieldHelperTextRecipe } from './recipe';

  let {
    ids,
    helperText = '',
    error = '',
    showError = false,
    helperClass = fieldHelperTextRecipe(),
    errorClass = fieldErrorTextRecipe(),
    errorContent,
  }: FieldMessagesProps = $props();
</script>

{#if helperText}
  <p id={ids.helperTextId} class={helperClass}>{helperText}</p>
{/if}
{#if showError}
  {#if errorContent}
    <div id={ids.errorTextId} class={errorClass} aria-live="polite">
      {@render errorContent()}
    </div>
  {:else}
    <p id={ids.errorTextId} class={errorClass} aria-live="polite">{error}</p>
  {/if}
{/if}
