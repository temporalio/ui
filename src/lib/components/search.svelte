<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';

  export let placeholder = '';
  export let value = '';
  export let label = translate('common.search');
  export let name = 'query';
  export let icon = false;
  export let id = `${label.toLocaleUpperCase()}-input`;
</script>

<form on:submit|preventDefault role="search" class="flex items-center">
  <Input
    class="w-full"
    {label}
    {id}
    labelHidden
    icon={icon ? 'search' : null}
    type="search"
    {name}
    {value}
    {placeholder}
    autocomplete="off"
    on:input
  >
    <Button slot="after-input" type="submit">
      {label}
    </Button>
  </Input>
</form>
