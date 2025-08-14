<script lang="ts">
  import MetadataDecoder from '$lib/components/event/metadata-decoder.svelte';
  import type {
    EventGroup,
    EventGroups,
  } from '$lib/models/event-groups/event-groups';
  import { formatDistanceAbbreviated } from '$lib/utilities/format-time';
  import { isActivityTaskScheduledEvent } from '$lib/utilities/is-event-type';

  import Icon from '../icon.svelte';
  import { type IconName } from '../paths';

  type Props = {
    groups: EventGroups;
    onClick: (group: EventGroup) => void;
  };
  let { groups, onClick }: Props = $props();

  const groupByUserPrompt = $derived(
    (eventGroups: EventGroups): EventGroups[] => {
      const groupedByPrompt: EventGroups[] = [];
      let currentGroup: EventGroups = [];

      for (const group of eventGroups) {
        if (group.initialEvent?.attributes?.signalName === 'user_prompt') {
          if (currentGroup.length > 0) {
            groupedByPrompt.push(currentGroup);
          }
          currentGroup = [group];
        } else {
          currentGroup.push(group);
        }
      }

      if (currentGroup.length > 0) {
        groupedByPrompt.push(currentGroup);
      }

      return groupedByPrompt;
    },
  );

  const height = 48;
  const mid = height - 10;
  const promptGroups = $derived(groupByUserPrompt(groups));
  const totalGroups = $derived(promptGroups.length);
  const blockWidth = $derived(100 / totalGroups);

  $inspect('promptGroups: ', promptGroups);
  $inspect('blockWidth: ', blockWidth);

  const activityIcon = {
    'tool:envVars': 'search',
    'agent:toolPlanner': 'toolbox',
    'agent:ListAgents': 'robot',
    'agent:validatePrompt': 'circle-question',
  };
</script>

{#snippet icon(
  name: IconName,
  x: number,
  y: number,
  width: number,
  size: number = 3,
)}
  <g transform={`translate(${x + width / 2 - 1.125}, ${y + 0.9}) scale(0.75)`}>
    <Icon width={size} height={size} {name} />
  </g>
{/snippet}

