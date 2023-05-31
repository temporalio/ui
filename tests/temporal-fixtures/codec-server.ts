import express from 'express';
import { type Application } from 'express';
import cors from 'cors';
import * as proto from '@temporalio/proto';
import { defaultDataConverter } from '@temporalio/common';

type Payload = proto.temporal.api.common.v1.IPayload;

interface JSONPayload {
  metadata?: Record<string, string> | null;
  data?: string | null;
}

interface Body {
  payloads: JSONPayload[];
}

const PORT = 8888;

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

function toJSON({
  metadata,
  data,
}: proto.temporal.api.common.v1.IPayload): JSONPayload {
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

export async function start() {
  const app: Application = express();
  app.use(cors({ allowedHeaders: ['x-namespace', 'content-type'] }));
  app.use(express.json());

  app.post('/decode', async (req, res) => {
    try {
      const { payloads: raw } = req.body as Body;
      const encoded = raw.map(fromJSON);
      const decoded = await defaultDataConverter.payloadCodecs[0].decode(
        encoded,
      );
      const payloads = decoded.map(toJSON);
      res.json({ payloads }).end();
    } catch (err) {
      console.error('Error in /decode', err);
      res.status(500).end('Internal server error');
    }
  });

  app.post('/encode', async (req, res) => {
    try {
      const { payloads: raw } = req.body as Body;
      const decoded = raw.map(fromJSON);
      const encoded = await defaultDataConverter.payloadCodecs[0].encode(
        decoded,
      );
      const payloads = encoded.map(toJSON);
      res.json({ payloads }).end();
    } catch (err) {
      console.error('Error in /encode', err);
      res.status(500).end('Internal server error');
    }
  });

  await new Promise<void>((resolve, reject) => {
    app.listen(PORT, () => {
      console.log(`Codec server listening on port: ${PORT}`);
      app.on('error', reject);
      resolve();
    });
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
