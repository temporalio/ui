<script lang="ts">
  import Svg from './svg.svelte';
</script>

<Svg {...$$props}>
  <path d="M4.75 8H7.25" stroke="currentcolor" />
  <path d="M12.75 8H19.25" stroke="currentcolor" />
  <path d="M4.75 16H12.25" stroke="currentcolor" />
  <path d="M17.75 16H19.25" stroke="currentcolor" />
  <path
    d="M 10, 8 m -1, 0 a 1,1 0 1,0 2.25,0 a 1,1 0 1,0 -2.25,0"
    stroke="currentcolor"
  />
  <path
    d="M 15, 16 m -1, 0 a 1,1 0 1,0 2.25,0 a 1,1 0 1,0 -2.25,0"
    stroke="currentcolor"
  />
</Svg>
