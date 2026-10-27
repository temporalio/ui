import type { RequestHandler } from './$types';

import { usageGuide } from '$docs/data/resources';
import { textResponse } from '$docs/data/text-response';

export const prerender = true;

export const GET: RequestHandler = () =>
  textResponse(usageGuide, 'text/markdown');
