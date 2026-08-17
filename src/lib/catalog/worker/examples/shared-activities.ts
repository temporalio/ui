const wait = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

export async function greet(name: string): Promise<string> {
  return `Guten tag ${name}!`;
}

export async function processData(
  dataId: string,
  delay = 1000,
  modulo = 7,
): Promise<string> {
  const startTime = Date.now();
  await wait(delay + Math.random() * 2000);

  const checkTime = Date.now();
  if (checkTime % modulo !== 0) {
    throw new Error(
      `ProcessDataA failed for ${dataId}: timestamp ${checkTime} % ${modulo} = ${checkTime % modulo} (not 0)`,
    );
  }

  const duration = Math.round((checkTime - startTime) / 1000);
  return `ProcessDataA-${dataId}-success-${duration}s`;
}
