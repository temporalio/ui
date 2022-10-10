<script lang="ts">
  import { logEvent } from 'histoire/client';
  import DropdownButton from './dropdown-button.svelte';
  import RadioMenuItem from '../dropdown-button/radio-menu-item.svelte';
  import MenuItem from '../primitives/menu/menu-item.svelte';
  import type { Hst as HST } from '@histoire/plugin-svelte';

  export let Hst: HST;

  let value: number = 0;
</script>

<Hst.Story>
  <Hst.Variant title="With Radio Menu Items">
    <DropdownButton
      id="dropdown-button-1"
      label="Retention Policy"
      icon="retention"
    >
      <RadioMenuItem
        checked={value === 7}
        value={7}
        on:select={(event) => logEvent('select', event)}>7 Days</RadioMenuItem
      >
      <RadioMenuItem
        checked={value === 30}
        value={30}
        on:select={(event) => logEvent('select', event)}>30 Days</RadioMenuItem
      >
      <RadioMenuItem
        checked={value === 60}
        value={60}
        on:select={(event) => logEvent('select', event)}>60 Days</RadioMenuItem
      >
      <RadioMenuItem
        checked={value === 90}
        value={90}
        on:select={(event) => logEvent('select', event)}>90 Days</RadioMenuItem
      >
    </DropdownButton>
  </Hst.Variant>

  <Hst.Variant title="With Regular Menu Items">
    <DropdownButton id="dropdown-button-2" label="Regions" icon="regions">
      <MenuItem on:click={(event) => logEvent('click', event)}
        >us-east-1</MenuItem
      >
      <MenuItem on:click={(event) => logEvent('click', event)}
        >us-east-2</MenuItem
      >
      <MenuItem on:click={(event) => logEvent('click', event)}
        >us-west-1</MenuItem
      >
    </DropdownButton>
  </Hst.Variant>

  <Hst.Variant title="Read-only">
    <DropdownButton
      readonly
      id="dropdown-button-3"
      icon="regions"
      label="Regions"
    />
  </Hst.Variant>
</Hst.Story>
