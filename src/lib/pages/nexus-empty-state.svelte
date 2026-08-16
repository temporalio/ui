<script lang="ts">
  import type { Snippet } from 'svelte';

  import Link from '$lib/holocene/link.svelte';
  import { translate } from '$lib/i18n/translate';
  import andromeda from '$lib/vendor/andromeda.png';

  type Props = {
    actions?: Snippet;
  };

  let { actions }: Props = $props();
</script>

<div class="w-full py-4">
  <div
    class="surface-primary grid overflow-hidden rounded-panel border border-subtle lg:grid-cols-[minmax(0,1fr)_minmax(18rem,36%)]"
  >
    <div class="min-w-0 p-4 sm:p-5">
      <div class="mb-3 flex items-center gap-2">
        <h1
          data-testid="namespace-selector-title"
          class="font-mono uppercase tracking-[0.04em]"
        >
          {translate('nexus.endpoints')}
        </h1>
      </div>
      <div class="flex max-w-[72ch] flex-col gap-3">
        <h2>Get Started</h2>

        <p>
          <Link href="https://docs.temporal.io/evaluate/nexus" newTab
            >Temporal Nexus</Link
          > allows you to reliably connect Temporal Applications. It promotes a more
          modular architecture for sharing a subset of your team's capabilities with
          well-defined microservice contracts for other teams to use. Nexus was designed
          with Durable Execution in mind and enables each team to have their own Namespace
          for improved modularity, security, debugging, and fault isolation.
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
        {@render actions?.()}
      </div>
    </div>
    <div
      class="surface-secondary hidden items-center border-l border-subtle p-5 lg:flex"
      aria-hidden="true"
    >
      <img
        src={andromeda}
        alt=""
        class="w-full opacity-60 grayscale dark:invert"
      />
    </div>
  </div>
</div>
