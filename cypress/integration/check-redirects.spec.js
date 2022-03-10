/// <reference types="cypress" />

describe('Workflow Executions List', () => {
  it('should redirect ', () => {
    cy.visit('/');
    cy.url().should(
      'include',
      '/namespaces/default/workflows?time-range=24+hours',
    );
  });
});
