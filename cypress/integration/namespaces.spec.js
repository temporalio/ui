const namespaces = ['default', 'some-other-namespace'];

describe('Namespaces page', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit('/namespaces');

    cy.fixture('namespaces.json')
      .then(({ namespaces }) => {
        return namespaces
          .map((n) => n.namespaceInfo.name)
          .filter((name) => name !== 'temporal-system');
      })
      .as('namespaces');

    cy.wait('@namespaces-api');
  });

  it('have the correct namespaces in the dropdown when using navigation header', () => {
    cy.get('h1').contains('Namespaces');
    cy.get(':nth-child(1) > td').contains(namespaces[0]);
    cy.get(':nth-child(2) > td').contains(namespaces[1]);
  });
});

describe('Namespaces button', () => {
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

    cy.get('[data-testid="namespaces-button"]').as('namespaces-button');
  });

  it('have the correct namespaces in the dropdown when using navigation header', () => {
    cy.get('@namespaces-button').click();
    cy.get('[data-testid="namespace-selector-title"]').contains('Namespaces');
    cy.get(':nth-child(1) > td').contains(namespaces[0]);
    cy.get(':nth-child(2) > td').contains(namespaces[1]);
  });
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

    cy.get('[data-testid="namespace-select-button"]').as(
      'namespace-select-button',
    );
  });

  it('have the correct namespaces in the dropdown when using navigation header', () => {
    cy.get('@namespace-select-button').click({ wait: 1000 });
    cy.get('[data-testid="namespace-select-header"]').contains(
      'Select a Namespace',
    );
  });

  it('navigates to the correct namespaces in the dropdown when using navigation header', () => {
    cy.get('@namespace-select-button').click({ wait: 1000 });
    cy.get('[data-testid="namespace-select-header"]').contains(
      'Select a Namespace',
    );
    cy.get('[data-testid="namespace-list"] > :nth-child(2)').click();
    cy.get('[data-testid="namespace-name"]').contains(namespaces[1]);
  });
});
