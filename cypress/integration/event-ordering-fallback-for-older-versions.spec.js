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
    ).as('event-history-ascending');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
      `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?`,
      { fixture: 'event-history-completed-reverse.json' },
    ).as('event-history-descending');
  });

  it('should default to sorting events in descending order if on a modern version', () => {
    cy.interceptClusterApi();

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}/history`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-descending');
  });

  it('should sort events in ascending if a query param is set', () => {
    cy.interceptClusterApi();

    cy.visit(
      `/namespaces/default/workflows/${workflowId}/${runId}/history?sort=ascending`,
    );

    cy.wait('@workflow-api');
    cy.wait('@event-history-start');
    cy.wait('@event-history-end');
    cy.wait('@event-history-ascending');
  });

  it('should sort events in descending if a query param is set', () => {
    cy.interceptClusterApi();

    cy.visit(
      `/namespaces/default/workflows/${workflowId}/${runId}/history?sort=descending`,
    );

    cy.wait('@event-history-descending');
  });
});
