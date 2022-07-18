<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';
  export let title: string;
  export let subtitle: string = '';

  let open: boolean = false;
</script>

<section
  class="flex cursor-default flex-row rounded-lg border border-gray-300 bg-white p-8"
>
  <div class="w-full">
    <div
      class="flex cursor-pointer flex-col"
      class:open
      on:click={() => (open = !open)}
    >
      <div class="space-between flex flex-row">
        <h2 class="w-full text-lg font-medium">{title}</h2>
        <Icon name={open ? 'caretUp' : 'caretDown'} stroke="currentcolor" />
      </div>
      <h3>{subtitle}</h3>
    </div>
    {#if open}
      <div class="w-full">
        <slot />
      </div>
    {/if}
  </div>
</section>

<style lang="postcss">
  .open {
    @apply mb-8;
  }
</style>
