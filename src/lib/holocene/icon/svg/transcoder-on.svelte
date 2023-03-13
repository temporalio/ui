<script lang="ts">
  import Svg from './svg.svelte';

  export let status: 'configured' | 'error' | 'success' = 'configured';
</script>

<Svg {...$$props}>
  <path
    d="M20.5 6.5L12 2.5L3.5 6.5C3.5 17.5 12 21.5 12 21.5C12 21.5 20.5 17.5 20.5 6.5Z"
    fill={`url(#${status})`}
  />
  <path
    d="M20.5 6.5L12 2.5L3.5 6.5C3.5 17.5 12 21.5 12 21.5C12 21.5 20.5 17.5 20.5 6.5Z"
    stroke="currentcolor"
  />
  <path
    d="M12 11.5V15M12 11.5C12.8284 11.5 13.5 10.8284 13.5 10C13.5 9.17157 12.8284 8.5 12 8.5C11.1716 8.5 10.5 9.17157 10.5 10C10.5 10.8284 11.1716 11.5 12 11.5Z"
    fill="currentcolor"
  />
  <defs>
    <linearGradient
      id="configured"
      x1="6.34342"
      y1="5.0694"
      x2="19.4814"
      y2="17.6727"
      gradientUnits="userSpaceOnUse"
    >
      <stop stop-color="#C1F2F9" />
      <stop offset="1" stop-color="#C9C3FF" />
    </linearGradient>
    <linearGradient
      id="error"
      x1="6.34342"
      y1="5.0694"
      x2="19.4814"
      y2="17.6727"
      gradientUnits="userSpaceOnUse"
    >
      <stop stop-color="#f87171" />
      <stop offset="1" stop-color="#dc2626" />
    </linearGradient>
    <linearGradient
      id="success"
      x1="6.34342"
      y1="5.0694"
      x2="19.4814"
      y2="17.6727"
      gradientUnits="userSpaceOnUse"
    >
      <stop stop-color="#86efac" />
      <stop offset="1" stop-color="#16a34a" />
    </linearGradient>
  </defs>
</Svg>
