/// <reference types="cypress" />

import workflowRunningFixture from '../fixtures/workflow-running.json';
import workflowCompletedFixture from '../fixtures/workflow-completed.json';

const { workflowId, runId } =
  workflowCompletedFixture.workflowExecutionInfo.execution;

describe('Stack Trace', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events*`,
      { fixture: 'event-history-completed.json' },
    ).as('event-history-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-completed.json' },
    ).as('workflow-api');

    cy.visit('/namespaces/default/workflows');

    cy.wait('@workflows-api');
    cy.wait('@namespaces-api');
  });

  it('should show No Stack Trace for completed workflow', () => {
    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-api');
    cy.wait('@query-api');

    cy.get(
      `[href="/namespaces/default/workflows/${workflowId}/${runId}/history/json?per-page=100"]`,
    ).click();

    cy.get(
      `[href="/namespaces/default/workflows/${workflowId}/${runId}/stack-trace"]`,
    ).click();

    cy.get('[data-cy="query-stack-trace-empty"]').contains(
      'No Stack Traces Found',
    );
  });

  it('should show stack trace for running workflow', () => {
    const { workflowId, runId } =
      workflowRunningFixture.workflowExecutionInfo.execution;

    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-running.json' },
    ).as('workflow-api');

    cy.wait('@workflow-api');
    cy.wait('@event-history-api');
    cy.wait('@query-api');

    cy.get(
      `[href="/namespaces/default/workflows/${workflowId}/${runId}/history/json?per-page=100"]`,
    ).click();

    cy.get(
      `[href="/namespaces/default/workflows/${workflowId}/${runId}/stack-trace"]`,
    ).click();

    cy.get('[data-cy="query-stack-trace"]').contains('go.temporal.io/sdk');
  });
});
