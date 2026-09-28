<script lang="ts">
  interface Props {
    show: boolean;
    count: number;
    class?: string;
  }

  let { show, count, class: className = '' }: Props = $props();
</script>

{#if show && count > 0}
  <span
    class="absolute right-0 top-0 flex w-fit origin-bottom-left translate-x-[10px] translate-y-[-10px] flex-row items-center justify-center gap-1 text-nowrap rounded-full border border-secondary bg-surface-tertiary px-1 py-0 font-mono text-xs font-normal leading-4 text-primary{className}"
  >
    {count}
  </span>
{/if}
