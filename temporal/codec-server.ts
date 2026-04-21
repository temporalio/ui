import type { Server } from 'http';

import type { Payload } from '@temporalio/common';
import cors from 'cors';
import type { Application } from 'express';
import express from 'express';

import { EncryptionCodec } from './encryption-codec';

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

function fromJSON({ metadata, data }: JSONPayload): Payload {
  return {
    metadata:
      metadata &&
      Object.fromEntries(
        Object.entries(metadata).map(([k, v]): [string, Uint8Array] => [
          k,
          Buffer.from(v, 'base64'),
        ]),
      ),
    data: data ? Buffer.from(data, 'base64') : undefined,
  };
}

function toJSON({ metadata, data }: Payload): JSONPayload {
  return {
    metadata:
      metadata &&
      Object.fromEntries(
        Object.entries(metadata).map(([k, v]): [string, string] => [
          k,
          Buffer.from(v).toString('base64'),
        ]),
      ),
    data: data ? Buffer.from(data).toString('base64') : undefined,
  };
}

export async function createCodecServer(
  { port }: CodecServerOptions = { port: PORT },
): Promise<CodecServer> {
  let server: Server;
  const app: Application = express();
  const codec = await EncryptionCodec.create('test-key-id');

  app.use(cors({ allowedHeaders: ['x-namespace', 'content-type'] }));
  app.use(express.json());

  app.post('/encode', async (req, res) => {
    try {
      const { payloads: raw } = req.body as Body;
      const decoded = raw.map(fromJSON);
      const encoded = await codec.encode(decoded);
      const payloads = encoded.map(toJSON);
      res.json({ payloads }).end();
    } catch (err) {
      console.error('Error in /encode', err);
      res.status(500).end('Internal server error');
    }
  });

  app.post('/decode', async (req, res) => {
    try {
      const { payloads: raw } = req.body as Body;
      const encoded = raw.map(fromJSON);
      const decoded = await codec.decode(encoded);
      const payloads = decoded.map(toJSON);
      res.json({ payloads }).end();
    } catch (err) {
      console.error('Error in /decode', err);
      res.status(500).end('Internal server error');
    }
  });

  const start = () =>
    new Promise<Server>((resolve, reject) => {
      server = app.listen(port, () => {
        console.log(`✨ codec server listening on http://127.0.0.1:${port}`);
        server.on('error', (error) => {
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
