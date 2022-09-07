<script>import Icon from '$holocene/icon/icon.svelte';
import { createEventDispatcher } from 'svelte';
import Button from '$holocene/button.svelte';
export let open = false;
export let hideConfirm = false;
export let confirmText = 'Confirm';
export let cancelText = 'Cancel';
export let confirmType = 'primary';
export let confirmDisabled = false;
export let large = false;
const dispatch = createEventDispatcher();
</script>

{#if open}
  <div class="modal">
    <div class="overlay" />
    <div class="body" class:large>
      <div
        class="float-right cursor-pointer p-6"
        on:click={() => dispatch('cancelModal', {})}
      >
        <Icon name="close" />
      </div>
      <div class="title">
        <slot name="title">
          <h3>Title</h3>
        </slot>
      </div>
      <div class="content">
        <slot name="content">
          <span>Content</span>
        </slot>
      </div>
      <div class="flex items-center justify-end space-x-2 p-6">
        <Button
          thin
          variant="secondary"
          on:click={() => dispatch('cancelModal', {})}>{cancelText}</Button
        >
        {#if !hideConfirm}
          <Button
            thin
            variant={confirmType}
            disabled={confirmDisabled}
            on:click={() => dispatch('confirmModal', {})}>{confirmText}</Button
          >
        {/if}
      </div>
    </div>
  </div>
{/if}

<style>
  .modal {

    position: fixed;

    top: 0px;

    left: 0px;

    z-index: 50;

    display: flex;

    height: 100%;

    width: 100%;

    align-items: center;

    justify-content: center;

    padding: 2rem
}

@media (min-width: 1024px) {

    .modal {

        padding: 0px
    }
}

  .overlay {

    position: fixed;

    height: 100%;

    width: 100%;

    --tw-bg-opacity: 1;

    background-color: rgb(24 24 27 / var(--tw-bg-opacity));

    opacity: 0.5
}

  .body {

    z-index: 50;

    margin-left: auto;

    margin-right: auto;

    width: 100%;

    overflow-y: auto;

    border-radius: 0.5rem;

    --tw-bg-opacity: 1;

    background-color: rgb(255 255 255 / var(--tw-bg-opacity));

    --tw-text-opacity: 1;

    color: rgb(24 24 27 / var(--tw-text-opacity));

    --tw-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

    --tw-shadow-colored: 0 20px 25px -5px var(--tw-shadow-color), 0 8px 10px -6px var(--tw-shadow-color);

    box-shadow: var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)
}

  @media (min-width: 768px) {

    .body {

        height: -webkit-max-content;

        height: -moz-max-content;

        height: max-content
    }
}

  @media (min-width: 1024px) {

    .body {

        width: 33.333333%
    }

    .large {

        width: 50%
    }
}

  .title {

    --tw-bg-opacity: 1;

    background-color: rgb(255 255 255 / var(--tw-bg-opacity));

    padding-left: 2rem;

    padding-right: 2rem;

    padding-top: 2rem;

    padding-bottom: 0px;

    font-size: 1.5rem;

    line-height: 2rem
}

  .content {

    padding: 2rem
}</style>
