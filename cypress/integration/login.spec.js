describe('Login page', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/settings*', {
      Auth: { Enabled: true, Options: null },
      DefaultNamespace: 'default',
      ShowTemporalSystemNamespace: false,
      FeedbackURL: '',
      NotifyOnNewVersion: true,
      Codec: { Endpoint: '', PassAccessToken: false },
    }).as('settings-api');
  });

  it('have the correct login title', () => {
    cy.visit('/namespaces/default/workflows');

    cy.wait('@settings-api');

    cy.url().should('include', `/login`);

    cy.get('[data-cy="navigation-header"]').as('header');

    cy.get('[data-cy="login-title"]').contains('Welcome back.');
    cy.get('[data-cy="login-info"]').contains(`Let's get you signed in.`);
    cy.get('[data-cy="login-button"]').contains('Continue to SSO');
    cy.get('@header')
      .find('[data-cy="data-encoder-status-configured"]')
      .should('not.exist');
  });

  it('doesn not redirect to login when user session exists', () => {
    cy.login();
    cy.visit('/');
    cy.wait('@settings-api');
    cy.wait('@namespaces-api');
    cy.wait('@workflows-api');

    cy.url().should('include', `/namespaces/default/workflows`);
  });
});
