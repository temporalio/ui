<script>import { notifications } from '../stores/notifications';
import { crossfade } from 'svelte/transition';
import { quintOut } from 'svelte/easing';
import { flip } from 'svelte/animate';
const [send, receive] = crossfade({
    duration: (d) => Math.sqrt(d * 100),
    fallback(node) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        return {
            duration: 600,
            easing: quintOut,
            css: (t) => `transform: ${transform} scale(${t}); opacity: ${t}`,
        };
    },
});
</script>

<section
  class="absolute top-20 right-4 z-40 flex w-1/3 flex-col justify-center"
>
  {#each $notifications as notification (notification.id)}
    <article
      in:receive={{ key: notification.id }}
      out:send={{ key: notification.id }}
      animate:flip
      class="mb-4 px-8 py-6 opacity-90 shadow-lg {notification.type}"
      on:click={() => notifications.dismiss(notification.id)}
    >
      <p>
        {notification.message}
      </p>
    </article>
  {/each}
</section>

<style>
  .error {

    border-left-width: 4px;

    --tw-border-opacity: 1;

    border-color: rgb(239 68 68 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(252 165 165 / var(--tw-bg-opacity))
}

  .success {

    border-left-width: 4px;

    --tw-border-opacity: 1;

    border-color: rgb(34 197 94 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(134 239 172 / var(--tw-bg-opacity))
}

  .warning {

    border-left-width: 4px;

    --tw-border-opacity: 1;

    border-color: rgb(234 179 8 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(253 224 71 / var(--tw-bg-opacity))
}

  .information {

    border-left-width: 4px;

    --tw-border-opacity: 1;

    border-color: rgb(59 130 246 / var(--tw-border-opacity));

    --tw-bg-opacity: 1;

    background-color: rgb(147 197 253 / var(--tw-bg-opacity))
}</style>
