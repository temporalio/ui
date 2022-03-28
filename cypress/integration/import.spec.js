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
    cy.fixture('raw_events').as('events');

    cy.get('input[type=file]').selectFile('@events');
    cy.get('.import-btn').click();

    cy.url().should('include', '/import/events/1');
  });

  it('should not redirect on unsuccessful import', () => {
    cy.fixture('raw_events_bad').as('events');

    cy.get('input[type=file]').selectFile('@events');
    cy.get('.import-btn').click();

    cy.url().should('not.include', '/import/events/1');
  });
});
