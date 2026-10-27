import type { RequestHandler } from './$types';

import { buildLlmsIndex } from '$docs/data/llms';
import { getLlmsInput } from '$docs/data/resources';
import { docsOrigin, textResponse } from '$docs/data/text-response';

export const prerender = true;

export const GET: RequestHandler = ({ url }) =>
  textResponse(buildLlmsIndex(getLlmsInput(docsOrigin(url))));
