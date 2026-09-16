<script lang="ts">
  interface Props {
    content: string;
    label?: string;
  }

  let { content, label }: Props = $props();
</script>

<pre data-testid="terraform-code-block" aria-label={label}>{content}</pre>
