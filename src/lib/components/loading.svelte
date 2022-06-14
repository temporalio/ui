<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';

  export let title: string = 'Loading…';
</script>

<div class="my-12 flex flex-col items-center justify-start gap-2">
  <div
    class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200"
  >
    <Icon name="spinner" scale={0.5} class="block h-full w-full animate-spin" />
  </div>
  <h2 class="text-xl font-medium">{title}</h2>
</div>
