<section class="h-screen flex items-start flex-col justify-between">
  <div class="w-full docs">
    <div class="flex flex-row justify-around">
      <div class="w-50 p-10">
        <div
          class="bg-blue-700 w-12 h-12 rounded flex items-center justify-center mb-3"
        >
          <i class="far fa-clock w-7 h-7" />
        </div>

        <h3 class="font-medium mb-2">Schedules</h3>
        <p class="font-light text-gray-500 mb-3">
          Schedule Workflows to run periodically, at some point in the future,
          or right now.
        </p>
        <div class="flex flex-col">
          <a
            href="https://docs.temporal.io/docs/content/what-is-a-schedule-to-start-timeout/"
            class="text-purple-600 mb-4"
            >View Details
          </a>
          <a
            href="https://docs.temporal.io/docs/content/what-is-a-schedule-to-start-timeout/"
            class="text-purple-600">View Docs</a
          >
        </div>
      </div>

      <div class="w-50 p-10">
        <div
          class="bg-blue-700 w-12 h-12 rounded flex items-center justify-center mb-3"
        />

        <h3 class="font-medium mb-2">Workflows</h3>
        <p class="font-light text-gray-500 mb-3">
          Execute Activities, sleep, and await Timers, and persist every step.
        </p>
        <div class="flex flex-col">
          <a
            href="https://docs.temporal.io/docs/concepts/workflows/"
            class="text-purple-600 mb-4"
            >View Details
          </a>
          <a
            href="https://docs.temporal.io/docs/concepts/workflows/"
            class="text-purple-600"
            >View Docs
          </a>
        </div>
      </div>
      <div class="w-50 p-10">
        <div
          class="bg-blue-700 w-12 h-12 rounded flex items-center justify-center mb-3"
        />

        <h3 class="font-medium mb-2">Task Queues</h3>
        <p class="font-light text-gray-500 mb-3">
          Everything passes through here.
        </p>
        <div class="flex flex-col">
          <a
            href="https://docs.temporal.io/docs/concepts/task-queues/"
            class="text-purple-600 mb-4"
            >View Details
          </a>
          <a
            href="https://docs.temporal.io/docs/concepts/task-queues/"
            class="text-purple-600"
            >View Docs
          </a>
        </div>
      </div>
      <div class="w-50 p-10">
        <div
          class="bg-blue-700 w-12 h-12 rounded flex items-center justify-center mb-3"
        />

        <h3 class="font-medium mb-2">Workers</h3>
        <p class="font-light text-gray-500 mb-3">
          Nothing happens without Workers listening to Task Queues.
        </p>
        <div class="flex flex-col">
          <a
            href="https://docs.temporal.io/docs/go/workers/"
            class="text-purple-600 mb-4"
            >View Details
          </a>
          <a
            href="https://docs.temporal.io/docs/go/workers/"
            class="text-purple-600">View Docs</a
          >
        </div>
      </div>

      <slot />
    </div>
  </div>
</section>
