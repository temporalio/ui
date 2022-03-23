/// <reference types="cypress" />

describe('Workflow Executions List', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit('/namespaces/default/workflows');

    cy.wait('@list-workflows-api');
    cy.wait('@namespaces-api');
  });

  it('should default to 24 hours for the time range', () => {
    cy.url().should('contain', 'time-range=24+hours');

    cy.get('#time-range-filter')
      .find('option:selected')
      .should('have.value', '24 hours');
  });

  it('should default to showing all workflows', () => {
    cy.get('#status-filter')
      .find('option:selected')
      .should('have.value', 'null');

    cy.get('#workflow-id-filter').should('have.value', '');

    cy.get('#workflow-type-filter').should('have.value', '');
  });
});
