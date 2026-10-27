# File Upload

Let people choose files from their device or drop them onto the page.

## Anatomy

A file upload pairs a dropzone and button with a list of accepted files.

- **Root** `[data-scope="file-upload"][data-part="root"]`: Groups the label, dropzone, file list, and messages.
  - **Label** `[data-scope="file-upload"][data-part="label"]` (left): Names the upload. Includes the required indicator.
  - **Dropzone** `[data-scope="file-upload"][data-part="dropzone"]` (left): The area people drop files onto, with its label and hint.
  - **Trigger** `[data-scope="file-upload"][data-part="trigger"]` (right): The button that opens the file picker.
  - **Item** `[data-scope="file-upload"][data-part="item"]` (left): One accepted file.
  - **Item name** `[data-scope="file-upload"][data-part="item-name"]` (right): The file name, with its size below.
  - **Item delete trigger** `[data-scope="file-upload"][data-part="item-delete-trigger"]` (right): Removes the file.

## Examples

Use a file upload to import a workflow history or attach certificates. Limit the
accepted types, the number of files, and their size. Files that do not meet the
limits are listed in the error message with the reason.

## Usage

### Import

```svelte
<script lang="ts">
  import { FileUpload } from '$lib/io-poc/file-upload';
  let files = $state<File[]>([]);
</script>

<FileUpload
  label="Workflow history"
  accept="application/json"
  bind:files
  dropzoneHint="JSON, up to 10 MB"
  maxFileSize={10 * 1024 * 1024}
/>
```

Package consumers can import from `@temporalio/ui/io-poc/file-upload`.

### Choosing files

People can drop files on the dropzone, click it or press Enter or Space while it
has focus, or use the "Choose files" button. Accepted files appear in a list below
with their name, size, and a remove button. `files` holds the accepted files.

### Limits

`maxFiles` defaults to 1. Set a higher number to accept several files. `accept`
takes a MIME type such as `application/json`, a list of MIME types, or an object
that maps MIME types to file extensions, such as
`{ 'application/x-pem-file': ['.pem'] }`. Use `maxFileSize` and `minFileSize` in
bytes. Describe the limits in `dropzoneHint` so people know them before they
choose.

### Rejected files

Files that break a limit are not added to `files`. Each rejection is listed in the
error text with a message for its error code. Override the messages with
`rejectionMessages`, keyed by `TOO_MANY_FILES`, `FILE_INVALID_TYPE`,
`FILE_TOO_LARGE`, `FILE_TOO_SMALL`, `FILE_INVALID`, or `FILE_EXISTS`. Use
`onFileReject` to respond to rejections in code.

### Accessibility

The dropzone is a button with the accessible name from `dropzoneLabel`, so keyboard
and screen reader users can open the file dialog without dragging. The dropzone hint and any
error text are linked to it. Each remove button has an accessible label from
`removeLabel`.

### Contract

The rules reviewers check this component against live in `src/lib/io-poc/file-upload/file-upload.contract.md`, next to the source. The Contract section of this page shows them.

## API reference

FileUpload forwards native div attributes to its wrapper.

### FileUpload

| Prop                | Type                                              | Default                    | Description                                                                  |
| ------------------- | ------------------------------------------------- | -------------------------- | ---------------------------------------------------------------------------- |
| `label`             | `string`                                          | `Required`                 | Visible label for the upload.                                                |
| `files`             | `File[] (bindable)`                               | `[]`                       | Accepted files.                                                              |
| `accept`            | `string \| string[] \| Record<string, string[]>`  | `—`                        | Accepted MIME types and extensions.                                          |
| `maxFiles`          | `number`                                          | `1`                        | Maximum number of files.                                                     |
| `maxFileSize`       | `number`                                          | `—`                        | Maximum size of each file in bytes.                                          |
| `minFileSize`       | `number`                                          | `—`                        | Minimum size of each file in bytes.                                          |
| `directory`         | `boolean`                                         | `false`                    | Selects a folder instead of individual files.                                |
| `dropzoneLabel`     | `string`                                          | `Drag and drop files here` | Main dropzone text and its accessible name.                                  |
| `dropzoneHint`      | `string`                                          | `''`                       | Secondary dropzone text describing the limits.                               |
| `dropzone`          | `Snippet`                                         | `—`                        | Replaces the default dropzone content.                                       |
| `triggerLabel`      | `string`                                          | `Choose files`             | Text of the button that opens the file dialog.                               |
| `clearLabel`        | `string`                                          | `Remove all files`         | Text of the button that removes every file, shown for 2 or more.             |
| `removeLabel`       | `(file: File) => string`                          | `Remove {file.name}`       | Accessible label for each remove button.                                     |
| `rejectionMessages` | `Partial<Record<FileUploadFileError, string>>`    | `{}`                       | Messages for rejected files by error code.                                   |
| `labelHidden`       | `boolean`                                         | `false`                    | Visually hides the label while keeping it accessible.                        |
| `error`             | `string`                                          | `''`                       | Error message. A non-empty value marks the upload invalid.                   |
| `invalid`           | `boolean`                                         | `—`                        | Marks the upload invalid. Defaults to true with an error or a rejected file. |
| `required`          | `boolean`                                         | `false`                    | Shows the required indicator and requires a file.                            |
| `disabled`          | `boolean`                                         | `false`                    | Prevents adding or removing files.                                           |
| `readOnly`          | `boolean`                                         | `false`                    | Shows the files but prevents changes.                                        |
| `name`              | `string`                                          | `—`                        | Name used when submitting a form.                                            |
| `id`                | `string`                                          | `Generated`                | Base for the generated element IDs.                                          |
| `onFileChange`      | `(details: FileUploadFileChangeDetails) => void`  | `—`                        | Called with accepted and rejected files after every change.                  |
| `onFileReject`      | `(rejections: FileUploadFileRejection[]) => void` | `—`                        | Called when one or more files are rejected.                                  |
| `class`             | `string`                                          | `—`                        | Additional Tailwind classes on the wrapper.                                  |
