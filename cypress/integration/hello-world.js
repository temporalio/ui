describe('A Basic Sanity Check', () => {
  it('verifies that the word "Temporal" is somewhere on the page', () => {
    cy.intercept(`${process.env.CYPRESS_API_HOST}/api/workflows.json`, {
      fixture: 'workflows.json',
    });
    cy.visit('http://localhost:3000');
    cy.contains('Temporal');
  });
});
