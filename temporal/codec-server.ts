import type { Server } from 'http';

import cors from 'cors';
import type { Application } from 'express';
import express from 'express';

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

let codecServer: CodecServer;
export const getCodecServer = (): CodecServer => codecServer;

export async function createCodecServer(
  { port }: CodecServerOptions = { port: PORT },
): Promise<CodecServer> {
  let server: Server;
  const app: Application = express();

  app.use(cors({ allowedHeaders: ['x-namespace', 'content-type'] }));
  app.use(express.json());

  app.post('/encode', async (req, res) => {
    try {
      const { payloads: raw } = req.body as Body;
      res.json({ payloads: raw }).end();
    } catch (err) {
      console.error('Error in /encode', err);
      res.status(500).end('Internal server error');
    }
  });

  app.post('/decode', async (req, res) => {
    try {
      const { payloads: raw } = req.body as Body;
      res.json({ payloads: raw }).end();
    } catch (err) {
      console.error('Error in /decode', err);
      res.status(500).end('Internal server error');
    }
  });

  const start = () =>
    new Promise<Server>((resolve, reject) => {
      server = app.listen(port, () => {
        console.log(`✨ codec server listening on http://127.0.0.1:${port}`);
        resolve(server);
      });
      server.on('error', (error) => {
        reject(error);
      });
    });

  const stop = () =>
    new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        console.log('🔪 killed codec server');
        resolve();
      });
    });

  codecServer = {
    start,
    stop,
  };

  return codecServer;
}
