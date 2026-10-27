<script lang="ts">
  import { fade } from 'svelte/transition';

  import type { Snippet } from 'svelte';
  import { twMerge as merge } from 'tailwind-merge';

  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';

  import { motion } from './motion';
  import type { ComputeRegion } from './multi-region';

  interface Props {
    /** Omitted when the Namespace's region is unknown, e.g. self-hosted. */
    region?: ComputeRegion;
    /** The header's text when there is no region to name. */
    title?: string;
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
    title,
    showRole = false,
    roleTooltip,
    bodyClass = '',
    action,
    children,
  }: Props = $props();
</script>

<!-- The card IS the region boundary, so with no region to name there is nothing
to bound: the children render bare, exactly as they did before this component
existed. Otherwise every single-region form would gain a border it never had. -->
{#if region || title}
  <div class="rounded-lg border border-primary">
    <div
      class="flex min-h-12 items-center gap-2 rounded-t-lg border-b border-primary bg-surface-secondary px-4 py-2"
    >
      <!-- The region fades in when high availability names it. The primary's
      header is often out of view when the toggle changes it, so this is the
      only cue it changed. One line high, so nothing moves. -->
      {#key region?.id}
        <span class="inline-flex items-center gap-1" in:fade={motion('swap')}>
          <span class="text-sm font-medium"
            >{region ? (region.label ?? region.id) : title}</span
          >
          {#if region && showRole}
            {@const roleLabel =
              region.role === 'replica'
                ? translate('workers.region-role-replica')
                : translate('workers.region-role-primary')}
            <span class="text-sm text-secondary" aria-hidden="true">·</span>
            {#if roleTooltip}
              <Tooltip text={roleTooltip} top width={260}>
                <button
                  type="button"
                  class="rounded-xs text-sm text-secondary underline decoration-dotted underline-offset-4 focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:outline-hidden"
                >
                  {roleLabel}
                </button>
              </Tooltip>
            {:else}
              <span class="text-sm text-secondary">{roleLabel}</span>
            {/if}
          {/if}
        </span>
      {/key}
      {#if action}
        <div class="ml-auto">{@render action()}</div>
      {/if}
    </div>
    <div class={merge('px-4 pt-5 pb-4', bodyClass)}>
      {@render children()}
    </div>
  </div>
{:else}
  {@render children()}
{/if}
