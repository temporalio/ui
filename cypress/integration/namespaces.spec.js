const namespaces = ['default', 'some-other-namespace'];

describe('Redirect to Workflow Exections', () => {
  for (const namespace of namespaces) {
    describe(`Default namespace: ${namespace}`, () => {
      const urls = ['/', '/namespaces', `/namespaces/${namespace}`];

      beforeEach(() => {
        cy.interceptApi({ namespace });
      });

      for (const url of urls) {
        it(`should redirect from "${url}" to "/namespaces/${namespace}/workflows"`, () => {
          cy.visit(url);

          cy.wait('@namespaces-api');
          cy.wait('@settings-api');
          cy.wait('@workflows-api');

          cy.url().should('include', `/namespaces/${namespace}/workflows`);
        });
      }
    });
  }
});

describe('Namespace Select', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit('/namespaces/default/workflows');

    cy.fixture('namespaces.json')
      .then(({ namespaces }) => {
        return namespaces
          .map((n) => n.namespaceInfo.name)
          .filter((name) => name !== 'temporal-system');
      })
      .as('namespaces');

    cy.wait('@workflows-api');
    cy.wait('@namespaces-api');

    cy.get('.namespace-select').as('select');
  });

  it('have the correct namespaces in the dropdown when using navigation header', () => {
    cy.viewport(1500, 600);
    cy.get('@select').find('option').should('have.length', 2);
    cy.get('@namespaces').then((namespaces) => {
      for (const namespace of namespaces) {
        cy.get('@select').select(namespace);
        cy.get('@select').should('have.value', namespace);
      }
    });
  });
  it('have the correct namespaces in the dropdown when using hamburger header', () => {
    cy.viewport(900, 600);
    cy.get('[data-test="hamburger-icon"]').click();
    cy.get('.action')
      .find('.namespace-select')
      .find('option')
      .should('have.length', 2);
  });
});
