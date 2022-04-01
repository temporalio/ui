<script lang="ts">
  import Icon from 'svelte-fa';
  import { faCheck } from '@fortawesome/free-solid-svg-icons';

  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
  import { onMount } from 'svelte';
  import { scale } from 'svelte/transition';
  import IconButton from './icon-button.svelte';

  import { updateQueryParameters } from '$lib/utilities/update-query-parameters';

  export let value: string | undefined;
  export let parameter: string;
  export let options: OptionLabel[];

  let show: boolean = false;
  let menu: any = null;
  $: _value = $page.url?.searchParams?.get(parameter) ?? undefined;

  $: {
    updateQueryParameters({
      parameter,
      value: _value,
      url: $page.url,
      goto,
    }).then((v) => (value = v?.toString()));
  }

  const onOptionClick = (option: string) => {
    _value = option;
    show = false;
  };

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

<div class="relative inline mx-2" bind:this={menu}>
  <IconButton
    icon={faCaretDown}
    on:click={() => (show = !show)}
    classes="menu focus:outline-none focus:shadow-solid"
  />
  {#if show}
    <div
      in:scale={{ duration: 200, start: 0.65 }}
      out:scale={{ duration: 100, start: 0.65 }}
      class="origin-top-left absolute left-0 w-48 py-2 mt-1 bg-white
        rounded shadow-md text-gray-900 z-50"
    >
      <div class="gap-4 block">
        {#each options as { label, option } (option)}
          <div
            class="option"
            class:active={value === option}
            on:click={() => onOptionClick(option)}
          >
            <div class="check">
              {#if value === option}
                <Icon icon={faCheck} />
              {/if}
            </div>
            <div class="label">
              {label}
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>

<style lang="postcss">
  .option {
    @apply font-normal flex my-2;
  }
  .label {
    @apply cursor-pointer;
  }
  .check {
    @apply mx-4 w-4;
  }
  .active {
    @apply text-blue-700;
  }
</style>
