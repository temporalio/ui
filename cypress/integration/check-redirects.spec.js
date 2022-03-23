/// <reference types="cypress" />

describe('Redirect to the workflow executions list', () => {
  const urls = ['/', '/namespaces', '/namespaces/default'];

  beforeEach(() => {
    cy.interceptApi();
  });

  for (const url of urls) {
    it(`should redirect from "${url}" to "/namespaces/default/workflows"`, () => {
      cy.visit(url);
      cy.url().should('include', '/namespaces/default/workflows');
    });
  }
});

describe.only('Redirect to the correct default namespace', () => {
  const urls = ['/', '/namespaces'];

  beforeEach(() => {
    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/namespaces*', {
      fixture: 'namespaces.json',
    }).as('namespaces-api');

    cy.intercept(
      Cypress.env('VITE_API_HOST') + '/api/v1/namespaces/*/workflows?query=*',
      { fixture: 'workflows.json' },
    ).as('list-workflows-api');

    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/cluster*', {
      fixture: 'cluster.json',
    }).as('settings-api');

    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/me*', {
      fixture: 'me.json',
    }).as('user-api');

    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/settings*', {
      Auth: { Enabled: false, Options: null },
      DefaultNamespace: 'some-other-namespace',
    }).as('settings-api');
  });

  for (const url of urls) {
    it(`should redirect from "${url}" to "/namespaces/default/workflows"`, () => {
      cy.visit(url);
      cy.url().should('include', '/namespaces/some-other-namespace/workflows');
    });
  }
});
