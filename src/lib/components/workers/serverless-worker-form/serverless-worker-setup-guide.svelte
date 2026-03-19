<script lang="ts">
  import Card from '$lib/holocene/card.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { Timeline, TimelineStep } from '$lib/holocene/timeline';
  import { translate } from '$lib/i18n/translate';

  let activeTab = $state('CloudFormation');

  const cfnSnippet = `AWSTemplateFormatVersion: '2010-09-09'
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
      Policies:
        - PolicyName: InvokeLambda
          PolicyDocument:
            Version: '2012-10-17'
            Statement:
              - Effect: Allow
                Action: lambda:InvokeFunction
                Resource: '*'`;

  const terraformSnippet = `resource "aws_iam_role" "temporal_worker" {
  name = "temporal-serverless-worker"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = { Service = "temporal.io" }
      Action = "sts:AssumeRole"
    }]
  })
}

resource "aws_iam_role_policy" "invoke_lambda" {
  name = "invoke-lambda"
  role = aws_iam_role.temporal_worker.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect   = "Allow"
      Action   = "lambda:InvokeFunction"
      Resource = "*"
    }]
  })
}`;

  const snippetContent = $derived(
    activeTab === 'CloudFormation' ? cfnSnippet : terraformSnippet,
  );
  const snippetLanguage = 'text' as const;
</script>

<Card class="sticky top-16">
  <h3 class="mb-4 text-base font-semibold">
    {translate('workers.setup-guide-title')}
  </h3>
  <Timeline>
    <TimelineStep step={1} title={translate('workers.setup-step-setup')}>
      <p class="mt-1 text-sm text-secondary">
        {translate('workers.setup-guide-intro')}
      </p>
      <div class="mt-3 flex flex-col gap-2">
        <a
          href="https://console.aws.amazon.com/lambda"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:surface-interactive-hover flex items-center justify-between border border-subtle px-3 py-2 text-sm font-medium"
        >
          {translate('workers.setup-guide-lambda-console')}
          <Icon name="external-link" class="h-4 w-4" />
        </a>
        <a
          href="https://console.aws.amazon.com/iam"
          target="_blank"
          rel="noopener noreferrer"
          class="hover:surface-interactive-hover flex items-center justify-between border border-subtle px-3 py-2 text-sm font-medium"
        >
          {translate('workers.setup-guide-iam-console')}
          <Icon name="external-link" class="h-4 w-4" />
        </a>
      </div>
    </TimelineStep>
    <TimelineStep step={2} title={translate('workers.setup-step-templates')}>
      <p class="mt-1 text-sm text-secondary">
        {translate('workers.setup-guide-iam-note')}
      </p>
      <div class="mt-3">
        <CodeBlock
          tabs={['CloudFormation', 'Terraform']}
          bind:activeTab
          content={snippetContent}
          language={snippetLanguage}
          copyable
          copyIconTitle="Copy snippet"
          copySuccessIconTitle="Copied!"
        />
      </div>
    </TimelineStep>
  </Timeline>
</Card>
