<script lang="ts">
  import IconButton from '$lib/components/icon-button.svelte';
  export let title: string;
  export let subtitle: string;

  let open: boolean = false;
</script>

<section
  class="flex cursor-default flex-row rounded-lg border border-gray-300 bg-white p-8"
>
  <div class="w-full">
    <div class="flex flex-col" class:open>
      <div class="space-between flex flex-row">
        <h2 class="w-full text-lg font-medium">{title}</h2>
        <IconButton
          on:click={() => (open = !open)}
          icon={open ? 'caretUp' : 'caretDown'}
          stroke="currentcolor"
          scale={1.4}
        />
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
