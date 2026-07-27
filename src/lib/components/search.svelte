<script lang="ts">
  import kebabCase from 'kebab-case';

  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    placeholder?: string;
    label?: string;
    value?: string;
    name?: string;
    icon?: boolean;
    id?: string;
    'data-testid'?: string;
    oninput?: (e: Event) => void;
    onsubmit?: (e: SubmitEvent) => void;
  }

  let {
    placeholder = `${translate('common.search')}…`,
    label = translate('common.search'),
    value = $bindable(''),
    name = 'query',
    icon = false,
    id = kebabCase(`${label}-${name}`),
    'data-testid': dataTestId,
    oninput,
    onsubmit,
  }: Props = $props();

  const testId = $derived(dataTestId || id);
</script>

<form
  onsubmit={(e) => {
    e.preventDefault();
    onsubmit?.(e);
  }}
  role="search"
  class="flex items-center"
  data-testid={`${testId}-form`}
>
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
    data-testid={`${testId}-input`}
    {oninput}
  >
    {#snippet afterInput()}
      <Button type="submit" data-testid={`${testId}-button`}>
        {label}
      </Button>
    {/snippet}
  </Input>
</form>
