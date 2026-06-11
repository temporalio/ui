<script lang="ts">
  import { twMerge as merge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { copyToClipboard } from '$lib/utilities/copy-to-clipboard';

  type Props = {
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
  };

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
</script>

{#if show}
  <div class={merge('copy-or-filter', className)}>
    {#if filterable}
      <button
        onclick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onFilter();
        }}
        class="copy-or-filter-button"
        class:filtered
      >
        {#key filtered}
          <Icon title={filterIconTitle} name="filter" class="m-0.5" />
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
      >
        <Icon
          title={$copied ? copySuccessIconTitle : copyIconTitle}
          name={$copied ? 'checkmark' : 'copy'}
          class="m-0.5"
        />
      </button>
    {/if}
  </div>
{/if}

<style lang="postcss">
  @reference "../../app.css";

  .copy-or-filter {
    @apply absolute top-0 right-0 bottom-0 inline-flex gap-1 px-1;
  }

  .copy-or-filter-button {
    @apply surface-primary text-primary hover:surface-inverse relative top-[50%] h-6 w-6 translate-y-[-50%] rounded-full p-0.5;
  }

  .filtered {
    @apply surface-inverse;
  }
</style>
