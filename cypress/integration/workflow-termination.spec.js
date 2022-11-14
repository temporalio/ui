/// <reference types="cypress" />

import workflowCompletedFixture from '../fixtures/workflow-running.json';

const { workflowId, runId } =
  workflowCompletedFixture.workflowExecutionInfo.execution;

describe('Terminate Button is Shown', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/*/runs/*/events/*`,
      { fixture: 'event-history-completed-reverse.json' },
    ).as('event-history-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-running.json' },
    ).as('workflow-api');
  });

  it('should show the Terminate button if the workflow is running and write actions are enabled', () => {
    cy.intercept(Cypress.env('VITE_API_HOST') + `/api/v1/settings?`, {
      fixture: 'settings.json',
    }).as('settings-api');

    cy.visit(
      `/namespaces/default/workflows/${workflowId}/${runId}/history/feed?sort=descending`,
    );

    cy.wait('@settings-api');
    cy.wait('@workflow-api');

    cy.get('[aria-controls="workflow-actions"]').click();
    cy.get('[data-cy="terminate-button"]');
  });

  it('should not show the Terminate button if the workflow is running and write actions are enabled', () => {
    cy.intercept(Cypress.env('VITE_API_HOST') + `/api/v1/settings?`, {
      fixture: 'settings.write-actions-disabled.json',
    }).as('settings-api');

    cy.visit(
      `/namespaces/default/workflows/${workflowId}/${runId}/history/feed?sort=descending`,
    );

    cy.wait('@settings-api');
    cy.wait('@workflow-api');

    cy.get('[aria-controls="workflow-actions"]').should('not.exist');
  });
});
