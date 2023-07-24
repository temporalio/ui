<script lang="ts">
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';

  export let endpoint = '';
  export let passToken = false;
  export let includeCreds = false;
  export let error = '';
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-2">
    <h3 class="text-sm font-medium" data-testid="data-encoder-endpoint-title">
      {translate('data-encoder', 'endpoint-title')}
    </h3>
    <p class="text-sm">
      {translate('data-encoder', 'endpoint-description')}
    </p>
    <textarea
      class="block w-full rounded-xl border-2 border-gray-900 p-2"
      class:error
      rows={3}
      placeholder={translate('data-encoder', 'endpoint-placeholder')}
      data-testid="data-encoder-endpoint-input"
      bind:value={endpoint}
      on:keydown|stopPropagation
    />
    {#if error}
      <small data-testid="data-encoder-endpoint-error" class="text-red-700"
        >{error}</small
      >
    {/if}
    <label
      for="pass-access-token"
      class="flex items-center gap-4 font-secondary text-sm"
      ><ToggleSwitch
        id="pass-access-token"
        bind:checked={passToken}
        data-testid="data-encoder-pass-access-token"
      />{translate('data-encoder', 'pass-access-token-label')}
    </label>
    <label
      for="pass-access-credentials"
      class="flex items-center gap-4 font-secondary text-sm"
      ><ToggleSwitch
        id="pass-access-credentials"
        bind:checked={includeCreds}
        data-testid="data-encoder-include-credentials"
      />{translate('data-encoder', 'include-cross-origin-credentials-label')}
    </label>
    {#if includeCreds}
      <small data-testid="data-encoder-cross-origin-credentials"
        >{translate(
          'data-encoder',
          'include-cross-origin-credentials-warning',
        )}</small
      >
    {/if}
  </div>
</div>

<style lang="postcss">
  .error {
    @apply outline-red-700;
  }
</style>
