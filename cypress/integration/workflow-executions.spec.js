/// <reference types="cypress" />

const waitOnAPIs = () => {
  cy.wait('@open-api');
  cy.wait('@closed-api');
};

describe('Workflow Executions List', () => {
  beforeEach(() => {
    cy.visit('/namespaces/default/workflows');

    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/namespaces?*', {
      fixture: 'namespaces.json',
    }).as('namespaces-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        '/api/v1/namespaces/default/workflows/open?*',
      { fixture: 'open-workflows.json' },
    ).as('open-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        '/api/v1/namespaces/default/workflows/closed?*',
      { fixture: 'closed-workflows.json' },
    ).as('closed-api');
  });

  it('should call the namespaces when starting up', () => {
    waitOnAPIs();
  });

  it('should default to 24 hours for the time range', () => {
    waitOnAPIs();

    cy.url().should('contain', '?time-range=24+hours');

    cy.get('#time-range-filter')
      .find('option:selected')
      .should('have.value', '24 hours');
  });

  it('should default to showing all workflows', () => {
    waitOnAPIs();

    cy.get('#status-filter')
      .find('option:selected')
      .should('have.value', 'null');
  });
});
