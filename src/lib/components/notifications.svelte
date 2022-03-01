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
  class="flex flex-col justify-center absolute w-1/3 top-20 right-4 z-40"
>
  {#each $notifications as notification (notification.id)}
    <article
      in:receive={{ key: notification.id }}
      out:send={{ key: notification.id }}
      animate:flip
      class="px-8 py-6 mb-4 opacity-90 shadow-lg {notification.type}"
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
    @apply bg-red-300 border-l-4 border-red-500;
  }

  .success {
    @apply bg-green-300 border-l-4 border-green-500;
  }

  .warning {
    @apply bg-yellow-300 border-l-4 border-yellow-500;
  }

  .information {
    @apply bg-blue-300 border-l-4 border-blue-500;
  }
</style>
