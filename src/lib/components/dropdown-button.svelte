<script lang="ts">
  import Icon from 'svelte-fa';
  import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
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

<div class="relative inline mx-2" bind:this={menu} data-cy={$$props.dataCy}>
  <button
    on:click
    class={`flex items-center gap-4 justify-center text-sm primary`}
    {disabled}
  >
    <span class="pl-2 pr-8">{value}</span>
    <span class="absolute right-8 top-0 h-12 w-0 border-l-2 border-white" />
    <div
      class="absolute right-0 top-0 h-10 w-8 py-3 px-2"
      on:click|stopPropagation={() => (show = !show)}
    >
      <Icon icon={faCaretDown} scale={1} />
    </div>
  </button>
  {#if show}
    <div
      in:scale={{ duration: 200, start: 0.65 }}
      out:scale={{ duration: 100, start: 0.65 }}
      class="dropdown-menu"
    >
      <div class="flex flex-col gap-2 block">
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
    @apply h-10 text-white text-base bg-primary border-2 border-gray-900 rounded-lg py-2 px-4 transition-colors;
  }

  .dropdown-menu {
    @apply absolute w-44 py-4 pl-8 pr-4 mt-1 bg-white origin-top-right absolute right-0
        rounded-lg shadow-xl z-50 border-2 border-gray-100;
  }
  .option {
    @apply text-lg cursor-pointer text-gray-900;
  }
</style>
