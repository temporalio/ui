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
    it('works if the workflow is running and write actions are enabled', () => {
      cy.visit(
        `/namespaces/default/workflows/${workflowId}/${runId}/history?sort=descending`,
      );

      cy.wait('@settings-api');
      cy.wait('@workflow-api');

      cy.get('#workflow-actions-menu-button').click();
      cy.get('#workflow-actions-menu > [data-cy="terminate-button"]').click();
      cy.get('#workflow-termination-reason').type('test');
      cy.get('[data-cy="confirm-modal-button"').click();
      cy.get('#workflow-termination-success-toast').should('exist');
    });
  });

  describe('Cancel', () => {
    it('works if the workflow is running a write actions are enabled', () => {
      cy.visit(
        `/namespaces/default/workflows/${workflowId}/${runId}/history?sort=descending`,
      );

      cy.wait('@settings-api');
      cy.wait('@workflow-api');

      cy.get('#workflow-actions-primary-button').click();
      cy.get('[data-cy="confirm-modal-button"]').click();

      cy.wait('@cancel-workflow-api');
    });
  });

  describe('Write Actions Disabled', () => {
    it('the Cancel button is disabled if write actions are disabled', () => {
      cy.intercept(Cypress.env('VITE_API_HOST') + `/api/v1/settings?`, {
        fixture: 'settings.write-actions-disabled.json',
      }).as('settings-api');

      cy.visit(
        `/namespaces/default/workflows/${workflowId}/${runId}/history?sort=descending`,
      );

      cy.wait('@settings-api');
      cy.wait('@workflow-api');

      cy.get('#workflow-actions-primary-button').should('be.disabled');
      cy.get('#workflow-actions-menu-button').should('be.disabled');
    });
  });
});
