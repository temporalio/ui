<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="#F87171"
    d="M15.333 9H8.667l.666 4.667h6zM.667 9h6.666l-.666 4.667h-6z"
  /><path
    fill="currentColor"
    fill-rule="evenodd"
    d="m2.211 1.667 3.92.784-.262 1.307-2.747-.55L1.576 8h12.848l-1.546-4.79-2.747.55-.262-1.308 3.92-.784L16 8.564v5.77H9.01l-.764-3h-.492l-.764 3H0v-5.77zm7.2 8.843.635 2.49h4.62V9.333H9.143zM6.859 9.333H1.333V13h4.621l.634-2.49z"
    clip-rule="evenodd"
  /><path
    fill="currentColor"
    fill-rule="evenodd"
    d="m3.264 11.236-1.097-1.098.471-.471 1.098 1.097 1.097-1.097.472.471-1.098 1.098 1.098 1.097-.472.472-1.097-1.098-1.098 1.098-.471-.472zm8.529 0-1.098-1.098.472-.471 1.097 1.097 1.098-1.097.471.471-1.097 1.098 1.097 1.097-.471.472-1.098-1.098-1.097 1.098-.472-.472z"
    clip-rule="evenodd"
  />
</IconSvgWrapper>
