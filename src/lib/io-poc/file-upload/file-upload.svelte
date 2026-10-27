<script lang="ts" module>
  import type { HTMLAttributes } from 'svelte/elements';

  import type {
    FileUploadFileChangeDetails,
    FileUploadFileError,
    FileUploadFileMimeType,
    FileUploadFileRejection,
  } from '@ark-ui/svelte/file-upload';
  import type { Snippet } from 'svelte';

  export type FileUploadAccept =
    | Record<string, string[]>
    | FileUploadFileMimeType
    | FileUploadFileMimeType[];

  export type FileUploadRejectionMessages = Partial<
    Record<FileUploadFileError, string>
  >;

  export interface FileUploadProps extends Omit<
    HTMLAttributes<HTMLDivElement>,
    'class' | 'children' | 'id'
  > {
    files?: File[];
    label: string;
    labelHidden?: boolean;
    error?: string;
    invalid?: boolean;
    required?: boolean;
    disabled?: boolean;
    readOnly?: boolean;
    accept?: FileUploadAccept;
    maxFiles?: number;
    maxFileSize?: number;
    minFileSize?: number;
    directory?: boolean;
    dropzoneLabel?: string;
    dropzoneHint?: string;
    triggerLabel?: string;
    removeLabel?: (file: File) => string;
    clearLabel?: string;
    rejectionMessages?: FileUploadRejectionMessages;
    dropzone?: Snippet;
    id?: string;
    name?: string;
    class?: string;
    onFileChange?: (details: FileUploadFileChangeDetails) => void;
    onFileReject?: (rejections: FileUploadFileRejection[]) => void;
  }
</script>

