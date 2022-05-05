import settingsWithFeedbackUrl from '../fixtures/settings-feedback-url.json';

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
    cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/settings*', {
      fixture: 'settings-feedback-url.json',
    }).as('settings-api');

    cy.visit('/');
    cy.wait('@settings-api');

    const url = settingsWithFeedbackUrl.FeedbackURL;
    cy.get('[data-cy="give-feedback"]').should('have.attr', 'href', url);
  });
});
