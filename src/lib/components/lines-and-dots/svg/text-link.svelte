<script lang="ts">
  import { goto } from '$app/navigation';

  export let point: [number, number] = [0, 0];
  export let fontSize = '14px';
  export let href: string;

  $: [x, y] = point;
</script>

<text
  role="link"
  tabindex="0"
  on:click={() => goto(href)}
  on:keydown={(e) => {
    if (e.key === 'Enter') {
      goto(href);
    }
  }}
  class="cursor-pointer outline-hidden select-none"
  {x}
  {y}
  font-size={fontSize}
>
  <slot />
</text>

<style lang="postcss">
  text {
    fill: #93bbfd;
    font-weight: 400;
    opacity: 1;
    stroke: none;
    text-decoration: underline;
  }
</style>
