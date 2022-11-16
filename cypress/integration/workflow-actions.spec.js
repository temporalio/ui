/// <reference types="cypress" />

import workflowCompletedFixture from '../fixtures/workflow-running.json';

const { workflowId, runId } =
  workflowCompletedFixture.workflowExecutionInfo.execution;

describe('Workflow Actions', () => {
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

  describe('Terminate', () => {
    it('should show the Terminate button if the workflow is running and write actions are enabled', () => {
      cy.intercept(Cypress.env('VITE_API_HOST') + `/api/v1/settings?`, {
        fixture: 'settings.json',
      }).as('settings-api');

      cy.visit(
        `/namespaces/default/workflows/${workflowId}/${runId}/history/feed?sort=descending`,
      );

      cy.wait('@settings-api');
      cy.wait('@workflow-api');

      cy.get('#workflow-actions-menu-button').click();
      cy.get('#workflow-actions-menu > [data-cy="terminate-button"]').click();
      cy.get('#workflow-termination-reason').type('test');
      cy.get('[data-cy="confirm-modal-button"').click();
      cy.get('#workflow-termination-success-toast').should('exist');
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

      cy.get('[data-cy="workflow-id-heading"]').should('exist');
      cy.get('#workflow-actions-menu-button').click();
      cy.get('[data-cy="terminate-button"]').should('have.class', 'disabled');
    });
  });

  describe('Cancel', () => {
    it('shows the Cancel button if the workflow is running a write actions are enabled', () => {
      cy.intercept(Cypress.env('VITE_API_HOST') + `/api/v1/settings?`, {
        fixture: 'settings.json',
      }).as('settings-api');

      cy.visit(
        `/namespaces/default/workflows/${workflowId}/${runId}/history/feed?sort=descending`,
      );

      cy.wait('@settings-api');
      cy.wait('@workflow-api');

      cy.get('#workflow-actions-primary-button').click();
      cy.get('[data-cy="confirm-modal-button"]').click();
    });
  });
});
