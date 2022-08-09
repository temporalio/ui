<script lang="ts">
  import Chapter from '../_chapter.svelte';

  import ChipInput from '$lib/holocene/input/chip-input.svelte';
  import { isEmail } from '$lib/utilities/is-email';

  let emails = [];
</script>

<Chapter description="A Chip Input">
  <ChipInput
    bind:chips={emails}
    class="w-96"
    id="input9"
    label="Email Address(es)"
    required
    hintText="Please enter a properly formatted email address."
    validator={isEmail}
  />
  <small>value: {emails}</small>
</Chapter>
