<script lang="ts" module>
  import type { Meta } from '@storybook/svelte';

  import type { Props } from '$lib/holocene/code-block.svelte';
  import CodeBlock from '$lib/holocene/code-block.svelte';

  export const meta = {
    title: 'Code Block',
    args: {
      editable: false,
      inline: false,
      language: 'json',
      copyable: false,
      label: 'JSON content',
    },
    argTypes: {
      editable: {
        control: 'boolean',
        table: { category: 'Properties' },
      },
      inline: {
        control: 'boolean',
        table: { category: 'Properties' },
      },
      copyable: {
        control: 'boolean',
        table: { category: 'Properties' },
      },
      content: {
        control: 'text',
        table: { category: 'Content' },
      },
      language: {
        control: 'select',
        options: [
          'json',
          'shell',
          'text',
          'java',
          'python',
          'go',
          'php',
          'dotnet',
          'ruby',
          'typescript',
        ],
        table: { category: 'Content' },
      },
      minHeight: {
        control: { type: 'number', min: 0, max: 9999, step: 1 },
        table: { category: 'Size' },
      },
      maxHeight: {
        control: { type: 'number', min: 0, max: 9999, step: 1 },
        table: { category: 'Size' },
      },
      copyIconTitle: {
        control: 'text',
        table: { category: 'Copy Icon' },
      },
      copySuccessIconTitle: {
        control: 'text',
        table: { category: 'Copy Icon' },
      },
    },
  } satisfies Meta<Props>;
</script>

<script lang="ts">
  import { action } from '@storybook/addon-actions';
  import { Story, Template } from '@storybook/addon-svelte-csf';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { stringifyWithBigInt } from '$lib/utilities/parse-with-big-int';

  const content = {
    'File A': 'console.log("***");',
    'File B': 'console.log("***");',
  };

  let activeTab = $state('File A');
  let hidden = $state(true);

  let editableContent = $state(
    stringifyWithBigInt({ hello: 'world' }, null, 2),
  );

  const handleEditableChange = (text: string) => {
    editableContent = text;
    action('change')(text);
  };
</script>

<Template let:args>
  <CodeBlock {...args} onchange={action('change')} />
</Template>

<Template id="editable" let:args>
  <CodeBlock
    {...args}
    content={editableContent}
    onchange={handleEditableChange}
  />
</Template>

<Story
  name="Default"
  args={{
    content: stringifyWithBigInt({ hello: 'world' }, null, 2),
  }}
/>

<Story
  name="Editable"
  template="editable"
  args={{
    editable: true,
  }}
/>

<Story
  name="Inline"
  args={{
    inline: true,
    content: stringifyWithBigInt({ hello: 'world' }, null, 2),
  }}
/>

<Story
  name="Copyable"
  args={{
    copyable: true,
    content: stringifyWithBigInt({ hello: 'world' }, null, 2),
    copyIconTitle: 'Click to copy content',
    copySuccessIconTitle: 'Content copied to clipboard',
  }}
/>

<Story
  name="Minimum Height"
  args={{
    minHeight: 400,
    content: stringifyWithBigInt({ hello: 'world' }, null, 2),
  }}
/>

<Story
  name="Maximum Height"
  args={{
    maxHeight: 100,
    content: stringifyWithBigInt(
      Object.getOwnPropertyDescriptors(Array.prototype),
      null,
      2,
    ),
  }}
/>

<Story
  name="Copyable (Maximum Height)"
  args={{
    maxHeight: 100,
    content: stringifyWithBigInt(
      Object.getOwnPropertyDescriptors(Array.prototype),
      null,
      2,
    ),
    copyable: true,
    copyIconTitle: 'Click to copy content',
    copySuccessIconTitle: 'Content copied to clipboard',
  }}
/>

<Story
  name="Shell"
  args={{
    language: 'shell',
    content: 'echo "Hello, World!"',
  }}
/>

<Story
  name="Copyable (Shell)"
  args={{
    language: 'shell',
    copyable: true,
    content: 'echo "Hello, World!"',
    copyIconTitle: 'Click to copy content',
    copySuccessIconTitle: 'Content copied to clipboard',
  }}
/>

<Story
  name="Text"
  args={{
    language: 'text',
    content: 'Hello, World!',
  }}
/>

<Story
  name="Copyable (Text)"
  args={{
    language: 'text',
    copyable: true,
    content: 'Hello, World!',
    copyIconTitle: 'Click to copy content',
    copySuccessIconTitle: 'Content copied to clipboard',
  }}
/>

<Story
  name="Java"
  args={{
    language: 'java',
    content: `// Initialize client connection
    WorkflowServiceStubs service =
        WorkflowServiceStubs.newServiceStubs(
            WorkflowServiceStubsOptions.newBuilder()
                .addApiKey(
                    () ->
                        "<APIKey>")
                .setTarget("<endpoint>")
                .setEnableHttps(true)
                ...
                .build());

    WorkflowClient client =
        WorkflowClient.newInstance(
            service, WorkflowClientOptions.newBuilder().setNamespace("<namespace_id>.<account_id>").build());
`,
  }}
/>

<Story
  name="Typescript"
  args={{
    language: 'typescript',
    content: `// Initialize client connection
const connection = await Connection.connect({
    address: "<endpoint>",
    tls: true,
    apiKey: "<APIKey>",
});
const client = new Client({
    connection,
    namespace: "<namespace_id>.<account_id>",
});
`,
  }}
/>

<Story
  name="Python"
  args={{
    language: 'python',
    content: `# stuff
client = await Client.connect(
    "<endpoint>",
    namespace="<namespace_id>.<account_id>",
    api_key="<APIKey>",
    tls=True,
)`,
  }}
/>

<Story
  name="Ruby"
  args={{
    language: 'ruby',
    content: `# Initialize client connection
client = Temporalio::Client.connect(
  "<endpoint>",
  "<namespace_id>.<account_id>",
  api_key: "<APIKey>",
  tls: true
)
`,
  }}
/>

<Story
  name="Go"
  args={{
    language: 'go',
    content: `// Initialize client connection
clientOptions := client.Options{
    HostPort: "<endpoint>",
    Namespace: "<namespace_id>.<account_id>",
    ConnectionOptions: client.ConnectionOptions{TLS: &tls.Config{}},
    Credentials: client.NewAPIKeyStaticCredentials("<APIKey>"),
}
c, err := client.Dial(clientOptions)
`,
  }}
/>

<Story
  name=".NET"
  args={{
    language: 'dotnet',
    content: `// Initialize client connection
var myClient = TemporalClient.ConnectAsync(new("<endpoint>")
{
    Namespace = "<namespace_id>.<account_id>",
    ApiKey = "<APIKey>",
    Tls = new(),
});
`,
  }}
/>

<Story name="With Header">
  <CodeBlock
    copyable
    language="typescript"
    tabs={['File A', 'File B']}
    bind:activeTab
    content={hidden
      ? content[activeTab]
      : content[activeTab].replace('***', 'secret')}
  >
    {#snippet headerActions()}
      <button onclick={() => (hidden = !hidden)}>
        {#if hidden}
          <Icon name="eye-show" />
        {:else}
          <Icon name="eye-hide" />
        {/if}
      </button>
    {/snippet}
  </CodeBlock>
</Story>
