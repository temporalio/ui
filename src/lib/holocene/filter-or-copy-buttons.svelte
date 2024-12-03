<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  export let show = false;
  export let filterable = true;
  export let copyable = true;
  export let content: string;
  export let onFilter: () => void = () => {};
  export let filtered = false;
  export let copyIconTitle: string;
  export let copySuccessIconTitle: string;
  export let filterIconTitle: string;

  let className = '';
  export { className as class };

  const { copy, copied } = copyToClipboard();
</script>

{#if show}
  <div class={merge('copy-or-filter', className)}>
    {#if filterable}
      <button
        on:click|preventDefault|stopPropagation={onFilter}
        class="copy-or-filter-button"
        class:filtered
        id="filter-button"
      >
        {#key filtered}
          <Icon title={filterIconTitle} name="filter" className="m-1" />
        {/key}
      </button>
    {/if}
    {#if copyable}
      <button
        class="copy-or-filter-button"
        on:click|preventDefault|stopPropagation={(e) => copy(e, content)}
        id="copy-button"
      >
        <Icon
          title={$copied ? copySuccessIconTitle : copyIconTitle}
          name={$copied ? 'checkmark' : 'copy'}
          className="m-1"
        />
      </button>
    {/if}
  </div>
{/if}

<style lang="postcss">
  .copy-or-filter {
    @apply absolute bottom-0 right-0 top-0 inline-flex gap-2 px-2;
  }

  .copy-or-filter-button {
    @apply surface-primary relative top-[50%] h-fit translate-y-[-50%] rounded-full p-1 text-primary hover:surface-inverse;
  }

  .filtered {
    @apply surface-inverse;
  }
</style>
