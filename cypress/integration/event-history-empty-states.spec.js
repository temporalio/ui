/// <reference types="cypress" />

import workflowsFixture from '../fixtures/workflows.json';

const workflow = workflowsFixture.executions[0];
const { workflowId, runId } = workflow?.execution;
const workflowUrl = `/namespaces/default/workflows/${workflowId}/${runId}`;

describe('Workflow Executions List', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events*`,
      { fixture: 'event-history-empty.json' },
    ).as('event-history-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*?`,
      { fixture: 'workflow-completed.json' },
    ).as('workflow-api');
  });

  for (const view of ['feed', 'compact']) {
    it(`should show an empty state in the ${view} view`, () => {
      cy.visit(workflowUrl + `/history/${view}`);

      cy.wait('@workflow-api');
      cy.wait('@event-history-api');
      cy.wait('@query-api');

      cy.contains('No Events Match');
    });
  }

  it.only('should display a custom empty state if there are events, but no event groups', () => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events*`,
      { fixture: 'event-history-with-no-activities.json' },
    ).as('event-history-api');

    cy.visit(workflowUrl + `/history/compact`);

    cy.contains('No Events Match');
  });
});
