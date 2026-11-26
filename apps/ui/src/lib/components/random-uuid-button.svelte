<script lang="ts">
  import Button, {
    type ButtonWithoutHrefProps,
  } from '$lib/holocene/button.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconRetry } from '$lib/io/icon';

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

<Button
  variant="secondary"
  LeadingIcon={IconRetry}
  onclick={generate}
  {...rest}
>
  {translate('common.random-uuid')}
</Button>
