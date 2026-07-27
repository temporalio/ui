<script lang="ts">
  import Button, {
    type ButtonWithoutHrefProps,
  } from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';

  type Props = ButtonWithoutHrefProps & {
    value: string;
    onGenerate?: (value: string) => void;
  };

  let { value = $bindable(), onGenerate, ...rest }: Props = $props();

  const generate = () => {
    value = crypto.randomUUID();
    onGenerate?.(value);
  };
</script>

<Button variant="secondary" leadingIcon="retry" on:click={generate} {...rest}>
  {translate('common.random-uuid')}
</Button>
