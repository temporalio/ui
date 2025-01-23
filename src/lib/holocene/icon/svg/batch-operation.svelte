<script lang="ts">
  import Svg from '../svg.svelte';

  interface Props {
    animate?: boolean;
    duration?: number;
  }

  let { animate = false, duration = 2000, ...rest }: Props = $props();
</script>

<Svg {...rest}>
  <path
    d="M12 9.53906L4.925 6L12 2.46094L19.075 6L12 9.53906ZM21.5375 4.76719L12 0L2.4625 4.76719L0 6L2.4625 7.23281L12 12L21.5375 7.23281L24 6L21.5375 4.76719Z"
    fill="currentcolor"
  />
  <path
    d="M4.35833 9.81561L6.82083 11.0484V11.0531L4.925 12L12 15.5391L19.075 12L17.1792 11.0531L19.6417 9.8203L21.5375 10.7672L24 12L21.5375 13.2328L12 18L2.4625 13.2328L0 12L2.4625 10.7672L4.35833 9.81561Z"
    fill="currentcolor"
    class:animate-pulse={animate}
    style="animation-duration: {duration}ms; animation-iteration-count: infinite;"
  />
  <path
    d="M2.4625 16.7672L4.35833 15.8203L6.82083 17.0531L4.925 18L12 21.5391L19.075 18L17.1792 17.0531L19.6417 15.8203L21.5375 16.7672L24 18L21.5375 19.2328L12 24L2.4625 19.2328L0 18L2.4625 16.7672Z"
    fill="currentcolor"
    class:animate-pulse={animate}
    style="animation-duration: {duration}ms; animation-iteration-count: infinite; animation-direction: reverse;"
  />
</Svg>
