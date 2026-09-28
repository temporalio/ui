<script lang="ts">
  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { shortRegion } from '$lib/utilities/compute-regions';

  import type { ComputeRegion } from './multi-region';

  interface Props {
    /** Omitted when the Namespace's region is unknown, e.g. self-hosted. */
    region?: ComputeRegion;
    /** Primary/Replica only mean something once there is more than one. */
    showRole?: boolean;
    /** Explains when Temporal invokes this Region's resource. */
    roleTooltip?: string;
    bodyClass?: string;
    action?: Snippet;
    children: Snippet;
  }

  let {
    region,
    showRole = false,
    roleTooltip,
    bodyClass = '',
    action,
    children,
  }: Props = $props();
</script>

<div class="rounded-lg border border-primary">
  {#if region}
    <div
      class="flex min-h-12 items-center gap-2 rounded-t-lg border-b border-primary bg-surface-secondary px-4 py-2"
    >
      <span class="inline-flex items-center gap-1">
        <span class="text-sm font-medium">{shortRegion(region.id)}</span>
        {#if showRole}
          {@const roleLabel =
            region.role === 'replica'
              ? translate('workers.region-role-replica')
              : translate('workers.region-role-primary')}
          <span class="text-sm text-secondary" aria-hidden="true">·</span>
          {#if roleTooltip}
            <Tooltip text={roleTooltip} top width={260}>
              <button
                type="button"
                class="rounded-sm text-sm text-secondary underline decoration-dotted underline-offset-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary"
              >
                {roleLabel}
              </button>
            </Tooltip>
          {:else}
            <span class="text-sm text-secondary">{roleLabel}</span>
          {/if}
        {/if}
      </span>
      {#if action}
        <div class="ml-auto">{@render action()}</div>
      {/if}
    </div>
  {/if}
  <div class={merge('px-4 pb-4 pt-5', bodyClass)}>
    {@render children()}
  </div>
</div>
