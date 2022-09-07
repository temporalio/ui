<script>import { eventOrGroupIsFailureOrTimedOut, eventOrGroupIsCanceled, eventOrGroupIsTerminated, } from '../../models/event-groups/get-event-in-group';
export let eventGroup;
export let selectedId;
export let onGroupClick;
</script>

<div
  class="block max-h-full w-full flex-col border-gray-200 p-4 lg:flex lg:w-1/3 lg:border-r-2"
>
  <ul class="gap-2">
    {#each [...eventGroup.events] as [id, eventInGroup] (id)}
      <li on:click|preventDefault|stopPropagation={() => onGroupClick(id)}>
        <div class="flex gap-2">
          <span class="mx-1 text-gray-500">{id}</span>
          <span
            class="event-type"
            class:active={id === selectedId}
            class:failure={eventOrGroupIsFailureOrTimedOut(eventInGroup)}
            class:canceled={eventOrGroupIsCanceled(eventInGroup)}
            class:terminated={eventOrGroupIsTerminated(eventInGroup)}
            >{eventInGroup.eventType}</span
          >
        </div>
      </li>
    {/each}
  </ul>
</div>

<style>
  li {
    margin-top: 0.5rem;
    margin-bottom: 0.5rem;
    cursor: pointer;
    padding-left: 2rem
}
  .event-type:hover {
    --tw-text-opacity: 1;
    color: rgb(29 78 216 / var(--tw-text-opacity));
    -webkit-text-decoration-line: underline;
            text-decoration-line: underline;
    -webkit-text-decoration-color: #1d4ed8;
            text-decoration-color: #1d4ed8
}
  .active {
    --tw-text-opacity: 1;
    color: rgb(29 78 216 / var(--tw-text-opacity));
    -webkit-text-decoration-line: underline;
            text-decoration-line: underline;
    -webkit-text-decoration-color: #1d4ed8;
            text-decoration-color: #1d4ed8
}
  .failure {
    --tw-text-opacity: 1;
    color: rgb(185 28 28 / var(--tw-text-opacity));
    -webkit-text-decoration-color: #b91c1c;
            text-decoration-color: #b91c1c
}
  .canceled {
    --tw-text-opacity: 1;
    color: rgb(161 98 7 / var(--tw-text-opacity));
    -webkit-text-decoration-color: #a16207;
            text-decoration-color: #a16207
}
  .terminated {
    --tw-text-opacity: 1;
    color: rgb(190 24 93 / var(--tw-text-opacity));
    -webkit-text-decoration-color: #be185d;
            text-decoration-color: #be185d
}</style>
