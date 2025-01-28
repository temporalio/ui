<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  interface Props {
    show?: boolean;
    filterable?: boolean;
    copyable?: boolean;
    content: string;
    onFilter?: () => void;
    filtered?: boolean;
    copyIconTitle: string;
    copySuccessIconTitle: string;
    filterIconTitle: string;
    class?: string;
  }

  let {
    show = false,
    filterable = true,
    copyable = true,
    content,
    onFilter = () => {},
    filtered = false,
    copyIconTitle,
    copySuccessIconTitle,
    filterIconTitle,
    class: className = '',
  }: Props = $props();

  const { copy, copied } = copyToClipboard();

  function handleOnFilter(event: Event) {
    event.stopPropagation();
    event.preventDefault;
    onFilter();
  }
</script>

{#if show}
  <div class={merge('copy-or-filter', className)}>
    {#if filterable}
      <button
        onclick={handleOnFilter}
        class="copy-or-filter-button"
        class:filtered
        id="filter-button"
      >
        {#key filtered}
          <Icon title={filterIconTitle} name="filter" class="m-1" />
        {/key}
      </button>
    {/if}
    {#if copyable}
      <button
        class="copy-or-filter-button"
        onclick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          copy(e, content);
        }}
        id="copy-button"
      >
        <Icon
          title={$copied ? copySuccessIconTitle : copyIconTitle}
          name={$copied ? 'checkmark' : 'copy'}
          class="m-1"
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
