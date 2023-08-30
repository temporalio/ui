<script lang="ts">
  import Box from './box-with-translate.svelte';
</script>

<Box
  as="section"
  namespace="workflows"
  translation="activity-id"
  let:translation
>
  <p>{translation}</p>
</Box>
