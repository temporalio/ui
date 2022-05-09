import settingsFixture from '../fixtures/settings.json';

describe('Give Feedback link', () => {
  beforeEach(() => {
    cy.interceptApi();

    cy.visit('/');
    cy.wait('@settings-api');
  });

  it('should link to Temporal UI Github issues by default', () => {
    cy.get('[data-cy="give-feedback"]').should(
      'have.attr',
      'href',
      'https://github.com/temporalio/ui/issues/new/choose',
    );
  });

  it('should link to custom link if set in settings', () => {
    const feedbackUrl = 'internal-support-forum';

    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/settings*', {
      ...settingsFixture,
      FeedbackURL: feedbackUrl,
    }).as('settings-api');

    cy.visit('/');
    cy.wait('@settings-api');

    cy.get('[data-cy="give-feedback"]').should(
      'have.attr',
      'href',
      feedbackUrl,
    );
  });
});
