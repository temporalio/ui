<script lang="ts">
  export let type: BadgeTypes;
  type BadgeTypes = keyof typeof Badges;

  // We need to keep the entire classname intact so tailiwnd
  // doesn't auto purge it
  const Badges = {
    beta: `
        bg-blue-100 
        text-blue-700 
        border-blue-700`,
    alpha: `
        bg-purple-100
        text-purple-700
        border-purple-700
    `,
  };
</script>

<div
  class={`${Badges[type]}        
        rounded-sm
        text-center 
        inline-block
        px-1
        ml-1
        text-sm
        align-middle	
        `}
>
  <slot />
</div>
