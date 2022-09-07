<script>import { namespaceSelectorOpen } from '../stores/nav-open';
import { viewFeature } from '../stores/new-feature-tags';
import Icon from '$holocene/icon/icon.svelte';
import FeatureTag from './feature-tag.svelte';
function toggleNamespaceSelector() {
    $namespaceSelectorOpen = !$namespaceSelectorOpen;
    viewFeature('namespaceSelector');
}
</script>

<button
  class="relative"
  on:click={toggleNamespaceSelector}
  data-cy="namespace-select-button"
>
  <Icon name="namespace-switcher" class="mx-2 inline cursor-pointer" />
  <FeatureTag feature="namespaceSelector" />
</button>
