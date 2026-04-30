<script lang="ts">
  import type { ComponentProps } from 'svelte';

  import { type IconName, icons } from './paths';

  import type Svg from './svg.svelte';

  interface Props extends ComponentProps<typeof Svg> {
    name: IconName;
  }

  let {
    name,
    width = 16,
    height = 16,
    title = '',
    class: className = '',
    ...rest
  }: Props = $props();

  const Icon = $derived(icons[name]);
</script>

{#if Icon}
  <Icon {width} {height} {title} class="shrink-0 {className}" {...rest} />
{/if}
