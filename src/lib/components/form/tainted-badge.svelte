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
    class="absolute top-0 right-0 flex w-fit origin-bottom-left translate-x-[10px] translate-y-[-10px] flex-row items-center justify-center gap-1 rounded-full border border-secondary bg-surface-tertiary px-1 py-0 font-mono text-xs leading-4 font-normal text-nowrap text-primary{className}"
  >
    {count}
  </span>
{/if}
