<script context="module"></script>

<script>export let type = 'default';
</script>

<div
  class="{type} flex w-fit flex-row items-center justify-center break-all rounded-sm p-1 text-sm font-medium transition-colors {$$props.class}"
>
  <slot />
</div>

<style>
  .beta, 
  .running, 
  .blue {

    --tw-border-opacity: 1;

    border-color: rgb(29 78 216 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(219 234 254 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(29 78 216 / var(--tw-text-opacity))
}

  .alpha, 
  .purple {

    --tw-border-opacity: 1;

    border-color: rgb(126 34 206 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(243 232 255 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(126 34 206 / var(--tw-text-opacity))
}

  .error, 
  .red {

    --tw-border-opacity: 1;

    border-color: rgb(185 28 28 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(254 242 242 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(185 28 28 / var(--tw-text-opacity))
}

  .warning, 
  .yellow {

    --tw-border-opacity: 1;

    border-color: rgb(113 63 18 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(254 249 195 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(113 63 18 / var(--tw-text-opacity))
}

  .default, 
  .gray {

    --tw-border-opacity: 1;

    border-color: rgb(63 63 70 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(212 212 216 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(63 63 70 / var(--tw-text-opacity))
}

  .active, 
  .available, 
  .green {

    --tw-border-opacity: 1;

    border-color: rgb(21 128 61 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(220 252 231 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(21 128 61 / var(--tw-text-opacity))
}

  .count {

    height: 1.5rem;

    width: 1.5rem;

    min-width: -webkit-max-content;

    min-width: -moz-max-content;

    min-width: max-content;

    border-radius: 9999px;

    --tw-bg-opacity: 1;

    background-color: rgb(29 78 216 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(255 255 255 / var(--tw-text-opacity))
}</style>
