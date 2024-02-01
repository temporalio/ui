<script lang="ts">
  import Icon from '../icon/icon.svelte';
  import type { IconName } from '../icon/paths';

  export let link: string;
  export let label: string;
  export let icon: IconName;
  export let tooltip = label;

  const attributes = link.startsWith('http')
    ? {
        rel: 'noreferrer',
        target: '_blank',
      }
    : {};
</script>

<div role="listitem" data-testid={$$props['data-testid']} class="relative">
  <a
    href={link}
    {...attributes}
    class="mb-1 flex items-center gap-2 whitespace-nowrap rounded-lg p-1 text-sm font-medium group-[.surface-inverse]:hover:bg-white group-[.surface-primary]:hover:bg-black group-[.surface-inverse]:hover:text-black group-[.surface-primary]:hover:text-white"
  >
    <div
      class="h-6 w-6 after:absolute after:left-[calc(100%_+_1.5rem)] after:top-0 after:hidden after:h-8 after:items-center after:rounded-md after:bg-slate-800 after:p-1 after:px-2 after:text-xs after:text-white after:content-[attr(data-tooltip)] group-data-[nav=closed]:hover:after:flex"
      data-tooltip={tooltip}
    >
      <Icon name={icon} />
    </div>
    <div class="opacity-0 transition-opacity group-data-[nav=open]:opacity-100">
      {label}
    </div>
  </a>
</div>
