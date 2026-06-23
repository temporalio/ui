<script lang="ts">
  import CapabilityGuard from '$lib/components/capability-guard.svelte';
  import Alert from '$lib/holocene/alert.svelte';
  import Button from '$lib/holocene/button.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    createHref: string;
    error?: string;
  }

  let { createHref, error = '' }: Props = $props();
</script>

<div class="flex flex-col items-center gap-4 py-16">
  <Icon name="workers" class="h-20 w-20 text-blue-200" />
  <div class="flex flex-col items-center gap-2">
    <p class="text-base font-medium">
      {translate('deployments.empty-state-title')}
    </p>
    <p class="max-w-[500px] text-center text-sm text-secondary">
      {translate('deployments.empty-state-description')}
    </p>
  </div>
  <div class="flex flex-wrap items-center justify-center gap-4">
    <CapabilityGuard capability="serverScaledDeployments">
      <Button variant="secondary" href={createHref}>
        {translate('deployments.create-serverless-deployment')}
      </Button>
    </CapabilityGuard>
    <Button
      variant="ghost"
      href="https://docs.temporal.io/worker-deployments"
      target="_blank"
      trailingIcon="external-link"
    >
      {translate('deployments.self-managed-deployment')}
    </Button>
  </div>
  {#if error}
    <Alert intent="warning" icon="warning" class="max-w-lg">
      {error}
    </Alert>
  {/if}
</div>
