describe('Login page', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit('/namespaces/default/workflows');

    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/settings*', {
      Auth: { Enabled: true, Options: null },
      DefaultNamespace: 'default',
      ShowTemporalSystemNamespace: false,
      FeedbackURL: '',
      NotifyOnNewVersion: true,
      Codec: { Endpoint: '', AccessToken: '' },
    }).as('settings-api');

    cy.wait('@settings-api');
    cy.wait('@user-api');
  });

  it('have the correct login title', () => {
    cy.get('[data-cy="login-title"]').contains('Welcome back.');
    cy.get('[data-cy="login-info"]').contains(`Let's get you signed in.`);
    cy.get('[data-cy="login-button"]').contains('Continue to SSO');
  });
});
