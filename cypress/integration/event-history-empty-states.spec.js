/// <reference types="cypress" />

import workflowsFixture from '../fixtures/workflows.json';

const workflow = workflowsFixture.executions[0];
const { workflowId, runId } = workflow.execution;
const workflowUrl = `/namespaces/default/workflows/${workflowId}/${runId}`;

describe('Workflow Executions List', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events/reverse?`,
      { fixture: 'event-history-empty.json' },
    ).as('event-history-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*?`,
      { fixture: 'workflow-completed.json' },
    ).as('workflow-api');
  });

  it(`should show an empty state in the feed view`, () => {
    cy.visit(workflowUrl + `/history`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-api');

    cy.contains('No Events Match');
  });

  it(`should show an empty state in the compact view`, () => {
    cy.visit(workflowUrl + `/history`);

    cy.wait('@workflow-api');
    cy.wait('@event-history-api');

    cy.get('[data-cy="compact"]').click();

    cy.contains('No Events Match');
  });

  it('should display a custom empty state if there are events, but no event groups', () => {
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events*`,
      { fixture: 'event-history-with-no-activities.json' },
    ).as('event-history-api');

    cy.visit(workflowUrl + `/history`);

    cy.get('[data-cy="compact"]').click();

    cy.contains('No Events Match');
  });
});
