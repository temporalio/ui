<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M9.732 5.204 3.471 11.47V7.64L8.63 2.48a3.336 3.336 0 0 1 4.717 0l.172.173a3.34 3.34 0 0 1 .62 3.863h-3.592l.247-.248.532-.533-1.061-1.062-.533.533zM9.043 8.02h3.828l-1.504 1.504H7.54zm.82 3.008L8.36 12.532H4.533l1.503-1.504zm-7.896-4.01v5.956l-1.435 1.43-.532.534L1.062 16l.532-.533 1.435-1.431h5.955l5.597-5.599a4.843 4.843 0 0 0 0-6.849l-.172-.172a4.84 4.84 0 0 0-6.844.003z"
  />
</IconSvgWrapper>
