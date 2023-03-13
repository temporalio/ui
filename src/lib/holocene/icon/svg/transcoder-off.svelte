<script lang="ts">
  import Svg from './svg.svelte';
</script>

<Svg {...$$props}>
  <path
    d="M20.5 6.5L12 2.5L3.5 6.5C3.5 17.5 12 21.5 12 21.5C12 21.5 20.5 17.5 20.5 6.5Z"
    stroke="currentcolor"
  />
  <path d="M9.5 9L14.5 14M14.5 9L9.5 14" stroke="currentcolor" />
</Svg>
