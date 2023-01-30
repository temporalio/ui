/// <reference types="cypress" />

import workflowsFixture from '../fixtures/workflows.json';

const workflow = workflowsFixture.executions[0];
const { workflowId, runId } = workflow.execution;

describe('Fallback to Ascending Ordering of Event History on Older Versions of Temporal Server', () => {
  beforeEach(() => {
    cy.interceptNamespacesApi();
    cy.interceptGithubReleasesApi();
    cy.interceptQueryApi();
    cy.interceptTaskQueuesApi();
    cy.interceptSettingsApi();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-completed.json' },
    ).as('workflow-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?maximumPageSize=20`,
      { fixture: 'event-history-completed.json' },
    ).as('event-history-start');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?maximumPageSize=20`,
      { fixture: 'event-history-completed-reverse.json' },
    ).as('event-history-end');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?`,
      { fixture: 'event-history-completed.json' },
    ).as('event-history-json-ascending');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?`,
      { fixture: 'event-history-completed-reverse.json' },
    ).as('event-history-descending');
  });

  it('should show the events in ascending order in the JSON view', () => {
    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}/history`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');

    cy.get('[data-cy="json"]').click();

    cy.wait('@event-history-json-ascending');
  });
});
