import type { PageLoad } from './$types';

import { loadDeploymentPage } from '$lib/pages/deployment-page';

export const load: PageLoad = (event) => loadDeploymentPage(event);
