/// <reference types="cypress" />

const visitWorkflow = (suffix = '') => {
  cy.visit(`/namespaces/default/workflows/workflowId/runId/history${suffix}`);
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

  it('should default to sorting events in descending order if on a modern version', () => {
    cy.interceptClusterApi();
    visitWorkflow();
    cy.wait('@events-descending-api');
  });

  it('should sort events in ascending if a query param is set', () => {
    cy.interceptClusterApi();
    visitWorkflow('?sort=ascending');
    cy.wait('@events-ascending-api');
  });

  it('should sort events in descending if a query param is set', () => {
    cy.interceptClusterApi();
    visitWorkflow('?sort=descending');
    cy.wait('@events-descending-api');
  });

  it('should sort events in ascending if version history does not support it', () => {
    cy.interceptClusterApi('cluster-server-without-reserve-event-sorting.json');
    visitWorkflow();
    cy.wait('@events-ascending-api');
  });

  it('should sort events in ascending with ascending in query param if version history does not support it', () => {
    cy.interceptClusterApi('cluster-server-without-reserve-event-sorting.json');
    visitWorkflow('?sort=ascending');
    cy.wait('@events-ascending-api');
  });

  it('should sort events in ascending with descending in query param if version history does not support it', () => {
    cy.interceptClusterApi('cluster-server-without-reserve-event-sorting.json');
    visitWorkflow('?sort=descending');
    cy.wait('@events-ascending-api');
  });
});
