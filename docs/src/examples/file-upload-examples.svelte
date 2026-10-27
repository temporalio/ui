<script lang="ts">
  import { FileUpload } from '$lib/io-poc/file-upload';

  let history = $state<File[]>([]);
  let certificates = $state<File[]>([]);
</script>

<div class="grid gap-6 rounded-lg border border-primary p-6 md:grid-cols-2">
  <FileUpload
    label="Workflow history"
    bind:files={history}
    accept="application/json"
    maxFileSize={10 * 1024 * 1024}
    dropzoneLabel="Drop a history export here"
    dropzoneHint="JSON, up to 10 MB"
    triggerLabel="Choose file"
  />
  <FileUpload
    label="TLS certificates"
    bind:files={certificates}
    accept={{ 'application/x-pem-file': ['.pem'] }}
    maxFiles={2}
    required
    dropzoneLabel="Drop certificate files here"
    dropzoneHint="A client certificate and key, .pem only"
    rejectionMessages={{
      FILE_INVALID_TYPE: 'Certificates must be .pem files.',
      TOO_MANY_FILES: 'Upload one certificate and one key.',
    }}
  />
  <FileUpload
    label="CA bundle"
    disabled
    dropzoneLabel="Uploads are turned off"
    dropzoneHint="Your account owner manages the CA bundle for this namespace."
    class="md:col-span-2"
  />
</div>
