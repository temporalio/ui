<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import { useDarkMode } from '$lib/utilities/dark-mode';
  import { routeForNexusEndpointCreate } from '$lib/utilities/route-for';
  import andromeda from '$lib/vendor/andromeda.png';

  export let createDisabled = false;
</script>

<div class="flex min-h-screen flex-col gap-8 p-10">
  <div class="flex flex-col gap-4 lg:flex-row">
    <div>
      <div class="mb-8 flex items-center gap-4">
        <h1
          data-testid="namespace-selector-title"
          class="text-marketingGreen font-mono uppercase"
        >
          {translate('nexus.endpoints')}
        </h1>
      </div>
      <div class="flex w-full flex-col gap-4 pr-8 md:pr-24">
        <h2 class="text-4xl">Get Started</h2>

        <p>
          <Link href="https://docs.temporal.io/evaluate/nexus" newTab
            >Temporal Nexus</Link
          > allows you to reliably connect Temporal Applications. It promotes a more
          modular architecture for sharing a subset of your team's capabilities with
          well-defined microservice contracts for other teams to use. Nexus was designed
          with Durable Execution in mind and enables each team to have their own
          Namespace for improved modularity, security, debugging, and fault isolation.
        </p>
        <p>
          <Link href="https://docs.temporal.io/nexus/services" newTab
            >Nexus Services</Link
          > are exposed from a <Link
            href="https://docs.temporal.io/nexus/endpoints"
            newTab>Nexus Endpoint</Link
          > created in the <Link
            href="https://docs.temporal.io/nexus/registry"
            newTab>Nexus Registry</Link
          >. Adding a Nexus Endpoint to the Nexus Registry deploys the Endpoint,
          so it is available at runtime to serve Nexus requests.
        </p>
        <p>
          A Nexus Endpoint is a reverse proxy that decouples the caller from the
          handler and routes requests to upstream targets. It currently supports
          routing to a single target Namespace and Task Queue. Nexus Services
          and <Link href="https://docs.temporal.io/nexus/operations" newTab
            >Nexus Operations</Link
          > are often registered in the same Worker as the underlying Temporal primitives
          they abstract.
        </p>
        <slot />
        <Button
          disabled={createDisabled}
          variant="primary"
          href={routeForNexusEndpointCreate()}
          >{translate('nexus.create-endpoint')}</Button
        >
      </div>
    </div>
    <div class="bg-dark mx-auto mt-8 w-full" class:invert={!$useDarkMode}>
      <img src={andromeda} alt="Andromeda" />
    </div>
  </div>
</div>

<style>
  .invert {
    filter: invert(1);
  }
</style>
