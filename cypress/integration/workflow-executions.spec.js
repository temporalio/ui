/// <reference types="cypress" />

describe('Workflow Executions List', () => {
  beforeEach(() => {
    cy.visit('/namespaces/default/workflows');

    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/namespaces*', {
      fixture: 'namespaces.json',
    }).as('namespaces-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') +
        '/api/v1/namespaces/default/workflows?query=*',
      { fixture: 'workflows.json' },
    ).as('list-workflows-api');

    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/settings*', {
      fixture: 'settings.json',
    }).as('settings-api');

    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/cluster*', {
      fixture: 'cluster.json',
    }).as('settings-api');

    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/me*', {
      fixture: 'me.json',
    }).as('user-api');

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
