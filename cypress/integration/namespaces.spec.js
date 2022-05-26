const namespaces = ['default', 'some-other-namespace'];

describe('Redirect to Workflow Executions', () => {
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

    cy.get('[data-cy="namespace-select-button"]').as('namespace-select-button');
  });

  it('have the correct namespaces in the dropdown when using navigation header', () => {
    cy.get('@namespace-select-button').click({ wait: 1000 });
    cy.get('[data-cy="namespace-list"]').children().should('have.length', 2);
  });
});
