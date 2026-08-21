<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M15.261 4.361c.333 1.167.333 3.667.333 3.667s0 2.472-.333 3.666a1.85 1.85 0 0 1-1.333 1.334c-1.195.305-5.917.305-5.917.305s-4.75 0-5.944-.305a1.85 1.85 0 0 1-1.334-1.334C.4 10.5.4 8.028.4 8.028s0-2.5.333-3.667a1.89 1.89 0 0 1 1.334-1.36c1.194-.334 5.944-.334 5.944-.334s4.722 0 5.917.333a1.89 1.89 0 0 1 1.333 1.361m-8.806 5.917 3.945-2.25-3.945-2.25z"
  />
</IconSvgWrapper>
