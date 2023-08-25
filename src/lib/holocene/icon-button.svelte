<script lang="ts">
  import type { HTMLButtonAttributes } from 'svelte/elements';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import type { IconName } from '$lib/holocene/icon/paths';
  import Button from './button.svelte';

  interface $$Props extends HTMLButtonAttributes {
    icon: IconName;
    'data-testid'?: string;
    label: string;
  }

  export let icon: IconName = null;
  export let label = '';
</script>

<Button variant="secondary" on:click aria-label={label} {...$$restProps}>
  <Icon name={icon} class="h-auto" />
</Button>
