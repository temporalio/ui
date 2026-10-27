<script lang="ts">
  import Checkbox from '$lib/holocene/checkbox.svelte';
  import Input from '$lib/holocene/input/input.svelte';
  import { FileUpload } from '$lib/io-ark/file-upload';

  import FileUploadExamples from '../../../examples/file-upload-examples.svelte';
  import examplesSource from '../../../examples/file-upload-examples.svelte?raw';

  import ComponentPage from '$docs/components/component-page.svelte';
  import Playground from '$docs/components/playground.svelte';
  import SelectControl from '$docs/components/select-control.svelte';
  import { getComponentDocumentation } from '$docs/data/components';

  const documentation = getComponentDocumentation('file-upload');

  const acceptOptions = ['any', 'application/json', 'text/csv'] as const;

  let label = $state('Workflow inputs');
  let dropzoneLabel = $state('Drag and drop files here');
  let dropzoneHint = $state('JSON, up to 1 MB each');
  let error = $state('');
  let accept = $state<(typeof acceptOptions)[number]>('application/json');
  let maxFiles = $state('3');
  let limitSize = $state(true);
  let required = $state(false);
  let disabled = $state(false);
  let files = $state<File[]>([]);

  const maxFilesValue = $derived(Math.max(1, Number(maxFiles) || 1));
  const acceptValue = $derived(accept === 'any' ? undefined : accept);

  const attribute = (name: string, text: string) =>
    text ? `\n  ${name}={${JSON.stringify(text)}}` : '';
  const flag = (name: string, enabled: boolean) =>
    enabled ? `\n  ${name}` : '';

  const source = $derived(
    `<script lang="ts">
  import { FileUpload } from '$lib/io-ark/file-upload';
  let files = $state<File[]>([]);
</` +
      `script>

<FileUpload
  label={${JSON.stringify(label)}}
  bind:files${acceptValue ? `\n  accept="${acceptValue}"` : ''}${maxFilesValue !== 1 ? `\n  maxFiles={${maxFilesValue}}` : ''}${limitSize ? '\n  maxFileSize={1024 * 1024}' : ''}${attribute('dropzoneLabel', dropzoneLabel)}${attribute('dropzoneHint', dropzoneHint)}${attribute('error', error)}${flag('required', required)}${flag('disabled', disabled)}
/>`,
  );

  const anatomyFiles = [
    new File(['{"events":[]}'], 'history.json', { type: 'application/json' }),
  ];
</script>

<ComponentPage
  component={documentation}
  examples={FileUploadExamples}
  {examplesSource}
>
  <Playground {source} filename="FileUpload.svelte">
    {#snippet preview()}
      <div class="w-full max-w-md">
        <FileUpload
          id="file-upload-preview"
          {label}
          bind:files
          accept={acceptValue}
          maxFiles={maxFilesValue}
          maxFileSize={limitSize ? 1024 * 1024 : undefined}
          {dropzoneLabel}
          {dropzoneHint}
          {error}
          {required}
          {disabled}
        />
        <p role="status" class="mt-4 text-xs text-secondary">
          {files.length}
          {files.length === 1 ? 'file' : 'files'} accepted
        </p>
      </div>
    {/snippet}
    {#snippet controls()}
      <Input id="file-upload-label" label="Label" bind:value={label} />
      <Input
        id="file-upload-dropzone-label"
        label="Dropzone label"
        bind:value={dropzoneLabel}
      />
      <Input
        id="file-upload-dropzone-hint"
        label="Dropzone hint"
        bind:value={dropzoneHint}
      />
      <Input id="file-upload-error" label="Error" bind:value={error} />
      <SelectControl
        id="file-upload-accept"
        label="Accept"
        options={acceptOptions}
        bind:value={accept}
      />
      <Input
        id="file-upload-max-files"
        label="Max files"
        bind:value={maxFiles}
      />
      <Checkbox
        id="file-upload-limit-size"
        label="Limit to 1 MB"
        bind:checked={limitSize}
      />
      <Checkbox
        id="file-upload-required"
        label="Required"
        bind:checked={required}
      />
      <Checkbox
        id="file-upload-disabled"
        label="Disabled"
        bind:checked={disabled}
      />
    {/snippet}
  </Playground>
  {#snippet anatomy()}
    <div class="w-[360px]">
      <FileUpload
        id="file-upload-anatomy"
        label="Workflow history"
        accept="application/json"
        files={anatomyFiles}
        dropzoneLabel="Drop a history export here"
        dropzoneHint="JSON, up to 10 MB"
        triggerLabel="Choose file"
      />
    </div>
  {/snippet}
</ComponentPage>
