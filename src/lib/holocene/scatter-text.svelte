<script lang="ts">
  import type { Attachment } from 'svelte/attachments';

  interface Props {
    text: string;
    class?: string;
  }

  let { text, class: className = '' }: Props = $props();

  const GAP = 2;
  const RADIUS = 70;
  const PUSH = 6;
  const SPRING = 0.06;
  const DAMPING = 0.82;

  const scatter: Attachment<HTMLCanvasElement> = (canvas) => {
    const context = canvas.getContext('2d');
    if (!context) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let particles: {
      x: number;
      y: number;
      tx: number;
      ty: number;
      vx: number;
      vy: number;
    }[] = [];
    let pointer: { x: number; y: number } | null = null;
    let width = 0;
    let height = 0;
    let frame = 0;

    const sample = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = width;
      offscreen.height = height;
      const ctx = offscreen.getContext('2d');
      if (!ctx) return [];
      const { fontFamily } = getComputedStyle(canvas);
      ctx.font = `700 ${height}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, width / 2, height / 2, width);
      const { data } = ctx.getImageData(0, 0, width, height);
      const points: { x: number; y: number }[] = [];
      for (let y = 0; y < height; y += GAP) {
        for (let x = 0; x < width; x += GAP) {
          if (data[(y * width + x) * 4 + 3] > 128) points.push({ x, y });
        }
      }
      return points;
    };

    const draw = () => {
      const color = getComputedStyle(canvas).color;
      context.clearRect(0, 0, width, height);
      context.fillStyle = color;
      context.strokeStyle = color;
      context.lineWidth = 2;
      context.lineCap = 'round';
      context.beginPath();
      for (const { x, y, vx, vy } of particles) {
        const speed = Math.hypot(vx, vy);
        if (speed < 0.05) {
          context.fillRect(x, y, GAP, GAP);
          continue;
        }
        const length = Math.min(12, speed * 2);
        context.moveTo(x - (vx / speed) * length, y - (vy / speed) * length);
        context.lineTo(x, y);
      }
      context.stroke();
    };

    const step = () => {
      let moving = false;
      for (const p of particles) {
        if (pointer) {
          const dx = p.x - pointer.x;
          const dy = p.y - pointer.y;
          const distance = Math.hypot(dx, dy) || 1;
          if (distance < RADIUS) {
            const force = (1 - distance / RADIUS) * PUSH;
            p.vx += (dx / distance) * force;
            p.vy += (dy / distance) * force;
          }
        }
        p.vx = (p.vx + (p.tx - p.x) * SPRING) * DAMPING;
        p.vy = (p.vy + (p.ty - p.y) * SPRING) * DAMPING;
        p.x += p.vx;
        p.y += p.vy;
        if (Math.abs(p.vx) + Math.abs(p.vy) > 0.02) moving = true;
      }
      draw();
      frame = moving || pointer ? requestAnimationFrame(step) : 0;
    };

    const wake = () => {
      if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(step);
    };

    const start = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      const ratio = window.devicePixelRatio || 1;
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      canvas.width = width * ratio;
      canvas.height = height * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      particles = sample().map(({ x, y }) => ({
        x,
        y,
        tx: x,
        ty: y,
        vx: 0,
        vy: 0,
      }));
      draw();
    };

    const move = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const near =
        x > -RADIUS && x < width + RADIUS && y > -RADIUS && y < height + RADIUS;
      pointer = near ? { x, y } : null;
      wake();
    };

    const leave = () => {
      pointer = null;
      wake();
    };

    const observer = new ResizeObserver(start);
    observer.observe(canvas);
    window.addEventListener('pointermove', move);
    document.documentElement.addEventListener('pointerleave', leave);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('pointermove', move);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  };
</script>

<canvas {@attach scatter} aria-hidden="true" class={className}></canvas>
