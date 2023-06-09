<script lang="ts">
  export let checked = false;
  export let id: string;
  export let disabled = false;
</script>

<label for={id} class="switch">
  <input
    on:change
    {id}
    {disabled}
    bind:checked
    type="checkbox"
    class="hidden"
    class:disabled
    data-testid={$$props['data-testid']}
  />
  <span class="slider" />
</label>

<style lang="postcss">
  .switch {
    @apply relative inline-block h-8 w-[52px] rounded-[8rem];
  }

  .slider {
    @apply absolute top-0 left-0 right-0 bottom-0 cursor-pointer rounded-[8rem] border-2 border-gray-600 bg-gray-100 duration-300;

    &::before {
      @apply absolute left-1 bottom-0.5 h-6 w-6 rounded-[50%] bg-gray-900 duration-300;

      content: url("data:image/svg+xml,%3Csvg width='24' height='24' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16.8438 16.875C16.6562 17.0625 16.3125 17.0625 16.125 16.875L12 12.7188L7.84375 16.875C7.65625 17.0625 7.3125 17.0625 7.125 16.875C6.9375 16.6875 6.9375 16.3438 7.125 16.1562L11.2812 12L7.125 7.875C6.9375 7.6875 6.9375 7.34375 7.125 7.15625C7.3125 6.96875 7.65625 6.96875 7.84375 7.15625L12 11.3125L16.125 7.15625C16.3125 6.96875 16.6562 6.96875 16.8438 7.15625C17.0312 7.34375 17.0312 7.6875 16.8438 7.875L12.6875 12L16.8438 16.1562C17.0312 16.3438 17.0312 16.6875 16.8438 16.875Z' fill='%23fff'%3E%3C/path%3E%3C/svg%3E");
    }
  }

  input + .slider {
    @apply bg-white;
  }

  input.disabled + .slider {
    @apply bg-gray-200 cursor-not-allowed;
  }

  input:checked + .slider {
    @apply border-gray-900 bg-gray-900;

    &::before {
      @apply flex translate-x-4 items-center justify-center bg-blue-100;

      content: url('data:image/svg+xml, %3Csvg%20width=%2212%22%20height=%2210%22%20viewBox=%220%200%2012%2010%22%20fill=%22none%22%20xmlns=%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%0A%20%20%3Cpath%20d=%22M4.36831%209.00391L0.572266%205.20786L1.52128%204.25885L4.36831%207.10588L10.4786%200.995582L11.4276%201.94459L4.36831%209.00391Z%22%20fill=%22%231D4ED8%22%2F%3E%0A%3C%2Fsvg%3E%0A');
    }
  }
</style>
