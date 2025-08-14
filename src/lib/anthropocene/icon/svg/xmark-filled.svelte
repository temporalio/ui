<script lang="ts">
  import Svg from '../svg.svelte';
  let props = $props();
</script>

<Svg {...props}>
  <path
    fill-rule="evenodd"
    clip-rule="evenodd"
    d="M12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM18 7.2L17.4 7.8L13.1965 12L17.3965 16.2L17.9965 16.8L16.8 18L16.2 17.4L12 13.1965L7.8 17.3965L7.2 17.9965L6 16.8L6.6 16.2L10.8035 12L6.60353 7.8L6.00353 7.2L7.2 6L7.8 6.6L12 10.8035L16.2 6.60353L16.8 6.00353L18 7.2Z"
    fill="currentcolor"
  />
</Svg>
