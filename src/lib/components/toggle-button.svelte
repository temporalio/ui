<script lang="ts">
  import Icon from 'svelte-fa';
  import { getContext } from 'svelte';

  import type { IconDefinition } from '@fortawesome/free-solid-svg-icons';

  export let icon: IconDefinition;
  export let group = getContext<boolean>('group');
  export let scale = 1.2;
  export let active = false;
</script>

<button
  class="py-2 px-4 border-2 block hover:text-white hover:bg-gray-600"
  class:rounded-lg={!group}
  class:active
  class:group
>
  <Icon {icon} {scale} />
</button>

<style lang="postcss">
  .active {
    @apply bg-gray-900 text-white hover:bg-gray-900;
  }

  .group:first-child {
    @apply rounded-tl-lg rounded-bl-lg;
  }

  .group:not(:last-child) {
    @apply border-r-0;
  }

  .group:last-child {
    @apply rounded-tr-lg rounded-br-lg;
  }
</style>
