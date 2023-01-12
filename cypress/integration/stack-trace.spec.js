/// <reference types="cypress" />

import workflowRunningFixture from '../fixtures/workflow-running.json';
import workflowCompletedFixture from '../fixtures/workflow-completed.json';

describe('Stack Trace With Completed Workflow', () => {
  const { workflowId, runId } =
    workflowCompletedFixture.workflowExecutionInfo.execution;
  const { name } = workflowCompletedFixture.executionConfig.taskQueue;

  beforeEach(() => {
    cy.interceptApi();

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
      `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?`,
      { fixture: 'event-history-completed-reverse.json' },
    ).as('event-history-descending');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
      `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-completed.json' },
    ).as('workflow-api');

    it('should show No Stack Trace for completed workflow', () => {
      cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

      cy.wait('@workflow-api');
      cy.wait('@event-history-start');
      cy.wait('@event-history-end');
      cy.wait('@event-history-descending');

      cy.get('[data-cy=stack-trace-tab]').click();

      cy.wait('@workflow-api');

      cy.get('[data-cy="query-stack-trace-empty"]').contains(
        'No Stack Traces Found',
      );
    });
  });

  describe('Stack Trace with Running Workflow', () => {
    const { workflowId, runId } =
      workflowRunningFixture.workflowExecutionInfo.execution;
    const { name } = workflowRunningFixture.executionConfig.taskQueue;

    beforeEach(() => {
      cy.interceptApi();

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
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?`,
        { fixture: 'event-history-completed-reverse.json' },
      ).as('event-history-descending');

      cy.intercept(
        Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
        { fixture: 'workflow-running.json' },
      ).as('workflow-api');

      it('should show stack trace for running workflow', () => {
        cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

        cy.wait('@workflow-api');
        cy.wait('@event-history-start');
        cy.wait('@event-history-end');
        cy.wait('@event-history-descending');

        cy.get('[data-cy=stack-trace-tab]').click();

        cy.wait('@workflow-api');
        cy.wait('@query-api');

        cy.get('[data-cy="query-stack-trace"]').contains('go.temporal.io/sdk');
      });

      it('should handle errors when the stack trace is not formatted as we expect', () => {
        cy.intercept(
          Cypress.env('VITE_API_HOST') +
          `/api/v1/namespaces/default/workflows/*/runs/*/query*`,
          { fixture: 'query-stack-trace-error.json' },
        ).as('query-api-error');

        cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

        cy.wait('@workflow-api');
        cy.wait('@event-history-start');
        cy.wait('@event-history-end');
        cy.wait('@event-history-descending');

        cy.get('[data-cy=stack-trace-tab]').click();

        cy.wait('@workflow-api');
        cy.wait('@query-api-error');

        cy.get('[data-cy="query-stack-trace"]').contains('[{"an":"error"}]');
      });
    });
