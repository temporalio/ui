<script lang="ts">
  import type { Writable } from 'svelte/store';

  import Button from '$lib/holocene/button.svelte';
  import Tooltip from '$lib/holocene/tooltip.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconArrowExpand, IconArrowMinimize } from '$lib/io/icon';

  interface Props {
    maximized: Writable<boolean>;
  }

  let { maximized }: Props = $props();

  const label = $derived(
    $maximized ? translate('common.minimize') : translate('common.maximize'),
  );
  const Glyph = $derived($maximized ? IconArrowMinimize : IconArrowExpand);
</script>

<Tooltip text={label} top>
  <Button
    onclick={() => ($maximized = !$maximized)}
    data-testid="table-maximize-button"
    size="xs"
    variant="ghost"
    aria-label={label}
    LeadingIcon={Glyph}
    data-track-name="maximize-table-control"
    data-track-intent="action"
    data-track-text={label}
  />
</Tooltip>
