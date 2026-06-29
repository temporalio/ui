<script lang="ts">
  import { twMerge } from 'tailwind-merge';

  import Icon from '$lib/holocene/icon/icon.svelte';
  import { translate } from '$lib/i18n/translate';
  import { toaster } from '$lib/stores/toaster';

  type Props = {
    id: string;
    accept?: string;
    onUpload: (input: string) => void;
    class?: string;
  };

  let { id, accept = '.json', onUpload, class: className }: Props = $props();

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
        } catch {
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
  class={twMerge(
    'surface-primary relative flex h-10 w-fit cursor-pointer items-center justify-center border border-subtle px-4 py-2 text-base text-primary hover:surface-interactive-secondary focus-visible:surface-interactive-secondary focus-visible:ring-primary/70',
    className,
  )}
>
  <Icon name="upload" />
</label>
<input {id} class="hidden" type="file" {accept} onchange={onFileSelect} />
