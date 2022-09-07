<script>import Icon from '$holocene/icon/icon.svelte';
export let disabled = false;
export let loading = false;
export let active = false;
export let icon = null;
export let classes = $$props.class;
export let color = 'gray';
</script>

<button on:click class={`pill ${color} ${classes}`} class:active {disabled}>
  {#if icon}
    <span class:animate-spin={loading}>
      <Icon name={loading ? 'spinner' : icon} />
    </span>
  {/if}
  <slot />
</button>

<style>
  .pill {

    display: flex;

    align-items: center;

    justify-content: center;

    gap: 0.25rem;

    border-radius: 9999px;

    border-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(244 244 245 / var(--tw-border-opacity));

    padding-left: 0.75rem;

    padding-right: 0.75rem;

    padding-top: 0.25rem;

    padding-bottom: 0.25rem;

    font-size: 0.875rem;

    line-height: 1.25rem
}

  .gray {

    --tw-bg-opacity: 1;

    background-color: rgb(244 244 245 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(82 82 91 / var(--tw-text-opacity))
}
  .gray.active {

    border-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(24 24 27 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(255 255 255 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(24 24 27 / var(--tw-text-opacity))
}

  .blueGray {

    --tw-bg-opacity: 1;

    background-color: rgb(226 232 240 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(15 23 42 / var(--tw-text-opacity))
}
  .blueGray.active {

    border-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(15 23 42 / var(--tw-border-opacity))
}

  .blue {

    --tw-bg-opacity: 1;

    background-color: rgb(219 234 254 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(29 78 216 / var(--tw-text-opacity))
}
  .blue.active {

    border-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(29 78 216 / var(--tw-border-opacity))
}

  .green {

    --tw-bg-opacity: 1;

    background-color: rgb(220 252 231 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(21 128 61 / var(--tw-text-opacity))
}
  .green.active {

    border-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(21 128 61 / var(--tw-border-opacity))
}

  .yellow {

    --tw-bg-opacity: 1;

    background-color: rgb(254 249 195 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(113 63 18 / var(--tw-text-opacity))
}
  .yellow.active {

    border-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(113 63 18 / var(--tw-border-opacity))
}

  .orange {

    --tw-bg-opacity: 1;

    background-color: rgb(255 237 213 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(124 45 18 / var(--tw-text-opacity))
}
  .orange.active {

    border-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(124 45 18 / var(--tw-border-opacity))
}

  .red {

    --tw-bg-opacity: 1;

    background-color: rgb(254 226 226 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(185 28 28 / var(--tw-text-opacity))
}
  .red.active {

    border-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(185 28 28 / var(--tw-border-opacity))
}

  .indigo {

    --tw-bg-opacity: 1;

    background-color: rgb(224 231 255 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(67 56 202 / var(--tw-text-opacity))
}
  .indigo.active {

    border-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(67 56 202 / var(--tw-border-opacity))
}

  .purple {

    --tw-bg-opacity: 1;

    background-color: rgb(243 232 255 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(126 34 206 / var(--tw-text-opacity))
}
  .purple.active {

    border-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(126 34 206 / var(--tw-border-opacity))
}

  .pink {

    --tw-bg-opacity: 1;

    background-color: rgb(252 231 243 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(190 24 93 / var(--tw-text-opacity))
}
  .pink.active {

    border-width: 2px;

    --tw-border-opacity: 1;

    border-color: rgb(190 24 93 / var(--tw-border-opacity))
}</style>
