import { Context } from '@temporalio/activity';
import { Client, Connection, type ConnectionOptions } from '@temporalio/client';

const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const connectionOptionsFromEnvironment = (): ConnectionOptions => {
  const address = process.env.TEMPORAL_ADDRESS ?? '127.0.0.1:7233';
  const apiKey = process.env.TEMPORAL_API_KEY;
  const certificate =
    process.env.TEMPORAL_TLS_CLIENT_CERT_BASE64 ??
    process.env.TEMPORAL_TLS_CERT;
  const privateKey =
    process.env.TEMPORAL_TLS_CLIENT_KEY_BASE64 ?? process.env.TEMPORAL_TLS_KEY;
  const serverRootCACertificate =
    process.env.TEMPORAL_TLS_SERVER_ROOT_CA_CERT_BASE64;
  const serverNameOverride = process.env.TEMPORAL_TLS_SERVER_NAME_OVERRIDE;

  if (apiKey) return { address, apiKey, tls: true };
  if (!certificate || !privateKey) return { address };

  return {
    address,
    tls: {
      clientCertPair: {
        crt: Buffer.from(certificate, 'base64'),
        key: Buffer.from(privateKey, 'base64'),
      },
      ...(serverRootCACertificate
        ? {
            serverRootCACertificate: Buffer.from(
              serverRootCACertificate,
              'base64',
            ),
          }
        : {}),
      ...(serverNameOverride ? { serverNameOverride } : {}),
    },
  };
};

export async function establishRelayLink(relay: string): Promise<string> {
  const { attempt } = Context.current().info;
  await wait(750);

  if (attempt < 3) {
    throw new Error(`Dust interference blocked ${relay} on attempt ${attempt}`);
  }

  return `Telemetry link established through ${relay} on attempt ${attempt}`;
}

export async function calibrateHighGainAntenna(
  roverId: string,
): Promise<string> {
  await wait(1_250);
  return `${roverId} high-gain antenna calibrated`;
}

export async function analyzeSampleCanister(
  canisterId: string,
): Promise<string> {
  const context = Context.current();

  for (let scan = 1; scan <= 120; scan += 1) {
    await Promise.race([wait(1_000), context.cancelled]);
    context.heartbeat({ canisterId, scan, status: 'spectrometer-scanning' });
  }

  return `Analysis completed for ${canisterId}`;
}

export async function sealSampleCanister(canisterId: string): Promise<string> {
  await wait(900);
  return `${canisterId} sealed for storm protection`;
}

export async function enterStormSafeMode(roverId: string): Promise<string> {
  await wait(900);
  return `${roverId} entered storm-safe power mode`;
}

export async function recordGroundContact(
  roverId: string,
  relay: string,
): Promise<string> {
  await wait(600);
  return `${roverId} confirmed contact through ${relay}`;
}

export async function validateTelemetryStream(
  roverId: string,
  relay: string,
): Promise<string> {
  await wait(700);
  return `${roverId} telemetry from ${relay} passed integrity checks`;
}

export async function resumeMissionTelemetry(roverId: string): Promise<string> {
  await wait(500);
  return `${roverId} resumed high-rate mission telemetry`;
}

export async function assessTraverseRoute(
  roverId: string,
  route: string,
): Promise<string> {
  await wait(650);
  return `${roverId} found no storm hazards along ${route}`;
}

export async function applyTraverseRoute(
  roverId: string,
  route: string,
): Promise<string> {
  await wait(800);
  return `${roverId} traverse plan changed to ${route}`;
}

export async function uploadTraverseWaypoints(
  roverId: string,
  route: string,
): Promise<string> {
  await wait(550);
  return `${route} waypoints uploaded to ${roverId}`;
}

export async function directMissionControlDemo(
  relayReservationWorkflowId: string,
): Promise<string[]> {
  const { namespace, workflowExecution } = Context.current().info;
  if (!workflowExecution) {
    throw new Error('Mission Control director must be run from a Workflow');
  }

  const connection = await Connection.connect(
    connectionOptionsFromEnvironment(),
  );
  const client = new Client({ connection, namespace });
  const roverMission = client.workflow.getHandle(
    workflowExecution.workflowId,
    workflowExecution.runId,
  );
  const evidence: string[] = [];

  try {
    await wait(2_000);
    await roverMission.signal(
      'groundContactRestored',
      'Mars Reconnaissance Orbiter',
    );
    evidence.push('ground-contact signal delivered');

    await wait(2_000);
    const updateResult = await roverMission.executeUpdate<string, [string]>(
      'changeTraverseRoute',
      {
        args: ['Northern Ridge'],
        updateId: `route-change-${workflowExecution.runId}`,
      },
    );
    evidence.push(updateResult);

    await wait(3_000);
    await client.workflow
      .getHandle(relayReservationWorkflowId)
      .terminate('Dedicated relay reservation superseded by direct contact');
    evidence.push('obsolete relay reservation terminated');

    return evidence;
  } finally {
    await connection.close();
  }
}
