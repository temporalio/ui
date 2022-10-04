<script lang="ts">
  import type { Hst as HST } from '@histoire/plugin-svelte';
  import OptionGroup from './select/option-group.svelte';

  import Option from './select/option.svelte';
  import Select from './select/select.svelte';
  import SimpleOption from './select/simple-option.svelte';
  import SimpleSelect from './select/simple-select.svelte';

  export let Hst: HST;

  let value = '';
  let dark = false;
</script>

<Hst.Story>
  <Hst.Variant title="A Default Fancy Select">
    <Select
      id="select-1"
      label="Favorite Food"
      placeholder="Select an Option"
      bind:value
      {dark}
    >
      <Option {dark}>Pizza</Option>
      <Option {dark}>Hamburgers</Option>
      <Option {dark}>Hot Dogs</Option>
    </Select>
  </Hst.Variant>

  <Hst.Variant title="With Option Descriptions">
    <Select value={null} id="select-2" placeholder="Select an option...">
      <Option
        description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi nisi
        reprehenderit alias rerum minus, nulla ratione ipsum expedita. Praesentium
        doloribus animi, dolorem nesciunt repellendus maxime deleniti vitae
        corrupti deserunt aperiam?"
        >Lorem ipsum dolor sit amet consectetur adipisicing elit 1.</Option
      >
      <Option
        description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi nisi
        reprehenderit alias rerum minus, nulla ratione ipsum expedita. Praesentium
        doloribus animi, dolorem nesciunt repellendus maxime deleniti vitae
        corrupti deserunt aperiam?"
        >Lorem ipsum dolor sit amet consectetur adipisicing elit 2.</Option
      >
      <Option
        description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quasi nisi
        reprehenderit alias rerum minus, nulla ratione ipsum expedita. Praesentium
        doloribus animi, dolorem nesciunt repellendus maxime deleniti vitae
        corrupti deserunt aperiam?"
        >Lorem ipsum dolor sit amet consectetur adipisicing elit 3.</Option
      >
    </Select>
  </Hst.Variant>

  <Hst.Variant title="With Grouped Options">
    <Select id="select-3" placeholder="Select an Option" {value}>
      <OptionGroup label="Mammals">
        <Option>Horse</Option>
        <Option>Dog</Option>
        <Option>Cat</Option>
      </OptionGroup>
      <OptionGroup label="Reptiles">
        <Option>Snake</Option>
        <Option>Lizard</Option>
      </OptionGroup>
      <OptionGroup label="Amphibians">
        <Option>Frog</Option>
        <Option>Salamander</Option>
      </OptionGroup>
    </Select>
  </Hst.Variant>

  <Hst.Variant title="A Simple Select">
    <SimpleSelect id="select-4" bind:value>
      <SimpleOption>Option 1</SimpleOption>
      <SimpleOption>Option 2</SimpleOption>
      <SimpleOption>Option 3</SimpleOption>
    </SimpleSelect>
  </Hst.Variant>

  <svelte:fragment slot="controls">
    <Hst.Checkbox title="Dark: " bind:value={dark} />
  </svelte:fragment>
</Hst.Story>
