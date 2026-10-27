import type { RequestHandler } from './$types';

import { buildLlmsFull } from '$docs/data/llms';
import { getLlmsInput } from '$docs/data/resources';
import { docsOrigin, textResponse } from '$docs/data/text-response';

export const prerender = true;

export const GET: RequestHandler = ({ url }) =>
  textResponse(buildLlmsFull(getLlmsInput(docsOrigin(url))));
