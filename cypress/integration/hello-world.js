describe('A Basic Sanity Check', () => {
  it('verifies that the word "Temporal" is somewhere on the page', () => {
    cy.visit('http://localhost:3000');

    cy.contains('Temporal');
  });
});
