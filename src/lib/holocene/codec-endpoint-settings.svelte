<script lang="ts">
  import ToggleSwitch from './toggle-switch.svelte';

  export let endpoint = '';
  export let passToken = false;
  export let includeCreds = false;
  export let error = '';
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-2">
    <h3 class="text-sm font-medium" data-testid="data-encoder-endpoint-title">
      Local Remote Codec Endpoint Override
    </h3>
    <p class="text-sm">
      Enter a local remote codec endpoint to override any configured at the
      Namespace-level. This will be stored in your local browser and will only
      be accessible by you.
    </p>
    <textarea
      class="block w-full rounded-xl border-2 border-gray-900 p-2"
      rows={3}
      placeholder="Paste your endpoint here"
      data-testid="data-encoder-endpoint-input"
      class:error
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
      />Pass the user access token with your endpoint.
    </label>
    <label
      for="pass-access-credentials"
      class="flex items-center gap-4 font-secondary text-sm"
      ><ToggleSwitch
        id="pass-access-credentials"
        bind:checked={includeCreds}
        data-testid="data-encoder-include-credentials"
      />Include cross-origin credentials.
    </label>
    {#if includeCreds}
      <small data-testid="data-encoder-cross-origin-credentials"
        >Warning: Pre-flight checks will be done and could result in failure to
        decode if incorrectly configured.</small
      >
    {/if}
  </div>
</div>

<style lang="postcss">
  .error {
    @apply outline-red-700;
  }
</style>
