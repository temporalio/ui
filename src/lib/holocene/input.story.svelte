<script lang="ts">
  import Input from './input/input.svelte';
  import NumberInput from './input/number-input.svelte';

  export let Hst;

  let value: string = '';
  let hintText: string | undefined;
  let valid = true;
  let maxLength: number | undefined;
  let dark = false;
  let disabled = false;
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
      theme={dark ? 'dark' : 'light'}
    />
  </Hst.Variant>

  <Hst.Variant title="A Text Input with an Icon">
    <Input id="input-2" bind:value placeholder="Search" icon="search" />
  </Hst.Variant>

  <Hst.Variant title="A Copyable Input">
    <Input
      id="input-3"
      value="Copy Me!"
      copyable
      theme={dark ? 'dark' : 'light'}
    />
  </Hst.Variant>

  <Hst.Variant title="A Number Input">
    <NumberInput id="number-input-1" bind:value />
  </Hst.Variant>

  <Hst.Variant title="A Number Input with a Label, Units and a Max">
    <NumberInput
      label="Retention Period*"
      id="number-input-2"
      units="days"
      max={50}
      bind:value
    />
  </Hst.Variant>

  <svelte:fragment slot="controls">
    <Hst.Text title="Hint Text:" bind:value={hintText} />
    <Hst.Checkbox title="Valid: " bind:value={valid} />
    <Hst.Number title="Max Length: " bind:value={maxLength} />
    <Hst.Checkbox title="Dark: " bind:value={dark} />
    <Hst.Checkbox title="Disabled: " bind:value={disabled} />
  </svelte:fragment>
</Hst.Story>
