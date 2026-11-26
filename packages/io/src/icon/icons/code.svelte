<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="currentColor"
    d="m9.434 1.333-.185.598-3.656 11.752-.185.598 1.16.386.185-.598L10.41 2.317l.186-.598zm1.564 3.55.445.43L14.218 8l-2.775 2.69-.445.43.833.917.444-.43 3.25-3.148L16 8l-.475-.459-3.25-3.147-.444-.43zm-6.83-.919-.443.43-3.25 3.148-.475.46.475.458 3.25 3.148.444.43.833-.918-.445-.43-2.775-2.689 2.775-2.688.445-.43z"
  />
</IconSvgWrapper>
