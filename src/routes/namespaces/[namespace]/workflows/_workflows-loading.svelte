<script lang="ts">
  import Icon from 'svelte-fa';
  import { faSpinner } from '@fortawesome/free-solid-svg-icons';

  export let title: string = 'Loading…';
</script>

<div class="my-12 flex flex-col justify-start items-center gap-2">
  <div
    class="flex rounded-full items-center justify-center w-16 h-16 bg-gray-200"
  >
    <Icon
      icon={faSpinner}
      scale={1.2}
      class="block w-full h-full animate-spin"
    />
  </div>
  <h2 class="text-xl font-medium">{title}</h2>
</div>
