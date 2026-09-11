<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="M1.714 1.714v12.572h12.572V1.714zM0 0h16v16H0zm7.143 12V8.857H4V7.143h3.143V4h1.714v3.143H12v1.714H8.857V12z"
  />
</IconSvgWrapper>
