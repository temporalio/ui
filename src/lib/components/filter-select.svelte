<script lang="ts">
  export let id: string;
  export let name: string;
  export let value: string | boolean;

  let showDropdown = false;
</script>

<div>
  <label for={id} class="text-gray-600 text-xs block">{name}</label>
  <select
    class="block border-2 text-base p-2 w-full h-10"
    {id}
    bind:value
    on:change
  >
    <slot />
    <span
      class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none"
    >
      <svg
        class="h-5 w-5 text-gray-400"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 20"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fill-rule="evenodd"
          d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
          clip-rule="evenodd"
        />
      </svg>
    </span>
  </select>
</div>
