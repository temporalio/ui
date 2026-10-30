<script lang="ts">
  import ResourceEmptyState from '$lib/components/empty-states/resource-empty-state.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconExternalLinkOptical, IconTemporalWorker } from '$lib/io/icon';

  interface Props {
    createHref: string;
    error?: string;
    canCreateServerlessDeployment?: boolean;
  }

  let {
    createHref,
    error = '',
    canCreateServerlessDeployment = true,
  }: Props = $props();
</script>

<ResourceEmptyState
  title={translate('deployments.empty-state-title')}
  content={translate('deployments.empty-state-description')}
  Icon={IconTemporalWorker}
  {error}
  testId="deployments-empty-state"
  placeholder
>
  {#snippet actions()}
    {#if canCreateServerlessDeployment}
      <Button variant="secondary" href={createHref}>
        {translate('deployments.create-serverless-deployment')}
      </Button>
    {/if}
    <Button
      variant="ghost"
      href="https://docs.temporal.io/worker-deployments"
      target="_blank"
      TrailingIcon={IconExternalLinkOptical}
    >
      {translate('deployments.self-managed-deployment')}
    </Button>
  {/snippet}
</ResourceEmptyState>
