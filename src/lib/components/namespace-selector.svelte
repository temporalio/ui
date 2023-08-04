<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { namespaceSelectorOpen } from '$lib/stores/nav-open';
  import { viewFeature } from '$lib/stores/new-feature-tags';

  function toggleNamespaceSelector() {
    $namespaceSelectorOpen = !$namespaceSelectorOpen;
    viewFeature('namespaceSelector');
  }
</script>

<Tooltip text="Select a Namespace">
  <button
    class="relative"
    on:click={toggleNamespaceSelector}
    aria-label="Namespace Select"
    data-testid="namespace-select-button"
  >
    <Icon
      name="namespace-switcher"
      width={32}
      height={32}
      class="mx-2 inline cursor-pointer rounded-full border border-gray-900 shadow-sm transition-all hover:scale-105"
    />
  </button>
</Tooltip>
