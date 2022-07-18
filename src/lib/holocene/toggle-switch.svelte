<script lang="ts">
  export let checked = false;
  export let id: string;
</script>

<label for={id} class="switch">
  <input {id} bind:checked type="checkbox" class="hidden" />
  <span class="slider" />
</label>

<style lang="postcss">
  .switch {
    @apply relative inline-block h-8 w-[52px] rounded-[8rem];
  }

  .slider {
    @apply absolute top-0 left-0 right-0 bottom-0 cursor-pointer rounded-[8rem] border-2 border-gray-600 bg-gray-100 duration-300;
    &:before {
      @apply absolute left-1 bottom-0.5 h-6 w-6 rounded-[50%] bg-gray-600 duration-300 content-[''];
    }
  }

  input:checked + .slider {
    @apply border-blue-500 bg-blue-500;
    &:before {
      @apply translate-x-4 bg-white text-center;
      content: url('data:image/svg+xml, %3Csvg%20width=%2212%22%20height=%2210%22%20viewBox=%220%200%2012%2010%22%20fill=%22none%22%20xmlns=%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cpath%20d=%22M4.36831%209.00391L0.572266%205.20786L1.52128%204.25885L4.36831%207.10588L10.4786%200.995582L11.4276%201.94459L4.36831%209.00391Z%22%20fill=%22%231D4ED8%22%2F%3E%0A%3C%2Fsvg%3E%0A');
    }
  }
</style>
