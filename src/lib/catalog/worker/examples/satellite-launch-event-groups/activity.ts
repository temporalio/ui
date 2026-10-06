import { Context } from '@temporalio/activity';
import { WorkflowUpdateStage } from '@temporalio/client';

export type OrbitAdjustment = {
  satelliteId: string;
  deltaVMetersPerSecond: number;
};

const simulateWork = (milliseconds: number) =>
  Context.current().sleep(milliseconds);

const ownWorkflowHandle = () => {
  const { workflowExecution } = Context.current().info;
  if (!workflowExecution) {
    throw new Error('Mission control activities must run in a workflow');
  }
  return Context.current().client.workflow.getHandle(
    workflowExecution.workflowId,
    workflowExecution.runId,
  );
};

export async function runPreflightCheck(system: string): Promise<string> {
  await simulateWork(400);
  return `${system}: nominal`;
}

export async function requestLaunchPoll(flightDirector: string): Promise<void> {
  await simulateWork(300);
  await ownWorkflowHandle().signal('goForLaunch', flightDirector);
}

export async function recordLaunchPoll(
  flightDirector: string,
): Promise<string> {
  await simulateWork(300);
  return `${flightDirector} polled all stations: GO for launch`;
}

export async function fireStage(stage: string): Promise<string> {
  await simulateWork(500);
  return `${stage} burn complete`;
}

export async function separateStage(stage: string): Promise<string> {
  await simulateWork(300);
  return `${stage} separated`;
}

export async function deploySatellite(satelliteId: string): Promise<string> {
  await simulateWork(400);
  return `${satelliteId} released from dispenser`;
}

export async function powerOnSatellite(satelliteId: string): Promise<string> {
  await simulateWork(300);
  return `${satelliteId} solar arrays deployed`;
}

export async function establishContact(satelliteId: string): Promise<string> {
  await simulateWork(400);
  return `${satelliteId} acquired by ground station`;
}

export async function requestOrbitAdjustment(
  adjustment: OrbitAdjustment,
): Promise<void> {
  await simulateWork(300);
  await ownWorkflowHandle().startUpdate('adjustOrbit', {
    args: [adjustment],
    updateId: `adjust-orbit-${adjustment.satelliteId}`,
    waitForStage: WorkflowUpdateStage.ACCEPTED,
  });
}

export async function planOrbitBurn(
  adjustment: OrbitAdjustment,
): Promise<string> {
  await simulateWork(400);
  return `${adjustment.satelliteId}: ${adjustment.deltaVMetersPerSecond} m/s prograde burn planned`;
}

export async function confirmOrbit(satelliteId: string): Promise<string> {
  await simulateWork(300);
  return `${satelliteId} orbit confirmed`;
}
