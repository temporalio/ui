<script lang="ts">
  import { type ClassNameValue, twMerge } from 'tailwind-merge';

  let { class: className }: { class?: ClassNameValue } = $props();
</script>

<div id="loading-content">
  <div
    class={twMerge(
      'w-[45dvw] min-w-fit max-w-[500px] scale-[.30] antialiased',
      className,
    )}
  >
    <svg
      width="400"
      height="400"
      viewBox="0 0 400 400"
      xmlns="http://www.w3.org/2000/svg"
      class="animate-infinite"
      id="loading-anim"
      shape-rendering="geometricPrecision"
    >
      <ellipse
        cx="200"
        cy="200"
        rx="64"
        ry="190"
        fill="none"
        stroke-width="15"
        stroke-linejoin="miter"
        stroke-miterlimit="10"
        class="vertical-ellipse"
      ></ellipse>
      <ellipse
        cx="200"
        cy="200"
        rx="190"
        ry="64"
        fill="none"
        stroke-width="15"
        stroke-linejoin="miter"
        stroke-miterlimit="10"
        class="horizontal-ellipse"
      ></ellipse>
    </svg>
  </div>
  <style>
    :root {
      --vertical-shape1: 730 118;
      --vertical-shape2: 433 420;
      --vertical-offset-start: -59;

      /* More shapes  */
      --horizontal-shape1: 740 115;
      --horizontal-shape2: 738 417;
      --horizontal-offset-start: -273;
      --horizontal-offset-shape2: -575;

      /* Drop Shadow  */
      --ellipse-shadow: rgb(0 0 0 / 15%);
      --ellipse-drop-shadow: drop-shadow(0 4px 12px var(--ellipse-shadow));
      --stroke-color: black;
    }

    :root.dark {
      --stroke-color: white;
      --ellipse-shadow: rgb(255 255 255 / 25%);
    }

    /* Default states - no animation */
    .vertical-ellipse {
      stroke: var(--stroke-color);
      stroke-dasharray: 0 848;
      stroke-dashoffset: var(--vertical-offset-start);
      filter: var(--ellipse-drop-shadow);
    }

    .horizontal-ellipse {
      stroke: var(--stroke-color);
      stroke-dasharray: 0 850;
      stroke-dashoffset: var(--horizontal-offset-start);
      filter: var(--ellipse-drop-shadow);
    }

    /* Combined infinite loop animation */
    .animate-infinite .vertical-ellipse {
      transform-origin: 200px 200px;
      animation:
        vertical-infinite-loop 7s linear infinite,
        vertical-rotation 7s linear infinite;
      animation-timing-function: linear;
    }

    .animate-infinite .horizontal-ellipse {
      transform-origin: 200px 200px;
      animation:
        horizontal-infinite-loop 7s linear infinite,
        horizontal-rotation 7s linear infinite;
      animation-timing-function: linear;
    }

    @keyframes vertical-infinite-loop {
      /* Phase 1: Draw in (0-7.5%) + Hold (7.5-25%) + Transform (25-33.33%) */
      0% {
        stroke-dasharray: 0 848;
        stroke-dashoffset: var(--vertical-offset-start);
        animation-timing-function: ease-out;
      }

      7.5% {
        stroke-dasharray: var(--vertical-shape1);
        stroke-dashoffset: var(--vertical-offset-start);
        animation-timing-function: linear;
      }

      25% {
        stroke-dasharray: var(--vertical-shape1);
        stroke-dashoffset: var(--vertical-offset-start);
        animation-timing-function: ease-in-out;
      }

      /* Phase 2: Complete transform (25-33.33%) + Hold (33.33-58.33%) + Return start (58.33-66.67%) */
      33.33% {
        stroke-dasharray: var(--vertical-shape2);
        stroke-dashoffset: var(--vertical-offset-start);
        animation-timing-function: linear;
      }

      58.33% {
        stroke-dasharray: var(--vertical-shape2);
        stroke-dashoffset: var(--vertical-offset-start);
        animation-timing-function: ease-in-out;
      }

      /* Phase 3: Return (58.33-66.67%) + Hold shape1 (66.67-80%) + Disappear (80-86.67%) + Hold empty (86.67-95.56%) */
      66.67% {
        stroke-dasharray: var(--vertical-shape1);
        stroke-dashoffset: var(--vertical-offset-start);
        animation-timing-function: linear;
      }

      80% {
        stroke-dasharray: var(--vertical-shape1);
        stroke-dashoffset: var(--vertical-offset-start);
        animation-timing-function: ease-in;
      }

      86.67% {
        stroke-dasharray: 0 848;
        stroke-dashoffset: var(--vertical-offset-start);
        animation-timing-function: linear;
      }

      100% {
        stroke-dasharray: 0 848;
        stroke-dashoffset: var(--vertical-offset-start);
      }
    }

    @keyframes horizontal-infinite-loop {
      /* Phase 1: Draw in (0-7.5%) + Hold (7.5-25%) + Transform (25-33.33%) */
      0% {
        stroke-dasharray: 0 850;
        stroke-dashoffset: var(--horizontal-offset-start);
        animation-timing-function: ease-out;
      }

      7.5% {
        stroke-dasharray: var(--horizontal-shape1);
        stroke-dashoffset: var(--horizontal-offset-start);
        animation-timing-function: linear;
      }

      25% {
        stroke-dasharray: var(--horizontal-shape1);
        stroke-dashoffset: var(--horizontal-offset-start);
        animation-timing-function: ease-in-out;
      }

      /* Phase 2: Complete transform (25-33.33%) + Hold (33.33-58.33%) + Return start (58.33-66.67%) */
      33.33% {
        stroke-dasharray: var(--horizontal-shape2);
        stroke-dashoffset: var(--horizontal-offset-shape2);
        animation-timing-function: linear;
      }

      58.33% {
        stroke-dasharray: var(--horizontal-shape2);
        stroke-dashoffset: var(--horizontal-offset-shape2);
        animation-timing-function: ease-in-out;
      }

      /* Phase 3: Return (58.33-66.67%) + Hold shape1 (66.67-80%) + Disappear (80-86.67%) + Hold empty (86.67-100%) */
      66.67% {
        stroke-dasharray: var(--horizontal-shape1);
        stroke-dashoffset: var(--horizontal-offset-start);
        animation-timing-function: linear;
      }

      80% {
        stroke-dasharray: var(--horizontal-shape1);
        stroke-dashoffset: var(--horizontal-offset-start);
        animation-timing-function: ease-in;
      }

      86.67% {
        stroke-dasharray: 0 850;
        stroke-dashoffset: var(--horizontal-offset-start);
        animation-timing-function: linear;
      }

      100% {
        stroke-dasharray: 0 850;
        stroke-dashoffset: var(--horizontal-offset-start);
      }
    }

    /*
    IMPORTANT: Synchronization Guide for Multiple Animations

    The stroke and rotation animations run simultaneously and must stay synchronized.
    When modifying timing, update BOTH sets of keyframes:

    STROKE ANIMATIONS: vertical-infinite-loop, horizontal-infinite-loop
    ROTATION ANIMATIONS: vertical-rotation, horizontal-rotation

    Key synchronization points (% values must match exactly):
    - 0%: Start state
    - 7.5%: Drawing complete (stroke only)
    - 25%: Pre-transform hold (stroke), rotation starts here
    - 33.33%: Transform complete (both)
    - 58.33%: Transform hold ends, return rotation starts
    - 66.67%: Return to original rotation complete (both)
    - 80%: Shape1 hold ends (stroke only)
    - 86.67%: Disappear complete (stroke only)
    - 100%: Cycle complete (both)

    To modify timing:
    1. Calculate new percentages based on desired seconds
    2. Update ALL matching keyframes in BOTH animation sets
    3. Test that rotations and strokes stay visually aligned
    */

    @keyframes vertical-rotation {
      0%,
      25% {
        transform: rotate(0deg);
        animation-timing-function: cubic-bezier(0.68, -0.6, 0.32, 1.6);
      }

      33.33%,
      58.33% {
        transform: rotate(-135deg);
        animation-timing-function: cubic-bezier(0.68, -0.6, 0.32, 1.6);
      }

      66.67%,
      100% {
        transform: rotate(0deg);
      }
    }

    @keyframes horizontal-rotation {
      0%,
      25% {
        transform: rotate(0deg);
        animation-timing-function: cubic-bezier(0.68, -0.6, 0.32, 1.6);
      }

      33.33%,
      58.33% {
        transform: rotate(-135deg);
        animation-timing-function: cubic-bezier(0.68, -0.6, 0.32, 1.6);
      }

      66.67%,
      100% {
        transform: rotate(0deg);
      }
    }
  </style>
</div>
