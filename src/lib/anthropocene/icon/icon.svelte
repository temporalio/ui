<script lang="ts">
  import { type IconName, icons } from './paths';

  interface Props {
    name: IconName;
    width?: number;
    height?: number;
    title?: string;
    class?: string;
  }

  let {
    name,
    width = 16,
    height = 16,
    title = '',
    class: className = '',
    ...restProps
  }: Props = $props();

  const icon = $derived(icons[name]);
</script>

{#if icon}
  {@const Component = icon}
  <Component
    {width}
    {height}
    {title}
    class="shrink-0 {className}"
    {...restProps}
  />
{/if}
