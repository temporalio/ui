<script lang="ts">
  let {
    content,
    frameId = '',
    class: className = '',
  }: {
    content: string;
    frameId?: string;
    class?: string;
  } = $props();
</script>

<div id={frameId} class={className} data-testid="markdown-preview-test-double">
  {content}
</div>