{#snippet signal(group: EventGroup, index: number, x: number, width: number)}
  {@const midX = x + width / 2}
  {@const y = mid - 5 * (index + 1)}
  {@const pathY = mid + 4}
  {@const isUserPrompt =
    group.initialEvent.attributes.signalName === 'user_prompt'}
  <rect
    {x}
    {y}
    {width}
    height="4"
    fill="#d300d8"
    filter="url(#subtle-shadow)"
    opacity=".25"
  />
  {#if isUserPrompt}
    {@render icon('keyboard', x, y, width)}
  {:else}
    {@render icon('close', x + 1, y + 0.5, width, 2)}
    {@render icon('success', x - 0.5, y + 0.5, width, 2)}
  {/if}
  <path
    d={`M ${midX} ${pathY} L ${midX} ${pathY - 2.5} M ${midX - 0.5} ${pathY - 2} L ${midX} ${pathY - 2.5} L ${midX + 0.5} ${pathY - 2}`}
    stroke-width=".25"
    stroke="#d300d8"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  {#if isUserPrompt}
    {@render icon('astronaut', x, y + 9, width)}
  {/if}
{/snippet}

{#snippet update(_group: EventGroup, index: number, x: number, width: number)}
  {@const midX = x + width / 2}
  {@const y = mid + 4 + width * index}
  <rect
    {x}
    y={mid - 5}
    {width}
    height="4"
    fill="transparent"
    stroke="#374151"
    stroke-width=".15"
    filter="url(#subtle-shadow)"
  />
  {@render icon('json', x, mid - 5, width)}
  <path
    d={`M ${midX} ${y} L ${midX} ${y - 3} M ${midX - 0.5} ${y - 2} L ${midX} ${y - 3} L ${midX + 0.5} ${y - 2}`}
    stroke-width=".25"
    stroke="purple"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d={`M ${midX + 1.5} ${y - 3} L ${midX + 1.5} ${y} M ${midX + 0.5} ${y - 1} L ${midX + 1.5} ${y} L ${midX + 2.5} ${y - 1}`}
    stroke-width=".25"
    stroke="purple"
    fill="none"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
{/snippet}

{#snippet activity(group: EventGroup, index: number, x: number, width: number)}
  {@const y = mid - 5 * (index + 1)}
  {@const attempts = group.isPending
    ? group.pendingActivity.attempt
    : (group.eventList[1]?.attributes?.attempt ?? 0)}
  {@const retried = attempts > 1}
  {@const pending = group.isPending}
  <defs>
    <linearGradient id="redToGreenGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FFC3A8" />
      <stop offset="60%" stop-color="#10b981" />
    </linearGradient>
  </defs>

  <rect
    {x}
    {y}
    {width}
    height="4"
    fill={retried && !pending
      ? 'url(#redToGreenGradient)'
      : retried && pending
        ? '#FFC3A8'
        : pending
          ? '#a78bfa'
          : '#10b981'}
    opacity={retried || pending ? 1 : 0.5 + index * 0.1}
    filter="url(#subtle-shadow)"
  />
  <MetadataDecoder
    value={group.initialEvent.userMetadata.summary}
    let:decodedValue
  >
    {@render icon(activityIcon[decodedValue] ?? 'robot', x, y, width)}
  </MetadataDecoder>
  {#if pending}
    <line
      x1={x + width / 2}
      y1={y}
      x2={x + width / 2}
      y2={y - 2}
      stroke="#FFC3A8"
      stroke-width=".25"
      stroke-dasharray=".5"
      stroke-linecap="round"
      class="retried"
    />
    {@render icon('retry', x, y - 5.5, width)}
  {/if}
  {#if attempts > 1}
    <text
      x={x + width / 2}
      y={y - 5.5}
      text-anchor="middle"
      font-size="1px"
      font-weight="bold"
      fill="#374151"
    >
      {attempts}x
    </text>
  {/if}
{/snippet}

{#snippet child(group: EventGroup, index: number, x: number, width: number)}
  {@const y = mid - 5 * (index + 1)}
  {@const status = group.finalClassification}

  <rect
    {x}
    {y}
    {width}
    height="4"
    fill={status === 'Failed'
      ? 'red'
      : status === 'Completed'
        ? '#10b981'
        : 'oklch(86.5% 0.127 207.078)'}
    stroke="#374151"
    stroke-width=".15"
    filter="url(#subtle-shadow)"
  />
  {@render icon('relationship', x, y, width)}
  {#if true}
    <path
      d={`M ${x + width / 2} ${y + 4} L ${x + width / 2} ${y + 12} C ${x + width / 2 + 20} ${y + 12}, ${100 - x} ${y + 12}, 100 ${y + 12}`}
      stroke="#64748b"
      stroke-width=".25"
      stroke-dasharray=".5"
      fill="none"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  {/if}
{/snippet}

{#snippet timer(group: EventGroup, index: number, x: number, width: number)}
  {@const y = mid - 5 * (index + 1)}
  {@const duration = formatDistanceAbbreviated({
    start: group?.initialEvent?.eventTime,
    end: group?.lastEvent?.eventTime,
  })}
  <rect
    {x}
    y={mid - 5}
    {width}
    height="4"
    fill="#f59e0b"
    stroke="#374151"
    stroke-width=".15"
    filter="url(#subtle-shadow)"
  />
  {@render icon('retention', x, y, width)}
  {#if duration}
    <text
      x={x + width / 2}
      y={mid - 5.5}
      text-anchor="middle"
      font-size="1px"
      font-weight="bold"
      fill="#374151"
    >
      {duration}
    </text>
  {/if}
{/snippet}

{#snippet marker(_group: EventGroup, index: number, x: number, width: number)}
  {@const y = mid - 5 * (index + 1)}
  <rect
    {x}
    y={mid - 5}
    {width}
    height="4"
    fill="#9ca3af"
    stroke="#374151"
    stroke-width=".15"
    filter="url(#subtle-shadow)"
  />
  {@render icon('marker', x, y, width)}
{/snippet}

{#snippet renderStep(group, index, x, blockWidth)}
  {@const delay = Math.min(300 / promptGroups.length, 150) * index}
  {@const type = group.category.split('-')[0].toLowerCase()}
  <g
    class="fly-in cursor-pointer"
    style="animation-delay: {delay}ms;"
    onclick={() => onClick(group)}
  >
    {#if type === 'signal'}
      {@render signal(group, index, x, blockWidth)}
    {:else if type === 'update'}
      {@render update(group, index, x, blockWidth)}
    {:else if isActivityTaskScheduledEvent(group.initialEvent)}
      {@render activity(group, index, x, blockWidth)}
    {:else if type === 'timer'}
      {@render timer(group, index, x, blockWidth)}
    {:else if type === 'child'}
      {@render child(group, index, x, blockWidth)}
    {:else if type === 'other'}
      {@render marker(group, index, x, blockWidth)}
    {/if}
  </g>
{/snippet}

{#snippet renderPromptGroup(group, index, blockWidth, numGroups)}
  {@const x = index * blockWidth}
  {@const delay = Math.min(300 / numGroups, 150) * index}
  <g
    class="fly-in"
    style="animation-delay: {delay}ms;"
    onclick={() => onClick(group)}
  >
    {#each group as event, i}
      {@render renderStep(event, i, x, blockWidth)}
    {/each}
  </g>
{/snippet}

<svg viewBox="-1 0 101 {height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="subtle-shadow" x="-50%" y="-50%" width="200%" height="200%">
      <feDropShadow dx="0" dy="0.5" stdDeviation="0.5" flood-opacity="0.15" />
    </filter>
  </defs>
  <line
    x1="0"
    y1={mid}
    x2="100"
    y2={mid}
    stroke-width="1"
    stroke="#374151"
    stroke-linecap="round"
  />
  {#each promptGroups as group, index}
    {@render renderPromptGroup(group, index, blockWidth, promptGroups.length)}
  {/each}
</svg>

<style>
  .retried {
    opacity: 0.85;
    stroke-dashoffset: 0;
    animation: dash 60s linear infinite;
  }

  @keyframes dash {
    from {
      stroke-dashoffset: 200;
    }

    to {
      stroke-dashoffset: 0;
    }
  }

  @keyframes flyIn {
    0% {
      transform: translateX(-10px) scale(0.95);
      opacity: 0;
    }

    50% {
      transform: translateX(2px) scale(1.05);
    }

    100% {
      transform: translateX(0) scale(1);
      opacity: 1;
    }
  }

  .fly-in {
    animation: flyIn 0.1s cubic-bezier(0.24, 1.36, 0.44, 1) both;
    transition: transform 0.3s ease-in-out;
  }

  svg {
    overflow: visible;
  }

  rect {
    transition: all 0.2s ease-in-out;
  }

  rect:hover {
    filter: url('#subtle-shadow') brightness(1.15);
  }
</style>
