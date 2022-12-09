/// <reference types="cypress" />

import workflowsFixture from '../fixtures/workflows.json';

const workflowRunningFixture = workflowsFixture.executions[0];
const { workflowId, runId } = workflowRunningFixture.execution;

const statuses = [
  'Running',
  'TimedOut',
  'Completed',
  'Failed',
  'ContinuedAsNew',
  'Canceled',
  'Terminated',
];

describe('Workflow Executions List', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit('/namespaces/default/workflows');

    cy.wait('@workflows-api');
    cy.wait('@namespaces-api');
  });

  it('should default to All for the time range', () => {
    cy.get('#time-range-filter').find('option').should('have.value', 'null');
  });

  it('should default to showing all workflows', () => {
    cy.get('#execution-status-filter')
      .find('option:selected')
      .should('have.value', 'null');

    cy.get('#workflow-id-filter').should('have.value', '');

    cy.get('#workflow-type-filter').should('have.value', '');
  });

  describe('Workflow Filters', () => {
    it('should send the correct query for Workflow Type', () => {
      const result = encodeURIComponent('WorkflowType="ImportantWorkflowType"');

      cy.get('#workflow-type-filter').type('ImportantWorkflowType');

      cy.url().should('contain', result);
    });

    it('should send the correct query for Workflow ID', () => {
      const result = encodeURIComponent('WorkflowId="002c98_Running"');

      cy.get('#workflow-id-filter').type('002c98_Running');

      cy.url().should('contain', result);
    });

    for (const status of statuses) {
      it(`should redirect to the correct query params for ${status} workflows`, () => {
        cy.visit(`/namespaces/default/workflows`);
        cy.get('#execution-status-filter').select(status).trigger('input');
        cy.url().should(
          'contain',
          encodeURIComponent(`ExecutionStatus="${status}"`),
        );
      });

      it(`should send the correct query when filtering for ${status} workflows`, () => {
        cy.visit(
          `/namespaces/default/workflows?query=${encodeURIComponent(
            `ExecutionStatus="${status}"`,
          )}`,
        );

        cy.get('#execution-status-filter').should('have.value', status);
      });
    }

    describe('Workflow Filters with Navigation ', () => {
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
      });

      it('should keep single workflow filter after navigating away and back to workflow list', () => {
        cy.get('#execution-status-filter')
          .find('option:selected')
          .should('have.value', 'null');

        cy.get('#execution-status-filter').select('Running').trigger('input');
        cy.url().should(
          'contain',
          encodeURIComponent(`ExecutionStatus="Running"`),
        );

        cy.get('.workflow-summary-row').first().click();

        cy.wait('@workflow-api');
        cy.wait('@event-history-api');

        cy.url().should('contain', '/history');
        cy.get('[data-cy="back-to-workflows"]').click();

        cy.url().should(
          'contain',
          encodeURIComponent(`ExecutionStatus="Running"`),
        );
        cy.get('#execution-status-filter')
          .find('option:selected')
          .should('have.value', 'Running');
      });
    });
  });
});
