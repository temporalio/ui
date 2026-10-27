<script lang="ts">
  import { MenuItem } from '$lib/holocene/menu';
  import SplitButton from '$lib/holocene/split-button.svelte';
  import { IconCheckmark, IconCopy } from '$lib/io/icon';

  import type { ComponentDocumentation } from '../data/components';

  let { component }: { component: ComponentDocumentation } = $props();
  const id = $props.id();
  let copied = $state(false);
  let copying = $state(false);
  let status = $state('');
  let error = $state(false);

  $effect(() => {
    void component.slug;
    copied = false;
    status = '';
    error = false;
  });

  async function copyPage() {
    if (copying) return;
    copying = true;
    copied = false;
    error = false;
    status = '';
    try {
      await navigator.clipboard.writeText(component.markdown);
      copied = true;
      status = `${component.name} Markdown copied.`;
    } catch {
      error = true;
      status =
        'Could not copy. Use View as markdown to select and copy the text.';
    } finally {
      copying = false;
    }
  }
</script>

<div class="shrink-0">
  <SplitButton
    id="page-actions-{id}"
    label={copied ? 'Copied' : 'Copy page'}
    menuLabel="Page actions"
    position="right"
    Icon={copied ? IconCheckmark : IconCopy}
    primaryActionDisabled={copying}
    onclick={copyPage}
    class="inline-block"
    menuClass="w-64"
  >
    <MenuItem href="/components/{component.slug}.md" newTab>
      View as markdown
    </MenuItem>
  </SplitButton>
  <p role="status" class:sr-only={!error} class="mt-2 text-xs text-secondary">
    {status}
  </p>
</div>
