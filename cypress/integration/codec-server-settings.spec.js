describe('Set Codec Server Settings', () => {
  describe('Codec Server without site setting codec endpoint', () => {
    beforeEach(() => {
      cy.interceptApi();
      cy.clearLocalStorage();
      cy.setTopNavFeatureTag();

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

      cy.get('[data-testid="top-nav"]').as('header');
    });

    it('Enter invalid endpoint to show error and enter valid enpoint with confirm', () => {
      cy.get('@header').find('[data-testid="data-encoder-status"]').click();
      cy.get('[data-testid="data-encoder-title"]').contains('Codec Server');
      cy.get('[data-testid="data-encoder-endpoint-title"]').contains(
        'Remote Codec Endpoint',
      );
      cy.get('[data-testid="data-encoder-endpoint-input"]').should(
        'have.value',
        '',
      );
      cy.get('[data-testid="data-encoder-port-input"]').should(
        'have.value',
        '',
      );

      // Set invalid endpoint and get error
      cy.get('[data-testid="data-encoder-endpoint-input"]').type('abc123');

      cy.get('[data-testid="data-encoder-endpoint-error"]').contains(
        'Endpoint must start with http:// or https://',
      );

      cy.get('[data-testid="confirm-modal-button"]').should('be.disabled');

      // Clear endpoint and set valid endpoint
      cy.get('[data-testid="data-encoder-endpoint-input"]').clear();
      cy.get('[data-testid="data-encoder-endpoint-input"]').type(
        'http://test.com',
      );
      cy.get('[data-testid="confirm-modal-button"]').click();

      cy.get('@header')
        .find('[data-testid="data-encoder-status-configured"]')
        .should('be.visible');
      cy.get('@header')
        .find('[data-testid="data-encoder-status-configured"]')
        .click();

      cy.get('[data-testid="data-encoder-endpoint-input"]').should(
        'have.value',
        'http://test.com',
      );
    });

    it('Check pass access token and enter invalid endpoint to show error and enter valid enpoint with confirm', () => {
      cy.get('@header').find('[data-testid="data-encoder-status"]').click();
      cy.get('[data-testid="data-encoder-title"]').contains('Codec Server');
      cy.get('[data-testid="data-encoder-endpoint-title"]').contains(
        'Remote Codec Endpoint',
      );
      cy.get('[data-testid="data-encoder-endpoint-input"]').should(
        'have.value',
        '',
      );
      cy.get('[data-testid="data-encoder-port-input"]').should(
        'have.value',
        '',
      );

      // Set pass access token to true
      cy.get('.checkmark').click();

      cy.get('[data-testid="data-encoder-endpoint-error"]').contains(
        'Endpoint must be https:// if passing access token',
      );

      cy.get('[data-testid="data-encoder-endpoint-input"]').type(
        'http://test.com',
      );
      cy.get('[data-testid="confirm-modal-button"]').should('be.disabled');

      cy.get('[data-testid="data-encoder-endpoint-error"]').contains(
        'Endpoint must be https:// if passing access token',
      );

      cy.get('[data-testid="data-encoder-endpoint-input"]').clear();
      cy.get('[data-testid="data-encoder-endpoint-input"]').type(
        'https://test.com',
      );
      cy.get('[data-testid="confirm-modal-button"]').click();

      cy.get('@header')
        .find('[data-testid="data-encoder-status-configured"]')
        .should('be.visible');
      cy.get('@header')
        .find('[data-testid="data-encoder-status-configured"]')
        .click();

      cy.get('[data-testid="data-encoder-endpoint-input"]').should(
        'have.value',
        'https://test.com',
      );
    });

    it('Enter port with confirm', () => {
      cy.get('@header').find('[data-testid="data-encoder-status"]').click();
      cy.get('[data-testid="data-encoder-title"]').contains('Codec Server');
      cy.get('[data-testid="data-encoder-endpoint-title"]').contains(
        'Remote Codec Endpoint',
      );
      cy.get('[data-testid="data-encoder-endpoint-input"]').should(
        'have.value',
        '',
      );
      cy.get('[data-testid="data-encoder-port-input"]').should(
        'have.value',
        '',
      );

      cy.get('[data-testid="data-encoder-port-input"]').type('3456');
      cy.get('[data-testid="confirm-modal-button"]').click();

      cy.get('@header')
        .find('[data-testid="data-encoder-status-configured"]')
        .should('be.visible');

      cy.get('@header')
        .find('[data-testid="data-encoder-status-configured"]')
        .click();
      cy.get('[data-testid="data-encoder-port-input"]').should(
        'have.value',
        '3456',
      );
    });
  });

  describe('Codec Server with site setting codec endpoint', () => {
    beforeEach(() => {
      cy.interceptApi();
      cy.clearLocalStorage();
      cy.setTopNavFeatureTag();

      cy.intercept(Cypress.env('VITE_API_HOST') + '/api/v1/settings*', {
        Auth: { Enabled: false, Options: null },
        Codec: {
          Endpoint: 'http://www.site-setting.com',
        },
      }).as('settings-api');

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

      cy.get('[data-testid="top-nav"]').as('header');
    });

    it('Enter invalid endpoint to show error and enter valid enpoint with confirm', () => {
      cy.get('@header')
        .find('[data-testid="data-encoder-status-configured"]')
        .click();
      cy.get('[data-testid="data-encoder-title"]').contains('Codec Server');
      cy.get('[data-testid="data-encoder-endpoint-title"]').contains(
        'Remote Codec Endpoint',
      );

      cy.get('[data-testid="data-encoder-site-endpoint"]').contains(
        'http://www.site-setting.com',
      );

      cy.get('[data-testid="data-encoder-endpoint-input"]').should(
        'have.value',
        '',
      );
      cy.get('[data-testid="data-encoder-port-input"]').should(
        'have.value',
        '',
      );

      // Set invalid endpoint and get error
      cy.get('[data-testid="data-encoder-endpoint-input"]').type('abc123');

      cy.get('[data-testid="data-encoder-endpoint-error"]').contains(
        'Endpoint must start with http:// or https://',
      );

      cy.get('[data-testid="confirm-modal-button"]').should('be.disabled');

      // Clear endpoint and set valid endpoint
      cy.get('[data-testid="data-encoder-endpoint-input"]').clear();
      cy.get('[data-testid="data-encoder-endpoint-input"]').type(
        'http://test.com',
      );
      cy.get('[data-testid="confirm-modal-button"]').click();

      cy.get('@header')
        .find('[data-testid="data-encoder-status-configured"]')
        .should('be.visible');
      cy.get('@header')
        .find('[data-testid="data-encoder-status-configured"]')
        .click();

      cy.get('[data-testid="data-encoder-endpoint-input"]').should(
        'have.value',
        'http://test.com',
      );
    });
  });
});
