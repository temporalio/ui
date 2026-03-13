<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <path
    d="M5.5 12C5.5 8.68629 8.41015 6 12 6C15.5899 6 18.5 8.68629 18.5 12"
    stroke="currentcolor"
    stroke-width="1.5"
  />
  <path
    d="M20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12"
    stroke="currentcolor"
    stroke-width="1.5"
  />
  <path d="M20 12L4 12" stroke="currentcolor" stroke-width="1.5" />
  <path d="M12 4L12 12" stroke="currentcolor" stroke-width="1.5" />
</Svg>
