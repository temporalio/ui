<script lang="ts">
  import { type IconName, icons } from './paths';

  interface Props {
    name: IconName;
    width?: number;
    height?: number;
    title?: string;
    class?: string;
    [key: string]: unknown;
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
