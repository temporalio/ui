/// <reference types="cypress" />

for (const namespace of ['default', 'some-other-namespace']) {
  describe(`Redirect to the correct default namespace: ${namespace}`, () => {
    const urls = ['/', '/namespaces', `/namespaces/${namespace}`];

    beforeEach(() => {
      cy.interceptApi({ namespace });
    });

    for (const url of urls) {
      it(`should redirect from "${url}" to "/namespaces/some-other-namespace/workflows"`, () => {
        cy.visit(url);
        cy.url().should('include', `/namespaces/${namespace}/workflows`);
      });
    }
  });
}
