<script lang="ts">
  import Badge from '$lib/holocene/badge.svelte';
  import Button from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { routeForNexusEndpointCreate } from '$lib/utilities/route-for';
  import andromeda from '$lib/vendor/andromeda.png';
</script>

<div class="surface-black flex min-h-screen flex-col gap-8 p-10">
  <div class="flex flex-col gap-4 lg:flex-row">
    <div>
      <div class="mb-8 flex items-center gap-4">
        <h1
          data-testid="namespace-selector-title"
          class="text-marketingGreen font-mono text-2xl uppercase"
        >
          {translate('nexus.endpoints')}
        </h1>
        <Badge type="information">Pre-Release</Badge>
      </div>
      <div class="flex w-full flex-col gap-4 pr-8 md:pr-24">
        <h2 class="text-4xl">Get Started</h2>
        <p class="text-indigo-200">
          Nexus RPC is a modern open-source service framework for
          arbitrary-length operations whose lifetime may extend beyond a
          traditional RPC. Nexus was designed with Durable Execution in mind, as
          an underpinning to connect durable executions within and across
          Namespaces, clusters, and regions – with a clean API contract to
          streamline multi-team collaboration.
        </p>
        <p class="text-indigo-200">
          Any service can be exposed via a Nexus Endpoint as a set of sync or
          async Nexus operations – the latter provides an operation identity and
          a uniform interface to get the status of an operation or its result,
          receive a completion callback, or cancel the operation.
        </p>
        <Button variant="primary" href={routeForNexusEndpointCreate()}
          >{translate('nexus.create-endpoint')}</Button
        >
      </div>
    </div>
    <div class="mx-auto mt-8 w-full">
      <img src={andromeda} alt="Andromeda" />
    </div>
  </div>
</div>
