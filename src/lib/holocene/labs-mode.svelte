<script lang="ts">
  import { page } from '$app/stores';
  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';
  import Icon from './icon/icon.svelte';
  import Tooltip from './tooltip.svelte';

  $: labsModeOn = $page.url.searchParams.get('labsMode') === 'true';

  const onClick = () => {
    updateQueryParameters({
      parameter: 'labsMode',
      value: labsModeOn ? '' : 'true',
      url: $page.url,
      invalidatePage: true,
    });
  };
</script>

<Tooltip bottomRight text="{labsModeOn ? 'Disable' : 'Enable'} Labs Mode">
  <button
    class="relative flex items-center"
    data-testid="labs-mode"
    on:click={onClick}
  >
    <div class="mx-1 flex items-center">
      <Icon name="comet" class={labsModeOn ? 'text-orange-500' : ''} />
    </div>
    <slot />
  </button>
</Tooltip>
