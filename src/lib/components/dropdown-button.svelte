<script lang="ts">
  import Icon from '$lib/holocene/icon/index.svelte';
  import { onMount } from 'svelte';
  import { scale } from 'svelte/transition';

  export let disabled: boolean = false;
  export let value: string | undefined;
  export let options = [];

  let show: boolean = false;
  let menu: any = null;

  $: {
    // Close the menu any time the value changes
    if (value || !value) {
      show = false;
    }
  }

  onMount(() => {
    const handleOutsideClick = (event: Event) => {
      if (show && !menu.contains(event.target)) {
        show = false;
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (show && event?.key === 'Escape') {
        show = false;
      }
    };

    document.addEventListener('click', handleOutsideClick, false);
    document.addEventListener('keyup', handleEscape, false);

    return () => {
      document.removeEventListener('click', handleOutsideClick, false);
      document.removeEventListener('keyup', handleEscape, false);
    };
  });
</script>

<div class="relative mx-2 inline" bind:this={menu} data-cy={$$props.dataCy}>
  <button
    on:click
    class={`primary flex items-center justify-center gap-4 text-sm`}
    {disabled}
  >
    <span class="pl-2 pr-8">{value}</span>
    <span class="absolute right-8 top-0 h-12 w-0 border-l-2 border-white" />
    <div
      class="absolute right-0 top-0 h-10 w-8 py-3 px-2"
      on:click|stopPropagation={() => (show = !show)}
    >
      <Icon name="caretDown" scale={1} />
    </div>
  </button>
  {#if show}
    <div
      in:scale={{ duration: 200, start: 0.65 }}
      out:scale={{ duration: 100, start: 0.65 }}
      class="dropdown-menu"
    >
      <div class="block flex flex-col gap-2">
        {#each options as option}
          <div class="option" on:click={option.onClick}>{option.label}</div>
        {/each}
        <slot />
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
  .primary {
    @apply h-10 rounded-lg border-2 border-gray-900 bg-primary py-2 px-4 text-base text-white transition-colors;
  }

  .dropdown-menu {
    @apply absolute absolute right-0 z-50 mt-1 w-44 origin-top-right rounded-lg border-2 border-gray-100
        bg-white py-4 pl-8 pr-4 shadow-xl;
  }
  .option {
    @apply cursor-pointer text-lg text-gray-900;
  }
</style>
