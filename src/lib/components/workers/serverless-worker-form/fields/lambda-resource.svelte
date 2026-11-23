<!-- Where the Lambda function to invoke lives. -->
<script lang="ts">
  import Button from '$lib/holocene/button.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { translate } from '$lib/i18n/translate';
  import { IconExternalLinkOptical } from '$lib/io/icon';

  import type { ComputeSectionProps } from './types';

  let {
    values = $bindable(),
    errors,
    fieldId,
    resourcePlaceholder,
  }: ComputeSectionProps = $props();
</script>

<div class="flex flex-wrap items-start gap-4 [&>:not(:first-child)]:mt-7">
  <Input
    bind:value={values.lambdaArn}
    id={fieldId('lambdaArn')}
    name={fieldId('lambdaArn')}
    spellcheck={false}
    label={translate('workers.lambda-arn-label')}
    hintText={errors.lambdaArn?.[0]}
    error={!!errors.lambdaArn?.[0]}
    placeholder={resourcePlaceholder}
    required
    class="flex-1"
  />
  <Button
    variant="tertiary"
    type="button"
    href="https://console.aws.amazon.com/lambda"
    target="_blank"
    TrailingIcon={IconExternalLinkOptical}
  >
    {translate('workers.open-lambda-console')}
  </Button>
</div>
