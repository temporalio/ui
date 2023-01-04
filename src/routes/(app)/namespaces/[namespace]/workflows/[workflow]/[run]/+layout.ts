import { getWorkflowWithWorkers } from "$lib/load/workflow-run";
import type { LoadEvent } from "@sveltejs/kit";

export async function load({ params, parent }: LoadEvent) {
  return getWorkflowWithWorkers({ params, parent });
}
