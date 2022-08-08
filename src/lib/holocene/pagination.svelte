<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import {
    pagination,
    perPageFromSearchParameter,
    perPageOptions,
  } from '$lib/stores/pagination';

  import Icon from '$lib/holocene/icon/index.svelte';

  type T = $$Generic;

  export let key = 'per-page';
  export let items: T[];
  export let floatId: string | undefined = undefined;
  export let updating = false;

  import FilterSelect from '$lib/components/select/filter-select.svelte';
  import { getFloatStyle } from '$lib/utilities/get-float-style';

  export let startingIndex: string | number = 0;

  $: perPage = String(
    perPageFromSearchParameter($page.url.searchParams.get(key)),
  ).toString();
  $: store = pagination(items, perPage);
  $: store.jumpToIndex(startingIndex);

  let screenWidth: number;
  let width: number | undefined;
  let height: number | undefined;

  onMount(() => {
    if (floatId) {
      width = document.getElementById(floatId)?.clientWidth;
    }
  });

  $: floatStyle = getFloatStyle({ width, height, screenWidth });
</script>

<svelte:window bind:innerWidth={screenWidth} />

<div class="pagination relative mb-8 flex flex-col gap-4">
  <div class="flex justify-between">
    <p class="mr-6 flex items-center text-gray-600">
      {#if updating}
        Updating…
      {/if}
    </p>
    <nav
      style={floatStyle}
      bind:clientHeight={height}
      class="flex justify-end gap-8"
    >
      <div class="flex items-center justify-center gap-2">
        <p class="w-fit text-right">Per Page</p>
        <FilterSelect
          label="Per Page"
          parameter={key}
          value={perPage}
          options={perPageOptions(perPage)}
        />
      </div>
      <div class="flex items-center justify-center gap-6">
        <button
          class="caret"
          disabled={!$store.hasPrevious}
          on:click={() => store.previous()}
        >
          <Icon scale={0.8} stroke="currentcolor" name="caretLeft" />
        </button>
        <p>
          {$store.startingIndex + 1}–{$store.endingIndex + 1} of {$store.length}
        </p>
        <button
          class="caret"
          disabled={!$store.hasNext}
          on:click={() => store.next()}
        >
          <Icon scale={0.8} stroke="currentcolor" name="caretRight" />
        </button>
      </div>
      <slot name="action" />
    </nav>
  </div>
  <slot visibleItems={$store.items} initialItem={$store.initialItem} />
  <nav class="flex justify-end gap-8">
    <div class="flex items-center justify-center gap-2">
      <p class="w-fit text-right">Per Page</p>
      <FilterSelect
        label="Per Page"
        parameter={key}
        value={String(perPage)}
        options={perPageOptions(perPage)}
      />
    </div>
    <div class="flex items-center justify-center gap-6">
      <button
        class="caret"
        disabled={!$store.hasPrevious}
        on:click={() => store.previous()}
      >
        <Icon scale={0.8} stroke="currentcolor" name="caretLeft" />
      </button>
      <p>
        {$store.startingIndex + 1}–{$store.endingIndex + 1} of {$store.length}
      </p>
      <button
        class="caret"
        disabled={!$store.hasNext}
        on:click={() => store.next()}
      >
        <Icon scale={0.8} stroke="currentcolor" name="caretRight" />
      </button>
    </div>
  </nav>
</div>

<style lang="postcss">
  .caret {
    @apply text-gray-500;
  }

  .caret:disabled {
    @apply cursor-not-allowed text-gray-300;
  }
</style>
