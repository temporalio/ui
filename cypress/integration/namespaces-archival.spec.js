describe('Archival disabled page', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit('/namespaces/default/archival');

    cy.wait('@namespace-api');
  });

  it('have the correct title on page', () => {
    cy.get('[data-cy="archived-disabled-title"]').should(
      'contain',
      'This namespace is currently not enabled for archival.',
    );
  });
});

describe('Archival enabled page', () => {
  beforeEach(() => {
    cy.interceptApi({ archived: true });

    cy.visit('/namespaces/some-other-namespace/archival');

    cy.wait('@workflows-archived-api');
    cy.wait('@namespace-api');
  });

  it('have the correct namespaces in the dropdown', () => {
    cy.get('[data-cy="archived-enabled-title"]').should(
      'contain',
      'Archived Workflows',
    );
  });
});
