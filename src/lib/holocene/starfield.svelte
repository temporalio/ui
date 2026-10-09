<script lang="ts">
  import type { Attachment } from 'svelte/attachments';

  interface Props {
    class?: string;
  }

  let { class: className = '' }: Props = $props();

  const STAR_COUNT = 200;
  const CAMERA_DISTANCE = 2;

  const randomPointInSphere = () => {
    while (true) {
      const x = Math.random() * 2 - 1;
      const y = Math.random() * 2 - 1;
      const z = Math.random() * 2 - 1;
      if (x * x + y * y + z * z <= 1) return { x, y, z };
    }
  };

  const animate: Attachment<HTMLCanvasElement> = (canvas) => {
    const context = canvas.getContext('2d');
    if (!context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const stars = Array.from({ length: STAR_COUNT }, () => ({
      ...randomPointInSphere(),
      size: 0.6 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
      screenX: -Infinity,
      screenY: -Infinity,
    }));
    let debris: {
      x: number;
      y: number;
      angle: number;
      distance: number;
      size: number;
      shape: number;
      spin: number;
      start: number;
      life: number;
    }[] = [];
    let width = 0;
    let height = 0;
    let frame = 0;

    const draw = (time: number) => {
      const seconds = time / 1000;
      const spin = seconds * 0.05;
      const tilt = Math.sin(seconds * 0.2) * 0.15;
      const [sinSpin, cosSpin] = [Math.sin(spin), Math.cos(spin)];
      const [sinTilt, cosTilt] = [Math.sin(tilt), Math.cos(tilt)];
      const focal = (Math.max(width, height) / 2) * CAMERA_DISTANCE;

      context.clearRect(0, 0, width, height);
      context.fillStyle = getComputedStyle(canvas).color;

      for (const star of stars) {
        const { x, y, z, size, phase } = star;
        const wobble = Math.sin(seconds * 0.6 + phase) * 0.02;
        const spunX = x * cosSpin - z * sinSpin + wobble;
        const spunZ = x * sinSpin + z * cosSpin;
        const tiltedY = y * cosTilt - spunZ * sinTilt + wobble;
        const tiltedZ = y * sinTilt + spunZ * cosTilt;
        const perspective = 1 / (CAMERA_DISTANCE - tiltedZ);
        star.screenX = width / 2 + spunX * focal * perspective;
        star.screenY = height / 2 + tiltedY * focal * perspective;

        context.beginPath();
        context.arc(
          star.screenX,
          star.screenY,
          Math.max(0.6, size * (perspective * CAMERA_DISTANCE) ** 2),
          0,
          2 * Math.PI,
        );
        context.fill();
      }

      debris = debris.filter(({ start, life }) => time - start < life);
      for (const piece of debris) {
        const { x, y, angle, distance, size, shape, spin, start, life } = piece;
        const progress = (time - start) / life;
        const travel = distance * (1 - (1 - progress) ** 3);
        const shard = size * (1 - progress);
        context.save();
        context.translate(
          x + Math.cos(angle) * travel,
          y + Math.sin(angle) * travel + 8 * progress ** 2,
        );
        context.rotate(spin * progress);
        context.beginPath();
        context.moveTo(-shard, -shard * shape);
        context.lineTo(shard, 0);
        context.lineTo(-shard * shape, shard);
        context.fill();
        context.restore();
      }
    };

    const burst = (event: MouseEvent) => {
      const target = event.target as Element;
      if (
        reducedMotion.matches ||
        target.closest('a, button, input, .cm-editor')
      )
        return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const star = stars.find(
        ({ screenX, screenY }) => Math.hypot(screenX - x, screenY - y) < 10,
      );
      if (!star) return;
      const start = performance.now();
      for (let i = 0; i < 12 + Math.random() * 8; i++) {
        const size = 0.4 + Math.random() ** 3 * 4.6;
        debris.push({
          x: star.screenX,
          y: star.screenY,
          angle: Math.random() * Math.PI * 2,
          distance: (10 + Math.random() * 40) * (1.2 - size / 6),
          size,
          shape: 0.3 + Math.random() * 0.7,
          spin: (Math.random() - 0.5) * 12,
          start,
          life: 500 + Math.random() * 400,
        });
      }
      Object.assign(star, randomPointInSphere());
    };

    const loop = (time: number) => {
      draw(time);
      frame = requestAnimationFrame(loop);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      const ratio = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      if (reducedMotion.matches) {
        draw(0);
      } else {
        loop(performance.now());
      }
    };

    const observer = new ResizeObserver(start);
    observer.observe(canvas);
    reducedMotion.addEventListener('change', start);
    window.addEventListener('click', burst);

    return () => {
      window.removeEventListener('click', burst);
      cancelAnimationFrame(frame);
      observer.disconnect();
      reducedMotion.removeEventListener('change', start);
    };
  };
</script>

<canvas
  {@attach animate}
  aria-hidden="true"
  class="pointer-events-none {className}"
></canvas>
