<script lang="ts">
  import type { Attachment } from 'svelte/attachments';

  interface Props {
    count?: number;
    speed?: number;
    class?: string;
  }

  let { count = 200, speed = 1, class: className = '' }: Props = $props();

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
    const particles = Array.from({ length: count }, () => ({
      ...randomPointInSphere(),
      size: 0.6 + Math.random() * 0.8,
      phase: Math.random() * Math.PI * 2,
    }));
    let width = 0;
    let height = 0;
    let frame = 0;

    const draw = (time: number) => {
      const seconds = (time / 1000) * speed;
      const spin = seconds * 0.05;
      const tilt = Math.sin(seconds * 0.2) * 0.15;
      const [sinSpin, cosSpin] = [Math.sin(spin), Math.cos(spin)];
      const [sinTilt, cosTilt] = [Math.sin(tilt), Math.cos(tilt)];
      const focal = (Math.max(width, height) / 2) * CAMERA_DISTANCE;

      context.clearRect(0, 0, width, height);
      context.fillStyle = getComputedStyle(canvas).color;

      for (const { x, y, z, size, phase } of particles) {
        const wobble = Math.sin(seconds * 0.6 + phase) * 0.02;
        const spunX = x * cosSpin - z * sinSpin + wobble;
        const spunZ = x * sinSpin + z * cosSpin;
        const tiltedY = y * cosTilt - spunZ * sinTilt + wobble;
        const tiltedZ = y * sinTilt + spunZ * cosTilt;
        const perspective = 1 / (CAMERA_DISTANCE - tiltedZ);

        context.beginPath();
        context.arc(
          width / 2 + spunX * focal * perspective,
          height / 2 + tiltedY * focal * perspective,
          Math.max(0.6, size * (perspective * CAMERA_DISTANCE) ** 2),
          0,
          2 * Math.PI,
        );
        context.fill();
      }
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
        frame = requestAnimationFrame(loop);
      }
    };

    const observer = new ResizeObserver(start);
    observer.observe(canvas);
    reducedMotion.addEventListener('change', start);

    return () => {
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
