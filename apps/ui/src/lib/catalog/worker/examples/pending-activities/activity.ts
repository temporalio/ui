export async function retryingActivity(index: number): Promise<string> {
  throw new Error(
    `Retrying activity ${index} fails on every attempt so it stays pending`,
  );
}

export async function unpolledActivity(index: number): Promise<string> {
  return `Unpolled activity ${index} completed`;
}
