import cluster from '../fixtures/cluster.json';

describe('Banner', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit('/');
  });

  it('should show Temporal New Version banner', () => {
    cy.get('[data-cy=temporal-version-banner]').should('be.visible');
  });

  it('should show UI New Version banner', () => {
    cy.get('[data-cy=temporal-version-banner]').should('be.visible');
    cy.get('[data-cy=close-banner]').click();

    cy.get('[data-cy=temporal-version-banner]').should('not.exist');
    cy.get('[data-cy=ui-version-banner]').should('be.visible');
  });

  it('after closing banner, it should not be visible for the same version', () => {
    cy.get('[data-cy=temporal-version-banner]').should('be.visible');
    cy.get('[data-cy=close-banner]').click();

    cy.visit('/');

    cy.get('[data-cy=temporal-version-banner]').should('not.exist');
  });

  it('after closing banner, it should be visible when upgraded to a newer version', () => {
    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/cluster*', {
      ...cluster,
      versionInfo: {
        current: { version: '1.15.0' },
        recommended: { version: '1.16.0' },
      },
    }).as('cluster-api');
    cy.get('[data-cy=temporal-version-banner]').should('be.visible');
    cy.get('[data-cy=close-banner]').click();
    cy.get('[data-cy=temporal-version-banner]').should('not.exist');

    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/cluster*', {
      ...cluster,
      versionInfo: {
        current: { version: '1.16.0' },
        recommended: { version: '1.17.0' },
      },
    }).as('cluster-api');

    cy.visit('/');

    cy.get('[data-cy=temporal-version-banner]').should('be.visible');
  });
});
