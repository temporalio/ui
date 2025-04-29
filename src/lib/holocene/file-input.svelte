<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { toaster } from '$lib/stores/toaster';

  export let id: string;
  export let accept = '.json';
  export let onUpload: (input: string) => void;

  const onFileSelect = (e: Event) => {
    const target = e.target as HTMLInputElement;
    const file = target?.files?.[0];
    const reader = new FileReader();
    if (file) {
      reader.readAsText(file);
      reader.onload = () => {
        try {
          const result = reader?.result?.toString() ?? '';
          onUpload(result);
        } catch (e) {
          toaster.push({
            variant: 'error',
            message: translate('common.upload-error'),
          });
        }
      };
    }
  };
</script>

<label
  for={id}
  class="file-upload-label surface-primary border-subtle text-primary hover:surface-interactive-secondary focus-visible:surface-interactive-secondary focus-visible:ring-primary/70 relative flex h-10 w-fit cursor-pointer items-center justify-center border px-4 py-2 text-base"
>
  <Icon name="upload" />
</label>
<input {id} class="hidden" type="file" {accept} on:change={onFileSelect} />

<style lang="postcss">
  @reference "tailwindcss";

  /* File upload label styles moved to inline */
</style>
