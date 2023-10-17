<script lang="ts">
  import Textarea from '$lib/holocene/textarea.svelte';
  import ToggleSwitch from '$lib/holocene/toggle-switch.svelte';
  import { translate } from '$lib/i18n/translate';

  export let endpoint = '';
  export let passToken = false;
  export let includeCreds = false;
  export let error = '';
</script>

<div class="flex flex-col gap-4">
  <div class="flex flex-col gap-2">
    <Textarea
      id="data-encoder-endpoint-input"
      rows={3}
      placeholder={translate('data-encoder.endpoint-placeholder')}
      bind:value={endpoint}
      {error}
      isValid={!error}
      label={translate('data-encoder.endpoint-title')}
      description={translate('data-encoder.endpoint-description')}
    />
    <ToggleSwitch
      label={translate('data-encoder.pass-access-token-label')}
      id="pass-access-token"
      bind:checked={passToken}
      data-testid="data-encoder-pass-access-token"
    />
    <ToggleSwitch
      label={translate('data-encoder.include-cross-origin-credentials-label')}
      id="pass-access-credentials"
      bind:checked={includeCreds}
      data-testid="data-encoder-include-credentials"
    />
    {#if includeCreds}
      <small data-testid="data-encoder-cross-origin-credentials"
        >{translate(
          'data-encoder.include-cross-origin-credentials-warning',
        )}</small
      >
    {/if}
  </div>
</div>
