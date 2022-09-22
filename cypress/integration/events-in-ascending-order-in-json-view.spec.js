/// <reference types="cypress" />

const visitWorkflow = (suffix = '') => {
  cy.visit(
    `/namespaces/default/workflows/workflowId/runId/history/json${suffix}`,
  );
};

describe('Fallback to Ascending Ordering of Event History on Older Versions of Temporal Server', () => {
  beforeEach(() => {
    cy.interceptNamespacesApi();
    cy.interceptGithubReleasesApi();
    cy.interceptQueryApi();
    cy.interceptTaskQueuesApi();
    cy.interceptSettingsApi();
    cy.interceptWorkflowApi();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        '/api/v1/namespaces/default/workflows/workflowId/runs/runId/events?',
      { fixture: 'event-history-completed.json' },
    ).as('events-ascending-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        '/api/v1/namespaces/default/workflows/workflowId/runs/runId/events/reverse?',
      { fixture: 'event-history-completed-reverse.json' },
    ).as('events-descending-api');
  });

  it('should show the events in ascending order in the JSON view', () => {
    visitWorkflow();
    cy.wait('@events-ascending-api');
  });

  it('should ignore parameters for sort order in JSON view', () => {
    visitWorkflow('?sort=descending');
    cy.wait('@events-ascending-api');
  });
});
