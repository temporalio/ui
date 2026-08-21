<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path fill="#9747FF" d="M0 0h16v16H0z" /><path
    fill="#fff"
    d="M2.397 10a.38.38 0 0 1-.281-.12A.4.4 0 0 1 2 9.586q0-.173.116-.296a.37.37 0 0 1 .281-.123q.168 0 .284.123.12.123.119.296 0 .17-.119.294a.38.38 0 0 1-.284.12M7.6 10h-.855L4.49 6.325a1.7 1.7 0 0 1-.141-.29h-.02q.027.16.027.687V10H3.6V5h.911L6.69 8.588q.138.222.177.307h.014a5 5 0 0 1-.033-.673V5H7.6zm3.2 0H8.4V5h2.305v.704H9.11V7.12h1.47v.7H9.11V9.3h1.69zM14 5.704h-1.243V10h-.717V5.704H10.8V5H14z"
  />
</IconSvgWrapper>
