/// <reference types="cypress" />

import workflowRunningFixture from '../fixtures/workflow-running.json';

const { workflowId, runId } =
  workflowRunningFixture.workflowExecutionInfo.execution;

describe('Workflow Actions', () => {
  beforeEach(() => {
    cy.interceptApi();
    cy.setTopNavFeatureTag();

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-running.json' },
    ).as('workflow-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?maximumPageSize=20`,
      { fixture: 'event-history-running.json' },
    ).as('event-history-start');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?maximumPageSize=20`,
      { fixture: 'event-history-running.json' },
    ).as('event-history-end');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?`,
      { fixture: 'event-history-running.json' },
    ).as('event-history-descending');

    cy.visit(
      `/namespaces/default/workflows/${workflowId}/${runId}/history/feed?sort=descending`,
    );

    cy.waitForWorkflowAPIs();
  });

  describe('Terminate', () => {
    it('works if the workflow is running and write actions are enabled', () => {
      const confirmBtn =
        '[data-testid="terminate-confirmation-modal"] [data-testid="confirm-modal-button"]';
      cy.get('#workflow-actions-menu-button').click();
      cy.get(
        '#workflow-actions-menu >> [data-testid="terminate-button"]',
      ).click();
      cy.get('#workflow-termination-reason').type('test');
      cy.get(confirmBtn).click();

      cy.wait('@terminate-workflow-api');
      cy.waitForWorkflowAPIs();

      cy.get('#workflow-termination-success-toast').should('exist');
      cy.get(confirmBtn).should('not.be.visible');
    });
  });

  describe('Cancel', () => {
    it('works if the workflow is running and write actions are enabled', () => {
      const confirmBtn =
        '[data-testid="cancel-confirmation-modal"] [data-testid="confirm-modal-button"]';
      cy.get('#workflow-actions-primary-button').click();
      cy.get(confirmBtn).click();

      cy.wait('@cancel-workflow-api');
      cy.waitForWorkflowAPIs();
      cy.get('#workflow-cancelation-success-toast').should('exist');
      cy.get(confirmBtn).should('not.be.visible');
    });
  });

  describe('Signal', () => {
    it('works if the workflow is running and write actions are enabled', () => {
      const confirmBtn =
        '[data-testid="signal-confirmation-modal"] [data-testid="confirm-modal-button"]';
      cy.get('#workflow-actions-menu-button').click();
      cy.get('#workflow-actions-menu >> [data-testid="signal-button"]').click();
      cy.get('#signal-name').type('sos');
      cy.get('div.cm-content').type('{{}{enter}"sos":true');
      cy.get(confirmBtn).click();

      cy.wait('@signal-workflow-api');
      cy.waitForWorkflowAPIs();

      cy.get('#workflow-signal-success-toast').should('exist');
      cy.get(confirmBtn).should('not.be.visible');
    });
  });

  describe('Reset', () => {
    const confirmBtn =
      '[data-testid="reset-confirmation-modal"] [data-testid="confirm-modal-button"]';

    it('to an arbitrary workflow task if the workflow is running, and the action is enabled', () => {
      cy.get('#workflow-actions-menu-button').click();
      cy.get('#workflow-actions-menu >> [data-testid="reset-button"]').click();
      cy.get('input[name="reset-event-id"').first().click();
      cy.get('#reset-reason').type('test');
      cy.get(confirmBtn).click();

      cy.wait('@reset-workflow-api');
      cy.waitForWorkflowAPIs();

      cy.get('[data-testid="workflow-reset-alert"]').should('be.visible');
      cy.get(confirmBtn).should('not.be.visible');
    });
  });
});

describe('Write Actions Disabled', () => {
  beforeEach(() => {
    cy.interceptApi();
    cy.setTopNavFeatureTag();
    cy.intercept(Cypress.env('VITE_API_HOST') + `/api/v1/settings?`, {
      fixture: 'settings.write-actions-disabled.json',
    }).as('settings-api');
    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}?`,
      { fixture: 'workflow-running.json' },
    ).as('workflow-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events?maximumPageSize=20`,
      { fixture: 'event-history-running.json' },
    ).as('event-history-start');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?maximumPageSize=20`,
      { fixture: 'event-history-running.json' },
    ).as('event-history-end');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        `/api/v1/namespaces/default/workflows/${workflowId}/runs/${runId}/events/reverse?`,
      { fixture: 'event-history-running.json' },
    ).as('event-history-descending');

    cy.visit(
      `/namespaces/default/workflows/${workflowId}/${runId}/history/feed?sort=descending`,
    );

    cy.waitForWorkflowAPIs();
  });

  it('the Cancel button is disabled if write actions are disabled', () => {
    cy.get('#workflow-actions-primary-button').should('be.disabled');
    cy.get('#workflow-actions-menu-button').should('be.disabled');
  });
});