<script lang="ts">
  import { FileUpload as ArkFileUpload } from '@ark-ui/svelte/file-upload';

  import { IconClose, IconFileImport, IconUpload } from '$lib/io/icon';
  import { Button } from '$lib/io-poc/button';
  import {
    fieldLabelRecipe,
    FieldMessages,
    fieldRequiredIndicatorRecipe,
    getFieldMessageIds,
  } from '$lib/io-poc/field';

  import {
    fileUploadDropzoneRecipe,
    fileUploadIconButtonRecipe,
    fileUploadItemGroupRecipe,
    fileUploadItemIconRecipe,
    fileUploadItemNameRecipe,
    fileUploadItemRecipe,
    fileUploadItemSizeRecipe,
    fileUploadRecipe,
  } from './recipe';

  const generatedId = $props.id();
  let {
    files = $bindable([]),
    label,
    labelHidden = false,
    error = '',
    invalid,
    required = false,
    disabled = false,
    readOnly = false,
    accept,
    maxFiles = 1,
    maxFileSize,
    minFileSize,
    directory = false,
    dropzoneLabel = 'Drag and drop files here',
    dropzoneHint = '',
    triggerLabel = 'Choose files',
    removeLabel = (file) => `Remove ${file.name}`,
    clearLabel = 'Remove all files',
    rejectionMessages = {},
    dropzone,
    id = generatedId,
    name,
    class: className,
    onFileChange,
    onFileReject,
    ...rest
  }: FileUploadProps = $props();

  let rejections = $state<FileUploadFileRejection[]>([]);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round((bytes / (1024 * 1024)) * 10) / 10} MB`;
  };

  const defaultMessages = $derived<Record<string, string>>({
    TOO_MANY_FILES:
      maxFiles === 1
        ? 'Upload one file at a time.'
        : `Upload up to ${maxFiles} files.`,
    FILE_INVALID_TYPE: 'This file type is not supported.',
    FILE_TOO_LARGE: maxFileSize
      ? `Files must be ${formatBytes(maxFileSize)} or smaller.`
      : 'This file is too large.',
    FILE_TOO_SMALL: minFileSize
      ? `Files must be at least ${formatBytes(minFileSize)}.`
      : 'This file is too small.',
    FILE_INVALID: 'This file is not valid.',
    FILE_EXISTS: 'This file has already been added.',
  });

  const messageFor = (code: FileUploadFileError) =>
    rejectionMessages[code] ?? defaultMessages[code] ?? code;

  const rejectionErrors = $derived(
    rejections.map(
      (rejection) =>
        `${rejection.file.name}: ${rejection.errors.map(messageFor).join(' ')}`,
    ),
  );

  const isInvalid = $derived(
    invalid ?? (!!error || rejectionErrors.length > 0),
  );
  const hasErrorText = $derived(
    isInvalid && (!!error || rejectionErrors.length > 0),
  );
  const messageIds = $derived(
    getFieldMessageIds(id, {
      showError: hasErrorText,
      errorFirst: true,
    }),
  );
  const hintId = $derived(`${id}-dropzone-hint`);
  const dropzoneDescribedBy = $derived(
    [(dropzone || dropzoneHint) && hintId, messageIds.describedBy]
      .filter(Boolean)
      .join(' ') || undefined,
  );
  const isInteractive = $derived(!disabled && !readOnly);

  function handleFileChange(details: FileUploadFileChangeDetails) {
    rejections = details.rejectedFiles;
    if (details.rejectedFiles.length > 0) onFileReject?.(details.rejectedFiles);
    onFileChange?.(details);
  }
</script>

<ArkFileUpload.Root
  {id}
  bind:acceptedFiles={files}
  {name}
  {accept}
  {maxFiles}
  {maxFileSize}
  {minFileSize}
  {directory}
  {required}
  {disabled}
  {readOnly}
  invalid={isInvalid}
  translations={{ dropzone: dropzoneLabel, deleteFile: removeLabel }}
  onFileChange={handleFileChange}
  class={fileUploadRecipe(className)}
  {...rest}
>
  <ArkFileUpload.Label class={fieldLabelRecipe({ hidden: labelHidden })}>
    {label}
    {#if required}
      <span aria-hidden="true" class={fieldRequiredIndicatorRecipe()}>*</span>
    {/if}
  </ArkFileUpload.Label>
  <ArkFileUpload.Dropzone
    class={fileUploadDropzoneRecipe()}
    aria-describedby={dropzoneDescribedBy}
    data-track-name="file-upload"
    data-track-intent="upload"
    data-track-text={label}
  >
    {#if dropzone}
      <span id={hintId} class="contents">{@render dropzone()}</span>
    {:else}
      <IconUpload width={24} height={24} class="text-secondary" />
      <span class="font-medium text-primary">{dropzoneLabel}</span>
      {#if dropzoneHint}<span id={hintId} class="text-xs">{dropzoneHint}</span
        >{/if}
    {/if}
  </ArkFileUpload.Dropzone>
  {#if isInteractive}
    <div class="flex items-center gap-2">
      <ArkFileUpload.Trigger>
        {#snippet asChild(props)}
          <Button
            {...props() as Record<string, unknown>}
            colorScheme="secondary"
            size="sm"
            LeadingIcon={IconFileImport}
            tracking={false}>{triggerLabel}</Button
          >
        {/snippet}
      </ArkFileUpload.Trigger>
      {#if files.length > 1}
        <ArkFileUpload.ClearTrigger>
          {#snippet asChild(props)}
            <Button
              {...props() as Record<string, unknown>}
              colorScheme="ghost"
              size="sm"
              tracking={false}>{clearLabel}</Button
            >
          {/snippet}
        </ArkFileUpload.ClearTrigger>
      {/if}
    </div>
  {/if}
  <ArkFileUpload.ItemGroup class={fileUploadItemGroupRecipe()}>
    {#each files as file (`${file.name}-${file.size}-${file.lastModified}`)}
      <ArkFileUpload.Item {file} class={fileUploadItemRecipe()}>
        <span class={fileUploadItemIconRecipe()} aria-hidden="true">
          <IconFileImport width={16} height={16} />
        </span>
        <span class="flex min-w-0 flex-1 flex-col">
          <ArkFileUpload.ItemName class={fileUploadItemNameRecipe()} />
          <ArkFileUpload.ItemSizeText class={fileUploadItemSizeRecipe()} />
        </span>
        {#if isInteractive}
          <ArkFileUpload.ItemDeleteTrigger class={fileUploadIconButtonRecipe()}>
            <IconClose width={16} height={16} />
          </ArkFileUpload.ItemDeleteTrigger>
        {/if}
      </ArkFileUpload.Item>
    {/each}
  </ArkFileUpload.ItemGroup>
  <FieldMessages ids={messageIds} showError={hasErrorText}>
    {#snippet errorContent()}
      {#if error}<p>{error}</p>{/if}
      {#each rejectionErrors as message, index (index)}<p>{message}</p>{/each}
    {/snippet}
  </FieldMessages>
  <ArkFileUpload.HiddenInput />
</ArkFileUpload.Root>
