export function loadDeploymentPage({
  depends,
}: {
  params: { namespace: string; deployment: string };
  depends: (...deps: `${string}:${string}`[]) => void;
}) {
  depends('data:deployment');
}
