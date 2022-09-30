<script lang="ts">
  import Icon from '$holocene/icon/icon.svelte';

  export let sorts = [];
  export let type: string;
  export let onChange: () => void;

  const onSortClick = (order: string) => {
    if (sorts.find((s) => s.order === order)) {
      sorts = [];
    } else {
      sorts = [
        {
          label: type,
          value: type,
          order,
        },
      ];
    }
    onChange();
  };
</script>

<div class="mt-2 transition-all hover:cursor-pointer">
  <div class="flex items-center" on:click={() => onSortClick('asc')}>
    <div
      class="ml-4 mr-2 h-6 w-6 rounded-sm text-gray-900"
      class:active={sorts.find((s) => s.order === 'asc' && s.value === type)}
    >
      <Icon
        class="pointer-events-none -mt-[1px]"
        name="ascending"
        width={24}
        height={24}
      />
    </div>
    <div class="p-1 hover:scale-[103%]">Ascending</div>
  </div>
  <div class="flex items-center" on:click={() => onSortClick('desc')}>
    <div
      class="ml-4 mr-2 h-6 w-6 rounded-sm text-gray-900"
      class:active={sorts.find((s) => s.order === 'desc' && s.value === type)}
    >
      <Icon
        class="pointer-events-none -mt-[1px]"
        name="descending"
        width={24}
        height={24}
      />
    </div>
    <div class="p-1 hover:scale-[103%]">Descending</div>
  </div>
</div>

<style lang="postcss">
  .active {
    @apply bg-gray-900 text-white;
  }
</style>
