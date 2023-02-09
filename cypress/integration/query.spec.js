/// <reference types="cypress" />

import workflowCompletedFixture from '../fixtures/workflow-completed.json';

const { workflowId, runId } =
  workflowCompletedFixture.workflowExecutionInfo.execution;

describe('Query', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events/reverse*`,
      { fixture: 'event-history-completed.json' },
    ).as('event-history-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-completed.json' },
    ).as('workflow-api');

    cy.visit('/');
    cy.wait('@workflows-api');
    cy.wait('@namespaces-api');
  });

  it('should render Query options for Java SDK', () => {
    cy.visit(`/namespaces/default/workflows/${workflowId}/${runId}`);

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/query*`,
      { fixture: 'query-java-error-unknown-type.json', statusCode: 400 },
    ).as('query-unknown-type-api');

    cy.on('uncaught:exception', () => {
      return false;
    });

    cy.wait('@workflow-api');
    cy.wait('@event-history-api');

    cy.get(
      `[href="/namespaces/default/workflows/${workflowId}/${runId}/query"]`,
    ).click();

    cy.wait('@query-unknown-type-api');

    cy.get('[data-testid=query-select]').contains('query1');
  });
});
