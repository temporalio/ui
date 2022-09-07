<script>import Icon from '$holocene/icon/icon.svelte';
import { copyToClipboard } from '../utilities/copy-to-clipboard';
import { noop } from 'svelte/internal';
export let show = false;
export let filterable = true;
export let copyable = true;
export let content;
export let onFilter = noop;
export let filtered = false;
const { copy, copied } = copyToClipboard(700);
</script>

{#if show}
  <div class="copy-or-filter" on:click|preventDefault|stopPropagation={noop}>
    {#if filterable}
      <button on:click|preventDefault|stopPropagation={onFilter}>
        {#key filtered}
          <Icon name={filtered ? 'filter-solid' : 'filter'} class="h-4 w-4" />
        {/key}
      </button>
    {/if}
    {#if copyable}
      <button on:click|preventDefault|stopPropagation={(e) => copy(e, content)}>
        <Icon name={$copied ? 'checkmark' : 'copy'} stroke="#000" />
      </button>
    {/if}
  </div>
{/if}

<style>
  .copy-or-filter {
    position: absolute;
    right: 0px;
    top: 0px;
    bottom: 0px;
    z-index: 50;
    display: inline-flex;
    gap: 0.5rem;
    border-radius: 9999px;
    --tw-bg-opacity: 1;
    background-color: rgb(250 250 250 / var(--tw-bg-opacity));
    padding-left: 0.5rem;
    padding-right: 0.5rem
}</style>
