<script lang="ts">
  import IconSvgWrapper from '../icon-svg-wrapper.svelte';
  import type { IconProps } from '../types';

  const props: IconProps = $props();

  const id = $props.id();
</script>

<IconSvgWrapper {...props}>
  <path
    fill="url(#{id}-a)"
    d="M5.334.462h4.735L5.154 15.024a.755.755 0 0 1-.716.514H.754a.754.754 0 0 1-.714-.995L4.619.975a.755.755 0 0 1 .715-.513"
  /><path
    fill="#0078D4"
    d="M12.214 10.23H4.706a.348.348 0 0 0-.237.601l4.824 4.503a.76.76 0 0 0 .518.204h4.25z"
  /><path
    fill="url(#{id}-b)"
    d="M5.334.462a.75.75 0 0 0-.717.523L.045 14.531a.753.753 0 0 0 .71 1.007h3.78a.81.81 0 0 0 .62-.527l.912-2.687 3.257 3.037a.77.77 0 0 0 .485.177h4.235l-1.858-5.309-5.415.002L10.086.46z"
  /><path
    fill="url(#{id}-c)"
    d="M11.381.975a.75.75 0 0 0-.714-.513H5.39a.75.75 0 0 1 .715.513l4.579 13.568a.754.754 0 0 1-.714.995h5.276a.752.752 0 0 0 .714-.995z"
  /><defs
    ><linearGradient
      id="{id}-a"
      x1="7.06"
      x2="2.143"
      y1="1.579"
      y2="16.105"
      gradientUnits="userSpaceOnUse"
      ><stop stop-color="#114A8B" /><stop
        offset="1"
        stop-color="#0669BC"
      /></linearGradient
    ><linearGradient
      id="{id}-b"
      x1="8.595"
      x2="7.458"
      y1="8.349"
      y2="8.733"
      gradientUnits="userSpaceOnUse"
      ><stop stop-opacity=".3" /><stop offset=".071" stop-opacity=".2" /><stop
        offset=".321"
        stop-opacity=".1"
      /><stop offset=".623" stop-opacity=".05" /><stop
        offset="1"
        stop-opacity="0"
      /></linearGradient
    ><linearGradient
      id="{id}-c"
      x1="7.97"
      x2="13.367"
      y1="1.155"
      y2="15.535"
      gradientUnits="userSpaceOnUse"
      ><stop stop-color="#3CCBF4" /><stop
        offset="1"
        stop-color="#2892DF"
      /></linearGradient
    ></defs
  >
</IconSvgWrapper>
