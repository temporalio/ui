<script lang="ts">
  import { type IconName, icons } from './paths';

  type $$Props = {
    name: IconName;
    width?: number;
    height?: number;
    title?: string;
    class?: string;
    x?: number;
    y?: number;
    strokeWidth?: string;
    'aria-hidden'?: string;
    animate?: boolean;
    active?: boolean;
  };
  let {
    name,
    width = 16,
    height = 16,
    title = '',
    class: className = '',
    x,
    y,
    strokeWidth,
    'aria-hidden': ariaHidden = 'false',
    animate = false,
  }: $$Props = $props();

  const Icon = $derived(icons[name]);
</script>

{#if Icon}
  <Icon
    {width}
    {height}
    {title}
    {x}
    {y}
    {ariaHidden}
    {strokeWidth}
    {animate}
    class="shrink-0 {className}"
  />
{/if}
