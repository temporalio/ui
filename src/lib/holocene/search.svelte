<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';

  type $$Props = HTMLInputElement & {
    label: string;
    icon: boolean;
  };

  export let placeholder = '';
  export let value = '';
  export let label = 'Search';
  export let name = 'query';
  export let icon = false;
  export let disabled = false;
  export let id = `${label.toLocaleUpperCase()}-input`;
</script>

<form on:submit|preventDefault role="search" class="flex items-center">
  <Input
    class="w-full rounded-r-none"
    {label}
    {id}
    labelHidden
    icon={icon ? 'search' : null}
    type="search"
    {name}
    {value}
    {placeholder}
    {disabled}
    autocomplete="off"
    on:input
  >
    <Button {disabled} type="submit">
      {label}
    </Button>
  </Input>
</form>
