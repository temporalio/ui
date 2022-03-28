describe('Redirect to Events Import', () => {
  it(`should redirect from "/import" to "/import/events"`, () => {
    cy.visit('/import');

    cy.url().should('include', '/import/events');
  });
});
