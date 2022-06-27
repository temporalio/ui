<script lang="ts" context="module">
  import type { Load } from '@sveltejs/kit';

  export const load: Load = async ({ stuff }) => {
    const { namespaces } = stuff.namespaces;

    return {
      props: {
        namespaces,
      },
    };
  };
</script>

<script lang="ts">
  import type { ListNamespacesResponse } from '$types';

  export let namespaces: [];
  debugger;
</script>

<div class="p-2">
  <div class="prose mb-10 max-w-none">
    <h1>Namespaces</h1>
  </div>

  {#if namespaces?.length > 0}
    <table class="fancy w-full ">
      <thead class="">
        <tr>
          <!-- <th>Status</th> -->
          <th>Name</th>
          <!-- <th>Region</th>
						<th>Retention</th> -->
        </tr>
      </thead>
      <tbody class="">
        {#each namespaces as namespace}
          <tr class="">
            <!-- <td><span class="status available">Available</span></td> -->
            <td>
              <a
                href={AppRoutes.namespace({ namespace })}
                class="hover:underline">{namespace}</a
              >
            </td>
            <!-- <td>temp-1</td>
							<td>3 Days</td> -->
          </tr>
        {/each}
      </tbody>
    </table>
  {:else}
    <div class="prose max-w-none text-center mt-[15vh]">
      <h3>No Namespaces Found</h3>
      <p>
        You do not have access to a Namespace.
        <br />
        Contact your Administrator for assistance.
      </p>
    </div>
  {/if}
</div>
