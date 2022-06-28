<script lang="ts">
  import type { DescribeNamespaceResponse as Namespace } from '$types';
  import { routeForNamespace } from '$lib/utilities/route-for';
  import { page } from '$app/stores';

  const { showTemporalSystemNamespace } = $page.stuff.settings;
  const namespaces = ($page.stuff.namespaces || []).filter(
    (namespace: Namespace) =>
      showTemporalSystemNamespace ||
      namespace.namespaceInfo.name !== 'temporal-system',
  );

  console.log(namespaces);
</script>

<h2 class="mb-8 text-2xl">Namespaces</h2>
{#if namespaces?.length > 0}
  <table class="fancy w-full ">
    <thead class="">
      <tr>
        <th>Name</th>
      </tr>
    </thead>
    <tbody class="">
      {#each namespaces as namespace}
        <tr class="">
          <td>
            <a
              href={routeForNamespace({
                namespace: namespace.namespaceInfo.name,
              })}
              class="hover:text-blue-700 hover:underline hover:decoration-blue-700 md:text-base"
              >{namespace.namespaceInfo.name}</a
            >
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
{:else}
  <div class="prose mt-[15vh] max-w-none text-center">
    <h3>No Namespaces Found</h3>
    <p>
      You do not have access to a Namespace.
      <br />
      Contact your Administrator for assistance.
    </p>
  </div>
{/if}
