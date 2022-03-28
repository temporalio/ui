describe('Redirect to Events Import', () => {
  it(`should redirect from "/import" to "/import/events"`, () => {
    cy.visit('/import');

    cy.url().should('include', '/import/events');
  });
});

describe('Import JSON File for Event History', () => {
  beforeEach(() => {
    cy.visit('/import/events');
  });

  it('should redirect to first event on successful import', () => {
    cy.get('[data-cy="file-input"]').selectFile('cypress/fixtures/raw_events.json');
    cy.get('.import-btn').click();

    cy.url().should('include', '/import/events/1');
  });

  it('should not redirect on unsuccessful import', () => {
    cy.get('[data-cy="file-input"]').selectFile('cypress/fixtures/raw_events_bad.json');
    cy.get('.import-btn').click();

    cy.url().should('not.include', '/import/events/1');
  });
});
