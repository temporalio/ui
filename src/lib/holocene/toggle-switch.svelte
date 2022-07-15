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
    @apply relative inline-block w-[52px] h-8 rounded-[8rem];
  }

  .slider {
    @apply absolute cursor-pointer top-0 left-0 right-0 bottom-0 bg-gray-100 border-2 border-gray-600 rounded-[8rem];
    transition: 300ms;
    -webkit-transition: 300ms;
    &:before {
      @apply content-[''] absolute h-4 w-4 left-1 bottom-1.5 bg-gray-600 rounded-[50%];
      transition: 300ms;
      -webkit-transition: 300ms;
    }
  }

  input:checked + .slider {
    @apply border-blue-500 bg-blue-500;
    &:before {
      @apply bg-white translate-x-6;
      content: url('data:image/svg+xml, %3Csvg%20width=%2216%22%20height=%2216%22%20viewBox=%220%200%2016%2016%22%20fill=%22none%22%20xmlns=%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%3Cg%20transform=%22translate(2%202)%22%3E%0A%3Cpath%20d=%22M4.36831%209.00391L0.572266%205.20786L1.52128%204.25885L4.36831%207.10588L10.4786%200.995582L11.4276%201.94459L4.36831%209.00391Z%22%20fill=%22%231D4ED8%22%2F%3E%0A%3C%2Fg%3E%0A%3C%2Fsvg%3E%0A');
    }
  }
</style>
