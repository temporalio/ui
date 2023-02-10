import kleur from 'kleur';
import { TestWorkflowEnvironment } from '@temporalio/testing';
import { keyIn } from 'readline-sync';

const port = 7233;

console.log(kleur.cyan('Getting ready to download Temporal CLI..'));

if (process.env.VERCEL) {
  console.log(
    kleur.blue('Running on Vercel; skipping downloading Temporal CLI'),
  );
  process.exit(0);
}

const startServer = process.argv.includes('--start');
if (startServer) {
  console.log(kleur.cyan(`Starting Temporal development server..`));
}

const server = await TestWorkflowEnvironment.createTimeSkipping({
  server: { port },
});

if (startServer) {
  console.log(
    kleur.bgGreen('OK'),
    kleur.green(`Started Temporal development server at`),
    kleur.green().underline(`127.0.0.1:${port}`),
  );
  keepAlive();
} else {
  console.log(
    kleur.bgGreen('OK'),
    kleur.green(
      'Temporal CLI installed. Run dev server with `pnpm run server`',
    ),
  );
}

await server.teardown();

async function keepAlive() {
  let answer = '';
  while (answer !== 'q') {
    answer = keyIn(kleur.cyan(`Press ${kleur.bold('q')} to exit: `));
  }
}
