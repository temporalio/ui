/**
 * Its own module so a provider's field components can reach it without
 * importing the registry, which imports them in turn.
 */
export const TERRAFORM_MODULES =
  'https://github.com/temporalio/terraform-modules/tree/main/modules/serverless-workers';
