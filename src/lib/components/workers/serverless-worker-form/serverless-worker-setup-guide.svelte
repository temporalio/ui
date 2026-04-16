<script lang="ts">
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Link from '$lib/holocene/link.svelte';
  import TimelineStep from '$lib/holocene/timeline/timeline-step.svelte';
  import Timeline from '$lib/holocene/timeline/timeline.svelte';
  import { translate } from '$lib/i18n/translate';

  interface Props {
    cfnTemplate?: string;
  }

  let { cfnTemplate }: Props = $props();

  const defaultCfnTemplate = `AWSTemplateFormatVersion: '2010-09-09'
Resources:
  TemporalWorkerRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Version: '2012-10-17'
        Statement:
          - Effect: Allow
            Principal:
              Service: temporal.io
            Action: sts:AssumeRole
            Condition:
              StringEquals:
                sts:ExternalId: <your-external-id>
      Policies:
        - PolicyName: InvokeLambda
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action: lambda:InvokeFunction
                Resource: '*'`;

  const snippetContent = $derived(cfnTemplate ?? defaultCfnTemplate);
</script>

<h3 class="mb-4 text-base font-semibold">
  {translate('workers.setup-guide-title')}
</h3>
<Timeline>
  <TimelineStep step={1} title={translate('workers.setup-step-setup')}>
    <p class="mt-1 text-sm text-secondary">
      {translate('workers.setup-guide-intro')}
    </p>
    <div class="mt-3 flex flex-col gap-2">
      <Link href="https://console.aws.amazon.com/lambda" newTab>
        {translate('workers.setup-guide-lambda-console')}
      </Link>
      <Link href="https://console.aws.amazon.com/iam" newTab>
        {translate('workers.setup-guide-iam-console')}
      </Link>
    </div>
  </TimelineStep>
  <TimelineStep step={2} title={translate('workers.setup-step-templates')}>
    <p class="mt-1 text-sm text-secondary">
      {translate('workers.setup-guide-iam-note')}
    </p>
    <div class="mt-3">
      <CodeBlock
        content={snippetContent}
        language="text"
        copyable
        copyIconTitle={translate('workers.copy-snippet')}
        copySuccessIconTitle={translate('workers.copied')}
      />
    </div>
  </TimelineStep>
</Timeline>
