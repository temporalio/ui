<script lang="ts">
  import { writable } from 'svelte/store';

  import type { Hst as HST } from '@histoire/plugin-svelte';

  import RadioGroup from './radio-group.svelte';
  import RadioInput from './radio-input.svelte';

  export let Hst: HST;
  const value1 = writable('a');
  const value2 = writable(1);
</script>

<Hst.Story title="radio input">
  <Hst.Variant title="with a radio group">
    <RadioGroup name="option" group={value1}>
      <RadioInput id="option-a" label="Option A" value="a" />
      <RadioInput id="option-b" label="Option B" value="b" />
      <RadioInput id="option-c" label="Option C" value="c" />
      <p>The value is {$value1}</p>
    </RadioGroup>
  </Hst.Variant>
  <Hst.Variant title="without a radio group">
    <div class="flex flex-col gap-2">
      <RadioInput
        id="option-1"
        label="Option 1"
        value={1}
        name="number-option"
        group={value2}
      />
      <RadioInput
        id="option-2"
        label="Option 2"
        value={2}
        name="number-option"
        group={value2}
      />
    </div>
    <p>The value is {$value2}</p>
  </Hst.Variant>
</Hst.Story>
