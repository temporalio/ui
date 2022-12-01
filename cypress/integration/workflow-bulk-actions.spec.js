/// <reference types="cypress" />

describe('Bulk Terminate', () => {
  it("disallows bulk actions for cluster that doesn't have elasticsearch enabled", () => {
    cy.interceptApi();

    cy.visit('/namespaces/default/workflows');

    cy.wait('@cluster-api');
    cy.wait('@workflows-api');

    cy.get('#workflows-table-with-bulk-actions').should('not.exist');
  });

  describe('for cluster that does have elasticsearch enabled', () => {
    it('allows running workflows to be terminated by ID', () => {
      cy.interceptApi();
      cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/cluster*', {
        fixture: 'cluster-with-elasticsearch.json',
      }).as('cluster-api-elasticsearch');

      cy.visit('/namespaces/default/workflows');

      cy.wait('@cluster-api-elasticsearch');
      cy.wait('@workflows-api');

      cy.get('#workflows-table-with-bulk-actions').should('exist');

      cy.get('#select-visible-workflows').click({ force: true });
      cy.get('[data-cy="bulk-terminate-button"]').click();
      cy.get('#bulk-terminate-reason').type('Sarah Connor');
      cy.get('div.modal button.destructive').click();
      cy.get('#batch-terminate-success-toast');
    });

    it('allows running workflows to be terminated by a query', () => {
      cy.interceptApi();
      cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/cluster*', {
        fixture: 'cluster-with-elasticsearch.json',
      }).as('cluster-api-elasticsearch');

      cy.visit('/namespaces/default/workflows');

      cy.wait('@cluster-api-elasticsearch');
      cy.wait('@workflows-api');

      cy.get('#workflows-table-with-bulk-actions').should('exist');

      cy.get('#select-visible-workflows').click({ force: true });
      cy.get('[data-cy="select-all-workflows"]').click();
      cy.get('[data-cy="bulk-terminate-button"]').click();
      cy.get('[data-cy="batch-action-workflows-query"]').should(
        'have.text',
        'ExecutionStatus="Running"',
      );
      cy.get('#bulk-terminate-reason').type('Sarah Connor');
      cy.get('div.modal button.destructive').click();
      cy.get('#batch-terminate-success-toast');
    });
  });
});
