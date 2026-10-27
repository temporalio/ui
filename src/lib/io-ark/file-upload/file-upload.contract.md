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
- **IN-2** Callers SHOULD set `accept`, `maxFiles` and `maxFileSize` to the real limits, and MUST describe those limits in `dropzoneHint`, or in the `dropzone` snippet when one is passed, so people can read them before choosing a file. FileUpload has no helper text; guidance and limits belong in the dropzone. The native file picker does not explain them.
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
- **DIS-2** Error text uses the shared field error style (12px, `text-danger`).

## Accessibility

- **A11Y-1** The dropzone is a button whose accessible name is `dropzoneLabel` (Ark sets `aria-label` from it). It is described by `dropzoneHint`, or by the `dropzone` snippet's content when one is passed, and, while shown, by the error text, in that order.
- **A11Y-2** Each remove button is an icon button named by `removeLabel(file)`, such as "Remove history.json".
- **A11Y-3** Error text is announced politely (`aria-live="polite"`) when files are rejected.
- **A11Y-4** The required indicator is `aria-hidden`; the hidden input's native `required` carries the meaning.

## Test hooks

- **TEST-1** The component sets no `data-testid`. Callers pass one, which is forwarded to the root. The dropzone sets `data-track-name="file-upload"`, `data-track-intent="upload"` and `data-track-text` to `label`; tracking attributes MUST NOT be used as test selectors.

## Known gaps

Found by reading the code; not run. Fixes MUST satisfy the cited rule.

- **GAP-2** Violates IN-5 by default. `triggerLabel` defaults to the plural "Choose files" while `maxFiles` defaults to 1 (`file-upload.svelte`). Callers that rely on the defaults get a label that promises several files. The "Workflow history" example works around it with `triggerLabel="Choose file"`.

## Decisions

- **DEC-1** Resolved on 2026-10-27 while fixing GAP-1: `dropzoneHint` is linked to the dropzone with `aria-describedby`, so limits written there are announced without any change from callers. The approach was chosen in implementation; confirm it with design.

## Reconciliation log

- 2026-10-27: First written against the uncommitted working tree, so there is no `sourceCommit` yet. Set it to the commit that adds this component. Product code does not use the component yet; docs examples are its only consumers.
- 2026-10-27: Fixed GAP-1 by linking `dropzoneHint` to the dropzone, which resolves DEC-1; A11Y-1 updated. GAP-2 is unchanged. Covered by `file-upload.svelte.test.ts`.
- 2026-10-27: Removed `helperText`, which repeated `dropzoneHint` now that the hint is announced. The `dropzone` snippet's content is linked like the hint. IN-2, DIS-2 and A11Y-1 updated.
