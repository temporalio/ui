<script lang="ts">
  import { type IconName, icons } from './paths';

  type Props = {
    name: IconName;
    width?: number;
    height?: number;
    title?: string;
    className?: string;
    x?: number;
    y?: number;
  };
  let {
    name,
    width = 16,
    height = 16,
    title = '',
    className = '',
    x,
    y,
  }: Props = $props();

  const Icon = $derived(icons[name]);
</script>

{#if Icon}
  <Icon {width} {height} {title} {x} {y} class="shrink-0 {className}" />
{/if}
