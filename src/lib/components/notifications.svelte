<script lang="ts">
  import { notifications } from '$lib/stores/notifications';
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

<style lang="postcss">
  .error {
    @apply border-l-4 border-red-500 bg-red-300;
  }

  .success {
    @apply border-l-4 border-green-500 bg-green-300;
  }

  .warning {
    @apply border-l-4 border-yellow-500 bg-yellow-300;
  }

  .information {
    @apply border-l-4 border-blue-500 bg-blue-300;
  }
</style>
