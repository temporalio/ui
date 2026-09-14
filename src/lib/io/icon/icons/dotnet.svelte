<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M.441 10.5A.435.435 0 0 1 0 10.075q0-.178.129-.305a.43.43 0 0 1 .312-.127q.187 0 .316.127a.4.4 0 0 1 .132.305.4.4 0 0 1-.132.301.44.44 0 0 1-.316.124m6.67 0h-1.14L2.966 6.09a2 2 0 0 1-.188-.347H2.75q.036.192.036.824V10.5h-1.01v-6h1.216l2.903 4.305q.184.268.237.369h.018q-.044-.24-.044-.808V4.5H7.11zm4.445 0H8v-6h3.414v.845H9.051v1.699h2.178v.84H9.05V9.66h2.505zM16 5.345h-1.726V10.5h-.997V5.345h-1.721V4.5H16z"
  />
</IconSvgWrapper>
