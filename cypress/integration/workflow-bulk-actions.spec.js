/// <reference types="cypress" />

describe('Bulk Termination', () => {
  it("disallows bulk actions for cluster that doesn't have elasticsearch enabled", () => {
    cy.interceptApi();

    cy.visit('/namespaces/default/workflows');

    cy.wait('@workflows-api');
    cy.wait('@cluster-api');

    cy.get('#workflows-table-with-bulk-actions').should('not.exist');
  });

  it('allows running workflows to be terminated for cluster that does have elasticsearch enabled', () => {
    cy.interceptApi();
    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/cluster*', {
      fixture: 'cluster-with-elasticsearch.json',
    }).as('cluster-api-elasticsearch');

    cy.visit('/namespaces/default/workflows');

    cy.wait('@workflows-api');
    cy.wait('@cluster-api-elasticsearch');

    cy.get('#workflows-table-with-bulk-actions').should('exist');

    cy.get('th.selectable > label.checkbox > span.label').click();
    cy.get('[data-cy="bulk-terminate-button"]').click();
    cy.get('#bulk-terminate-reason').type('Sarah Connor');
    cy.get('div.modal button.destructive').click();
    cy.get('#batch-terminate-success-toast');
  });
});
