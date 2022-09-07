<script>import { onMount } from 'svelte';
import { page } from '$app/stores';
import { pagination, perPageFromSearchParameter, perPageOptions, } from '../stores/pagination';
import Icon from '$holocene/icon/icon.svelte';
export let key = 'per-page';
export let items;
export let floatId = undefined;
export let updating = false;
import FilterSelect from './select/filter-select.svelte';
import { getFloatStyle } from '../utilities/get-float-style';
export let startingIndex = 0;
$: perPage = String(perPageFromSearchParameter($page.url.searchParams.get(key))).toString();
$: store = pagination(items, perPage);
$: store.jumpToIndex(startingIndex);
let screenWidth;
let width;
let height;
onMount(() => {
    var _a;
    if (floatId) {
        width = (_a = document.getElementById(floatId)) === null || _a === void 0 ? void 0 : _a.clientWidth;
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
          <Icon name="chevron-left" />
        </button>
        <p>
          {$store.startingIndex + 1}–{$store.endingIndex + 1} of {$store.length}
        </p>
        <button
          class="caret"
          disabled={!$store.hasNext}
          on:click={() => store.next()}
        >
          <Icon name="chevron-right" />
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
        <Icon name="chevron-left" />
      </button>
      <p>
        {$store.startingIndex + 1}–{$store.endingIndex + 1} of {$store.length}
      </p>
      <button
        class="caret"
        disabled={!$store.hasNext}
        on:click={() => store.next()}
      >
        <Icon name="chevron-right" />
      </button>
    </div>
  </nav>
</div>

<style>
  .caret {

    --tw-text-opacity: 1;

    color: rgb(113 113 122 / var(--tw-text-opacity))
}

  .caret:disabled {

    cursor: not-allowed;

    --tw-text-opacity: 1;

    color: rgb(212 212 216 / var(--tw-text-opacity))
}</style>
