/// <reference types="cypress" />

describe('Bulk Termination', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit('/namespaces/default/workflows');

    cy.wait('@workflows-api');
  });

  it('allows running workflows to be terminated', () => {
    cy.get('th.selectable > label.checkbox > span.label').click();
    cy.get('[data-cy="bulk-terminate-button"]').click();
    cy.get('#bulk-terminate-reason').type('Sarah Connor');
    cy.get('div.modal button.destructive').click();
    cy.get('#batch-terminate-success-toast');
  });
});
