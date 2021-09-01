<script lang="ts">
  import { goto } from '$app/navigation';

  import { getContext } from 'svelte';

  import type { DescribeNamespaceResponse } from '$types/temporal/api/workflowservice/v1/request_response';

  $: currentNamespace = getContext('namespace') as string;
  $: namespaces = (getContext('namespaces') as DescribeNamespaceResponse[]).map(
    (namespace) => namespace.namespaceInfo.name,
  );

  let showDropdown = false;
  let userSelectedNamespace = null;
  let idx = 0;
  function nextNamespace() {
    if (userSelectedNamespace)
      idx = namespaces.findIndex(userSelectedNamespace);
    idx++;
    if (idx > namespaces.length) {
      // wrap around
      idx = 0;
      userSelectedNamespace = namespaces[0];
    } else {
      userSelectedNamespace = namespaces[idx];
    }
  }
  function switchNamespace(newNamespace: string) {
    showDropdown = false;
    goto('/namespaces/' + newNamespace);
    // todo: this somehow doesnt update the getContext('namespace') correctly
  }
</script>

<div class="inline-flex space-x-2 items-center">
  <!-- svelte-ignore a11y-label-has-associated-control -->
  <label id="listbox-label" class="block text-sm font-medium text-gray-700">
    Namespace
  </label>
  <div class="mt-1 relative">
    <button
      type="button"
      class="bg-white relative w-full border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      aria-haspopup="listbox"
      aria-expanded="true"
      aria-labelledby="listbox-label"
      on:click={() => (showDropdown = !showDropdown)}
    >
      <span class="block truncate"> {currentNamespace} </span>
      <span
        class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
      >
        <svg
          class="h-5 w-5 text-gray-400"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clip-rule="evenodd"
          />
        </svg>
      </span>
    </button>

    {#if showDropdown}
      <!-- svelte-ignore a11y-autofocus-->
      <ul
        on:keyup={nextNamespace}
        autofocus
        class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
        tabindex="-1"
        role="listbox"
        aria-labelledby="listbox-label"
        aria-activedescendant="listbox-option-3"
      >
        <!--
        Select option, manage highlight styles based on mouseenter/mouseleave and keyboard navigation.

        Highlighted: "text-white bg-indigo-600", Not Highlighted: "text-gray-900"
      -->
        {#each namespaces as namespace}
          <li
            on:mouseenter={() => (userSelectedNamespace = namespace)}
            on:mouseleave={() => (userSelectedNamespace = null)}
            on:click={() => switchNamespace(namespace)}
            class:selectedItem={userSelectedNamespace === namespace}
            class="text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9"
            id="listbox-option-0"
            role="option"
          >
            <span
              class:font-semibold={currentNamespace === namespace}
              class="font-normal block truncate"
            >
              {namespace}
            </span>
            <span
              class:text-indigo-600={currentNamespace === namespace}
              class="text-white absolute inset-y-0 right-0 flex items-center pr-4"
            >
              <!-- Heroicon name: solid/check -->
              <svg
                class="h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fill-rule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </span>
          </li>
        {/each}
      </ul>
    {/if}
  </div>
</div>

<style lang="postcss">
  .selectedItem {
    @apply text-white bg-indigo-600;
  }
</style>
