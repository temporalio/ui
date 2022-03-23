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

    cy.wait('@list-workflows-api');
    cy.wait('@namespaces-api');

    cy.get('#namespace-select').as('select');
  });

  it('have the correct namespaces in the dropdown', () => {
    cy.get('@select').find('option').should('have.length', 2);
    cy.get('@namespaces').then((namespaces) => {
      for (const namespace of namespaces) {
        cy.get('@select').select(namespace);
        cy.get('@select').should('have.value', namespace);
      }
    });
  });
});
