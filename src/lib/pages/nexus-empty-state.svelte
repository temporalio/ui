<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForNexusEndpointCreate } from '$lib/utilities/route-for';
  import andromeda from '$lib/vendor/andromeda.png';
</script>

<div class="surface-inverse flex flex-col gap-8">
  <div class="flex items-center gap-4">
    <h1
      data-testid="namespace-selector-title"
      class="font-mono text-2xl uppercase text-marketingGreen"
    >
      {translate('nexus.endpoints')}
    </h1>
    <Badge type="information">Pre-Release</Badge>
  </div>
  <div class="flex w-full flex-col gap-4 xl:w-1/2">
    <h2 class="text-4xl">Get Started</h2>
    <img src={andromeda} alt="Andromeda" width="400" height="200" />
    <p>
      Nexus RPC is a modern open-source service framework for arbitrary-length
      operations whose lifetime may extend beyond a traditional RPC. Nexus was
      designed with Durable Execution in mind, as an underpinning to connect
      durable executions within and across Namespaces, clusters, and regions –
      with a clean API contract to streamline multi-team collaboration.
    </p>
    <p>
      Any service can be exposed via a Nexus Endpoint as a set of sync or async
      Nexus operations – the latter provides an operation identity and a uniform
      interface to get the status of an operation or its result, receive a
      completion callback, or cancel the operation.
    </p>
  </div>
  <Button variant="primary" href={routeForNexusEndpointCreate()}
    >{translate('nexus.create-endpoint')}</Button
  >
</div>
