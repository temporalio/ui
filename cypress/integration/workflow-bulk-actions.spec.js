/// <reference types="cypress" />

describe('Batch and Bulk Workflow Actions', () => {
  describe('when advanced visibility is disabled', () => {
    it('disallows bulk and batch actions', () => {
      cy.interceptApi();

      cy.visit('/namespaces/default/workflows');

      cy.wait('@cluster-api');
      cy.wait('@workflows-api');

      cy.get('#workflows-table-with-bulk-actions').should('not.exist');
    });
  });

  describe('when advanced visibility is enabled', () => {
    beforeEach(() => {
      cy.interceptApi();

      cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/cluster*', {
        fixture: 'cluster-with-elasticsearch.json',
      }).as('cluster-api-elasticsearch');

      cy.visit('/namespaces/default/workflows');

      cy.wait('@cluster-api-elasticsearch');
      cy.wait('@workflows-api');
    });

    it('allows running workflows to be terminated by ID', () => {
      cy.get('#workflows-table-with-bulk-actions').should('exist');

      cy.get('#select-visible-workflows').click({ force: true });
      cy.get('[data-testid="bulk-terminate-button"]').click();
      cy.get('#bulk-action-reason').type('Sarah Connor');
      cy.get('div.modal button.destructive').click();
      cy.get('#batch-terminate-success-toast');
    });

    it('allows running workflows to be terminated by a query', () => {
      cy.get('#workflows-table-with-bulk-actions').should('exist');

      cy.get('#select-visible-workflows').click({ force: true });
      cy.get('[data-testid="select-all-workflows"]').click();
      cy.get('[data-testid="bulk-terminate-button"]').click();
      cy.get('[data-testid="batch-action-workflows-query"]').should(
        'have.text',
        'ExecutionStatus="Running"',
      );
      cy.get('#bulk-action-reason').type('Sarah Connor');
      cy.get('div.modal button.destructive').click();
      cy.get('#batch-terminate-success-toast');
    });

    it('allows running workflows to be cancelled by ID', () => {
      cy.get('#workflows-table-with-bulk-actions').should('exist');

      cy.get('#select-visible-workflows').click({ force: true });
      cy.get('[data-testid="bulk-cancel-button"]').click();
      cy.get('#bulk-action-reason').type('Sarah Connor');
      cy.get('div.modal button.destructive').click();
      cy.get('#batch-cancel-success-toast');
    });

    it('allows running workflows to be cancelled by a query', () => {
      cy.get('#workflows-table-with-bulk-actions').should('exist');

      cy.get('#select-visible-workflows').click({ force: true });
      cy.get('[data-testid="select-all-workflows"]').click();
      cy.get('[data-testid="bulk-cancel-button"]').click();
      cy.get('[data-testid="batch-action-workflows-query"]').should(
        'have.text',
        'ExecutionStatus="Running"',
      );
      cy.get('#bulk-action-reason').type('Sarah Connor');
      cy.get('div.modal button.destructive').click();
      cy.get('#batch-cancel-success-toast');
    });
  });
});
