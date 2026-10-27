---
component: FileUpload
source: ./file-upload.svelte
usedBy: []
status: draft
lastReviewed: 2026-10-27
---

# File Upload contract

Also covers `./recipe.ts`.

Rules below cover only what the types do not express. Already expressed by `FileUploadProps`, so not repeated: that `label` is required and everything else optional; that `files` is bindable and starts empty; the defaults of `maxFiles`, `dropzoneLabel`, `triggerLabel`, `removeLabel` and `clearLabel`; the accepted shapes of `accept`; that `rejectionMessages` is keyed by Ark's file error codes; that native div attributes are forwarded.

## Input

- **IN-1** `label` MUST name what is being uploaded, such as "Workflow history", and SHOULD be translated. `labelHidden` MAY be used only when nearby visible content already names it.
- **IN-2** Callers SHOULD set `accept`, `maxFiles` and `maxFileSize` to the real limits, and MUST describe those limits in text people can read before choosing a file (`dropzoneHint` or `helperText`). The native file picker does not explain them.
- **IN-3** Every text prop is rendered or announced verbatim and SHOULD be translated: `dropzoneLabel`, `dropzoneHint`, `triggerLabel`, `clearLabel`, `removeLabel` and `rejectionMessages`. The defaults are English.
- **IN-4** `files` holds accepted files only. Rejected files never enter `files`; they are reported through `onFileReject` and the error text. The component does not upload anything; the caller owns uploading and its progress.
- **IN-5** `triggerLabel` SHOULD match `maxFiles`: singular ("Choose file") when one file is allowed, plural otherwise. `maxFiles` above 1 lets people select several files at once.
- **IN-6** `error` is for problems the caller detects, such as a server rejecting the file. Problems the component detects (type, size, count) MUST be described through `rejectionMessages`, not duplicated in `error`.
- **IN-7** `class` is merged last onto the root through `twMerge` in `fileUploadRecipe`. It MAY set layout, such as a grid column span. It does not reach the dropzone, so it MUST NOT be used to restyle it.

## Behavior

- **BEH-1** People can drop files on the dropzone, activate it, or use the Choose button; all three open the same validation. Each rejected file is listed in the error text as "name: message", using `rejectionMessages` first and a readable default otherwise. The list is replaced on the next selection.
- **BEH-2** Rejections mark the upload invalid until the next selection, and call `onFileReject`. `onFileChange` is called on every change with both accepted and rejected files.
- **BEH-3** `disabled` and `readOnly` hide the Choose button and each file's remove button. The "Remove all files" button appears only when more than one file is accepted.
- **BEH-4** A hidden native file input carries the accepted files for form submission under `name`.

## Display

- **DIS-1** The dropzone has a dashed border that highlights while files are dragged over it. Accepted files are listed below it with their name and size.
- **DIS-2** Helper text and error text use the shared field styles (12px, `text-secondary` and `text-danger`).

## Accessibility

- **A11Y-1** The dropzone is a button whose accessible name is `dropzoneLabel` (Ark sets `aria-label` from it). It is described by the helper text and, while shown, the error text. Information people need to choose a file, such as limits, MUST be in `dropzoneLabel` or `helperText`, because other text inside the dropzone is not announced.
- **A11Y-2** Each remove button is an icon button named by `removeLabel(file)`, such as "Remove history.json".
- **A11Y-3** Error text is announced politely (`aria-live="polite"`) when files are rejected.
- **A11Y-4** The required indicator is `aria-hidden`; the hidden input's native `required` carries the meaning.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers pass one, which is forwarded to the root. The dropzone sets `data-track-name="file-upload"`, `data-track-intent="upload"` and `data-track-text` to `label`; tracking attributes MUST NOT be used as test selectors.

## Known gaps

Found by reading the code; not run. Fixes MUST satisfy the cited rule.

- **GAP-1** Violates A11Y-1. The dropzone's accessible name comes only from `dropzoneLabel` (`aria-label`), and its `aria-describedby` lists only the helper and error text. Limits written in `dropzoneHint` are visible but never announced. The "TLS certificates" docs example states its limits ("A client certificate and key, .pem only") only in `dropzoneHint` (`docs/src/examples/file-upload-examples.svelte`).
- **GAP-2** Violates IN-5 by default. `triggerLabel` defaults to the plural "Choose files" while `maxFiles` defaults to 1 (`file-upload.svelte`). Callers that rely on the defaults get a label that promises several files. The "Workflow history" example works around it with `triggerLabel="Choose file"`.

## Decisions

- **DEC-1** Open. Should `dropzoneHint` be linked to the dropzone with `aria-describedby`, which would resolve GAP-1 inside the component, or should limits move to `helperText`?

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
