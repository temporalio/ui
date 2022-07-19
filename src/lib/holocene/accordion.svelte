<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';
  import type { IconName } from './icon/paths';
  export let title: string;
  export let subtitle: string = '';
  export let icon: IconName | undefined = undefined;

  export let open: boolean = false;
</script>

<section
  class="flex w-full cursor-default flex-row rounded-lg border border-gray-300 bg-white p-8 {$$props.class}"
>
  <div class="w-full">
    <div
      class="accordion-open flex cursor-pointer flex-col"
      class:open
      on:click={() => (open = !open)}
    >
      <div class="space-between flex flex-row">
        <h2 class="flex w-full items-center gap-2 text-lg font-medium">
          {#if icon}<Icon scale={1.25} name={icon} />{/if}
          {title}
        </h2>
        <Icon
          name={open ? 'caretUp' : 'caretDown'}
          stroke="currentcolor"
          scale={1.4}
        />
      </div>
      <h3>{subtitle}</h3>
    </div>
    {#if open}
      <div id="accordion-content" class="w-full">
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
