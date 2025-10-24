<div
  id="content-wrapper"
  class="relative h-screen w-max flex-auto overflow-auto"
>
  <slot />
  <main id="content" class="pb-16 md:pb-0">
    <slot name="main" />
  </main>
  <slot name="footer" />
</div>
