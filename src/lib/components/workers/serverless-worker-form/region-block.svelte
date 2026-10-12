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

<div class="rounded-lg border border-primary">
  {#if region || title}
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
      {/key}
      {#if action}
        <div class="ml-auto">{@render action()}</div>
      {/if}
    </div>
  {/if}
  <div class={merge('px-4 pb-4 pt-5', bodyClass)}>
    {@render children()}
  </div>
</div>
