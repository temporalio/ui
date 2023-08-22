<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  
  import { isEmail } from '../../utilities/is-email';
  
  import ChipInput from './chip-input.svelte';
  import Input from './input.svelte';
  import NumberInput from './number-input.svelte';
  import RangeInput from './range-input.svelte';
  

  export let Hst: HST;

  let value = '';
  let numberValue = 0;
  let hintText: string | undefined;
  let valid = true;
  let maxLength: number | undefined;
  let dark = false;
  let disabled = false;
  let clearable = false;
  let min = 0;
  let max = 100;
  let emails = [];
</script>

<Hst.Story>
  <Hst.Variant title="A Basic Text Input">
    <Input
      id="input-1"
      bind:value
      label="Hello"
      placeholder="Hello"
      {hintText}
      {valid}
      {maxLength}
      {disabled}
      {clearable}
      theme={dark ? 'dark' : 'light'}
    />
  </Hst.Variant>

  <Hst.Variant title="A Text Input with an Icon">
    <Input
      id="input-2"
      label="Search"
      labelHidden
      bind:value
      placeholder="Search"
      icon="search"
      type="search"
    />
  </Hst.Variant>

  <Hst.Variant title="A Copyable Input">
    <Input
      id="input-3"
      label="Copy Me!"
      labelHidden
      value="Copy Me!"
      copyable
      theme={dark ? 'dark' : 'light'}
    />
  </Hst.Variant>

  <Hst.Variant title="A Number Input">
    <NumberInput
      label="Enter a number"
      id="number-input-1"
      bind:value={numberValue}
    />
  </Hst.Variant>

  <Hst.Variant title="A Number Input with a Label, Units, Max, and Hint Text">
    <NumberInput
      label="Retention Period*"
      id="number-input-2"
      hintText="Please enter a number between {min} and {max}"
      units="days"
      {max}
      {min}
      bind:value={numberValue}
    />
  </Hst.Variant>

  <Hst.Variant title="A Range Input">
    <RangeInput
      label="day(s) retention"
      id="range-input-1"
      {min}
      {max}
      bind:value={numberValue}
    />
  </Hst.Variant>

  <Hst.Variant title="A Chip Input with validation">
    <ChipInput
      id="email-input"
      bind:chips={emails}
      label="Email Address(es)"
      placeholder="Type or paste in email addresses"
      hintText="Please enter a properly formatted email address."
      validator={isEmail}
    />
  </Hst.Variant>

  <svelte:fragment slot="controls">
    <Hst.Text title="Hint Text:" bind:value={hintText} />
    <Hst.Checkbox title="Valid: " bind:value={valid} />
    <Hst.Number title="Max Length: " bind:value={maxLength} />
    <Hst.Checkbox title="Dark: " bind:value={dark} />
    <Hst.Checkbox title="Disabled: " bind:value={disabled} />
    <Hst.Checkbox title="Clearable: " bind:value={clearable} />
    <Hst.Number title="Min:" bind:value={min} />
    <Hst.Number title="Max:" bind:value={max} />
  </svelte:fragment>
</Hst.Story>
