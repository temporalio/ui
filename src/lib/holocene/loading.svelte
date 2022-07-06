<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';

  export let title: string = 'Loading…';
</script>

<div
  class="my-12 flex flex-col items-center justify-start gap-2 {$$props.class}"
>
  <div
    class="flex h-16 w-16 items-center justify-center rounded-full bg-gray-200"
  >
    <Icon
      name="temporal"
      scale={0.65}
      width={100}
      height={100}
      fill="#111827"
      class="z-50 block h-full w-full animate-spin-slow"
    />
  </div>
  <h2 class="text-xl font-medium">{title}</h2>
</div>
