<script lang="ts">
  import Icon from '../icon/icon.svelte';
  import type { IconName } from '../icon/paths';

  import NavTooltip from './nav-tooltip.svelte';

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

<li data-testid={$$props['data-testid']}>
  <a
    href={link}
    {...attributes}
    class="flex flex-row items-center whitespace-nowrap rounded-lg py-1 text-sm font-medium group-[.surface-inverse]:hover:bg-slate-950 group-[.surface-primary]:hover:bg-slate-200"
  >
    <NavTooltip text={tooltip}>
      <div class="ml-2 mr-2 mt-0 h-6 cursor-pointer">
        <Icon name={icon} />
      </div>
    </NavTooltip>
    <div class="overflow-hidden">{label}</div>
  </a>
</li>
