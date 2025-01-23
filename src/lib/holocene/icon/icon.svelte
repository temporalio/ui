<script lang="ts">
  import { type IconName, icons } from './paths';

  interface Props {
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
    duration?: number;
    active?: boolean;
  }

  let {
    name,
    width = 16,
    height = 16,
    title = '',
    class: className = '',
    ...rest
  }: Props = $props();

  const IconComponent = icons[name];
</script>

{#if IconComponent}
  <IconComponent
    {width}
    {height}
    {title}
    class="shrink-0 {className}"
    {...rest}
  />
{/if}
