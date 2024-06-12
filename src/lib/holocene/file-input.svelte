<script lang="ts">
  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { toaster } from '$lib/stores/toaster';

  export let id: string;
  export let accept = '.json';
  export let onUpload: (input: string) => void;

  const onFileSelect = async (e: Event) => {
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

<label for={id} class="file-upload-label">
  <Icon name="upload" />
</label>
<input {id} class="hidden" type="file" {accept} on:change={onFileSelect} />

<style lang="postcss">
  .file-upload-label {
    @apply relative flex h-10 w-fit cursor-pointer items-center justify-center rounded-lg border border-secondary px-4 py-2 text-base text-primary transition-shadow hover:surface-interactive-secondary focus-visible:surface-interactive-secondary focus-visible:border-white focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:hover:border-transparent dark:focus-visible:border-black;
  }
</style>
