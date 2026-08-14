<script lang="ts">
  import StartNexusOperationForm from '$lib/components/standalone-nexus-operations/start-standalone-nexus-operation-form/form.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { nexusOperationsSearchParams } from '$lib/stores/nexus-operations';
  import { routeForStandaloneNexusOperations } from '$lib/utilities/route-for';

  interface Props {
    namespace: string;
  }

  let { namespace }: Props = $props();

  const nexusOperationsHref = $derived(
    `${routeForStandaloneNexusOperations({ namespace })}?${$nexusOperationsSearchParams}`,
  );
</script>

<div class="flex flex-col gap-4">
  <div class="flex items-center gap-2">
    <Link
      href={nexusOperationsHref}
      data-testid="back-to-nexus-operations"
      icon="chevron-left"
    >
      {translate('standalone-nexus-operations.back-to-nexus-operations')}
    </Link>
  </div>
  <h1>
    {translate('standalone-nexus-operations.start-standalone-nexus-operation')}
  </h1>
  <p class="text-secondary">
    {translate('standalone-nexus-operations.form-page-description')}
  </p>
  <p class="text-sm text-secondary">
    {translate('standalone-nexus-operations.form-page-allowlist-note', {
      namespace,
    })}
  </p>
  <StartNexusOperationForm {namespace} />
</div>
