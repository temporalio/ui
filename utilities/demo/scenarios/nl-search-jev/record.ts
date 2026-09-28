/**
 * Records the demo video for nl-search-jev against a running UI.
 *
 *   TEMPORAL_TYPESAFE_API_KEY=<key> pnpm demo start nl-search-jev
 *   pnpm exec esno utilities/demo/scenarios/nl-search-jev/record.ts
 *
 * The UI must have natural-language search on, so the ui-server needs the key.
 * The searches call TypeSafe for real, so the answers can vary from run to run.
 *
 * The browser's screencast gives each frame with its timestamp. The frames are
 * joined with those timestamps, so pauses and network waits keep their real
 * length and nothing is dropped. The output is .feature-demo/nl-search-jev/video/.
 */
import { execFileSync } from 'node:child_process';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { chromium, type Locator, type Page } from '@playwright/test';

import { DEMO_SEARCHES } from './dataset';

const BASE_URL = process.env.DEMO_UI_URL ?? 'http://localhost:3000';
const NAMESPACE = process.env.DEMO_NAMESPACE ?? 'default';
const OUT = join(process.cwd(), '.feature-demo', 'nl-search-jev', 'video');
const FRAMES = join(OUT, 'frames');
const WIDTH = 1600;
const HEIGHT = 1000;
const SCALE = 2;

const CURSOR_SCRIPT = `
  addEventListener('DOMContentLoaded', () => {
    const cursor = document.createElement('div');
    cursor.id = 'demo-cursor';
    Object.assign(cursor.style, {
      position: 'fixed', left: '-40px', top: '-40px', width: '18px', height: '18px',
      marginLeft: '-9px', marginTop: '-9px', borderRadius: '9999px',
      border: '2px solid white', background: 'rgba(129, 140, 248, 0.45)',
      boxShadow: '0 0 0 1px rgba(0,0,0,0.5)', pointerEvents: 'none',
      zIndex: '2147483647', transition: 'transform 120ms ease-out',
    });
    document.body.appendChild(cursor);
    addEventListener('mousemove', (event) => {
      cursor.style.left = event.clientX + 'px';
      cursor.style.top = event.clientY + 'px';
    }, true);
    addEventListener('mousedown', () => { cursor.style.transform = 'scale(0.7)'; }, true);
    addEventListener('mouseup', () => { cursor.style.transform = 'scale(1)'; }, true);
  });
`;

type Frame = { file: string; timestamp: number };

// A string, so the bundler that runs this file cannot add helpers the page lacks.
const SMOOTH_SCROLL = `(element, { distance, ms }) => new Promise((resolve) => {
  const start = element.scrollTop;
  const begin = performance.now();
  const frame = (now) => {
    const t = Math.min(1, (now - begin) / ms);
    const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
    element.scrollTop = start + distance * eased;
    if (t < 1) requestAnimationFrame(frame);
    else resolve();
  };
  requestAnimationFrame(frame);
})`;

const hold = (page: Page, ms: number) => page.waitForTimeout(ms);

const moveTo = async (page: Page, target: Locator) => {
  await target.scrollIntoViewIfNeeded();
  const box = await target.boundingBox();
  if (!box) throw new Error('A demo target is not visible on the page.');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, {
    steps: 30,
  });
};

const click = async (page: Page, target: Locator) => {
  await moveTo(page, target);
  await hold(page, 180);
  await page.mouse.down();
  await page.mouse.up();
};

const search = async (page: Page, text: string) => {
  const input = page.locator('#workflow-nl-search');
  await click(page, input);
  await input.fill('');
  await page.keyboard.type(text, { delay: 55 });
  await hold(page, 400);
  const response = page.waitForResponse(/\/api\/v1\/nl-search/, {
    timeout: 60_000,
  });
  await click(page, page.getByTestId('workflow-nl-search-button'));
  await response;
  await page.getByTestId('workflow-nl-search-explain').waitFor();
  await hold(page, 1_800);
};

const scrollPanel = async (page: Page, distance: number, ms: number) => {
  const scroller = page.locator(
    '#workflow-nl-search-trace > div.overflow-auto',
  );
  await scroller.evaluate(SMOOTH_SCROLL, { distance, ms });
};

