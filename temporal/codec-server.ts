import express from 'express';
import type { Application } from 'express';
import cors from 'cors';
import type { Server } from 'http';

export type CodecServer = {
  start: () => Promise<Server>;
  stop: () => Promise<void>;
};

export type CodecServerOptions = {
  port?: number;
};

interface JSONPayload {
  metadata?: Record<string, string> | null;
  data?: string | null;
}

interface Body {
  payloads: JSONPayload[];
}

const PORT = 8888;

const MOCK_DECODED_PAYLOAD = {
  metadata: {
    encoding: Buffer.from('binary/plain').toString('base64'),
  },
  data: 'Mock decoded payload',
};

export async function createCodecServer(
  { port }: CodecServerOptions = { port: PORT },
): Promise<CodecServer> {
  let server: Server;
  const app: Application = express();

  app.use(cors({ allowedHeaders: ['x-namespace', 'content-type'] }));
  app.use(express.json());

  app.post('/decode', async (req, res) => {
    try {
      const { payloads: raw } = req.body as Body;
      res.json({ payloads: raw.map(() => MOCK_DECODED_PAYLOAD) }).end();
    } catch (err) {
      console.error('Error in /decode', err);
      res.status(500).end('Internal server error');
    }
  });

  const start = () =>
    new Promise<Server>((resolve, reject) => {
      server = app.listen(port, () => {
        console.log(`Codec server listening on http://127.0.0.1:${port}`);
        app.on('error', (error) => {
          reject(error);
        });
        resolve(server);
      });
    });

  const stop = () =>
    new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });

  return {
    start,
    stop,
  };
}