const run = async () => {
  await rm(OUT, { recursive: true, force: true });
  await mkdir(FRAMES, { recursive: true });

  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: WIDTH, height: HEIGHT },
    deviceScaleFactor: SCALE,
    colorScheme: 'dark',
  });
  await context.addInitScript(CURSOR_SCRIPT);
  const page = await context.newPage();

  await page.goto(`${BASE_URL}/namespaces/${NAMESPACE}/workflows`, {
    waitUntil: 'domcontentloaded',
    timeout: 120_000,
  });
  const input = page.locator('#workflow-nl-search');
  await input.waitFor({ timeout: 60_000 }).catch(() => {
    throw new Error(
      'The Workflows page has no natural-language search. Start the UI with TEMPORAL_TYPESAFE_API_KEY set.',
    );
  });
  await hold(page, 1_000);

  const frames: Frame[] = [];
  const cdp = await context.newCDPSession(page);
  cdp.on('Page.screencastFrame', async ({ data, metadata, sessionId }) => {
    const file = join(FRAMES, `${String(frames.length).padStart(5, '0')}.jpg`);
    frames.push({ file, timestamp: metadata.timestamp ?? Date.now() / 1000 });
    await writeFile(file, Buffer.from(data, 'base64'));
    await cdp.send('Page.screencastFrameAck', { sessionId }).catch(() => {});
  });
  await cdp.send('Page.startScreencast', {
    format: 'jpeg',
    quality: 95,
    maxWidth: WIDTH * SCALE,
    maxHeight: HEIGHT * SCALE,
    everyNthFrame: 1,
  });

  try {
    await page.mouse.move(WIDTH / 2, HEIGHT / 2);
    await hold(page, 1_200);

    const [first, ...rest] = DEMO_SEARCHES;
    await search(page, first.text);

    await click(page, page.getByTestId('workflow-nl-search-explain'));
    await page.locator('#workflow-nl-search-trace').waitFor();
    await hold(page, 2_000);
    await scrollPanel(page, 700, 3_500);
    await hold(page, 1_500);
    await scrollPanel(page, -700, 1_500);

    for (const next of rest) {
      await search(page, next.text);
      await scrollPanel(page, 450, 2_500);
      await hold(page, 1_200);
      await scrollPanel(page, -450, 1_200);
    }

    const panel = page.locator('#workflow-nl-search-trace');
    for (let i = 0; i < rest.length; i++) {
      await click(page, panel.getByRole('button', { name: 'Previous search' }));
      await hold(page, 2_200);
    }
    await click(page, panel.getByRole('button', { name: 'Next search' }));
    await hold(page, 2_500);

    await click(
      page,
      page.getByRole('link', { name: 'order-1002', exact: true }).first(),
    );
    await page.waitForURL(/\/timeline$/, { timeout: 60_000 });
    await hold(page, 1_000);
    await click(page, page.locator('#history-tab'));
    await page.waitForURL(/\/history$/, { timeout: 60_000 });
    const reviewButton = page.getByTestId('history-review-button');
    await reviewButton.waitFor({ timeout: 60_000 });
    await hold(page, 800);
    await page.mouse.wheel(0, 420);
    await hold(page, 1_200);
    const review = page.waitForResponse(/\/api\/v1\/history-review/, {
      timeout: 60_000,
    });
    await click(page, reviewButton);
    await review.catch(() => {});
    await hold(page, 3_500);
    await click(page, page.getByTestId('history-review-show-all'));
    await hold(page, 2_500);
    await click(page, page.getByTestId('history-review-show-all'));
    await hold(page, 2_000);
  } catch (error) {
    await page.screenshot({ path: join(OUT, 'failure.png') }).catch(() => {});
    const query = new URL(page.url()).searchParams.get('query');
    throw new Error(
      `${error instanceof Error ? error.message : error}\nPage: ${page.url()}\nQuery: ${query}\nScreenshot: ${join(OUT, 'failure.png')}`,
    );
  }

  await cdp.send('Page.stopScreencast');
  await browser.close();

  if (frames.length < 2) throw new Error('The screencast captured no frames.');

  const list = frames
    .map((frame, index) => {
      const next = frames[index + 1];
      const duration = next
        ? Math.max(1 / 120, next.timestamp - frame.timestamp)
        : 1;
      return `file '${frame.file}'\nduration ${duration.toFixed(4)}`;
    })
    .join('\n');
  const listFile = join(OUT, 'frames.txt');
  await writeFile(
    listFile,
    `ffconcat version 1.0\n${list}\nfile '${frames.at(-1)?.file}'\n`,
  );

  const video = join(OUT, 'nl-search-jev.mp4');
  execFileSync('ffmpeg', [
    '-loglevel',
    'error',
    '-y',
    '-f',
    'concat',
    '-safe',
    '0',
    '-i',
    listFile,
    '-vf',
    'fps=60,scale=trunc(iw/2)*2:trunc(ih/2)*2,format=yuv420p',
    '-c:v',
    'libx264',
    '-preset',
    'slow',
    '-crf',
    '14',
    '-movflags',
    '+faststart',
    video,
  ]);
  console.log(`${frames.length} frames → ${video}`);
};

run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
